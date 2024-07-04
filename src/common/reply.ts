require('dotenv').config();
import { ChatOpenAI } from "@langchain/openai";
import { START } from "@langchain/langgraph";
import { SqliteSaver } from "@langchain/langgraph/checkpoint/sqlite"
import { AIMessageChunk, BaseMessage, HumanMessage } from "@langchain/core/messages";
import { StateGraphArgs } from "@langchain/langgraph";
import {  RunnableConfig } from "@langchain/core/runnables";
import { StateGraph } from "@langchain/langgraph";
import { publishStoreMssg } from "./pubsubPublisher.js";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { ToolNode, toolsCondition } from "@langchain/langgraph/prebuilt"
import { retrieverTool } from "./tools/retriever.js";
import { ChatGenerationChunk } from "@langchain/core/outputs";
import { TicketEscalatorTool } from "./tools/ticketescalator.js";

export const chatModel = new ChatOpenAI(
  {
    azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_API_CHAT_DEPLOYMENT_NAME,
    azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_API_INSTANCE_NAME,
    azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
    azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_CHAT_VERSION,
  }
);
export interface IState {
  messages: BaseMessage[]
}
const graphState: StateGraphArgs<IState>["channels"] = {
  messages: {
    value: (x: BaseMessage[], y: BaseMessage[]) => x.concat(y),
    default: () => [],
  },
};

const assistantPrompt = `
You are a helpful customer support assistant for a brand called {shopDomain}.
Use the provided tools to search for the information regarding the company to solve the user's query.
If user is not satisfied then ask for more informaation from user to answer their query.
Even then if unable to answer ask user if you can escalate ticket to a human operator.
If User agrees then use the escalation tool to escalate the ticket.

`
const prompt = ChatPromptTemplate.fromMessages([
  ["system", assistantPrompt],
  new MessagesPlaceholder("messages")
])
const temp = prompt.pipe(chatModel.bindTools([retrieverTool, TicketEscalatorTool]))
async function agent(state: IState, config?: RunnableConfig,) {
  const { messages } = state;
  const shopDomain = config?.configurable?.shopDomain
  const response = await temp.invoke({ messages: messages, shopDomain: shopDomain }, config);
  return { messages: [response] };
};


const workflow = new StateGraph<IState, unknown, string>({
  channels: graphState,
})

  .addNode("agent", agent)
  .addNode("safeTools", new ToolNode([retrieverTool]))
  .addNode("sensitiveTools", new ToolNode([TicketEscalatorTool]))
  .addConditionalEdges("agent", routeTools)
  .addEdge("safeTools", "agent")
  .addEdge("sensitiveTools", "agent")


workflow.addEdge(START, "agent");
type NextNode = 'safeTools' | 'sensitiveTools' | '__end__';
function routeTools(state: IState): NextNode {
  const next_node = toolsCondition(state);
  // console.log(next_node)
  if (next_node === '__end__') {
    return '__end__';
  }

  const ai_message = state.messages[state.messages.length - 1] as AIMessageChunk;
  console.log(ai_message)
  const first_tool_call = ai_message.tool_calls;
  console.log(first_tool_call)
  if (first_tool_call && first_tool_call[0].name === "TicketEscalatorTool") {
    return 'sensitiveTools';
  }
  return 'safeTools';
}


const memory = SqliteSaver.fromConnString(process.env.SQLITE_URL || "/home/ubuntu/sqlite/maindb.sqlite");
const persistentGraph = workflow.compile({ checkpointer: memory, interruptBefore: ["sensitiveTools"] });


export async function replytriaal (ticketId: string, query: string, shopDomain: string, io: any, roomName: string, isContinue: boolean, email?: string) {
  const output: { [key: string]: string } = {};
  // await publishStoreMssg(ticketId, "user", query);
  let config = { configurable: { thread_id: ticketId, shopDomain: trimMyShopifyDomain(shopDomain), io: io, roomName: roomName, userEmail: email } };
  let inputs;
  if (isContinue) {
    inputs = null
  }
  else {
    inputs = { messages: new HumanMessage(query) };
  }
  for await (
    const event of await persistentGraph.streamEvents(inputs, {
      ...config,
      streamMode: "values",
      version: "v1",
    })
  ) {

    if (event.event === "on_llm_stream") {
      let chunk: ChatGenerationChunk = event.data?.chunk;
      let msg = chunk.message as AIMessageChunk
      if (msg.id) {
        const key: string = msg.id;
        if (msg.content) {
          output[key] += msg.content
          // console.log(output)
          io.in(roomName).emit('streamChunk', { id: key, message: output[key] })
          // console.log(`msg : content : $e{msg.content}`);
        }
      }
    }
    else if (event.event === "on_llm_end") {
      let msg = event.data;
      // console.log(msg)

    }
  }
  let snapshot = await persistentGraph.getState(config)
  if (snapshot.next[0] === 'sensitiveTools') {
    io.in(roomName).emit('showInput', { fields: ["email"] })
  }

}

export function trimMyShopifyDomain(inputString: string) {
  const suffix = ".myshopify.com";
  if (inputString.endsWith(suffix)) {
    return inputString.slice(0, -suffix.length);
  }
  return inputString;
}