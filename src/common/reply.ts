require('dotenv').config();
import { END } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { START } from "@langchain/langgraph";
import { SqliteSaver } from "@langchain/langgraph/checkpoint/sqlite"
import { AIMessage, BaseMessage, HumanMessage, isAIMessage } from "@langchain/core/messages";
import { StateGraphArgs } from "@langchain/langgraph";
import { Runnable, RunnableConfig, RunnableLambda } from "@langchain/core/runnables";
import { StateGraph } from "@langchain/langgraph";
import { publishStoreMssg } from "./pubsubPublisher.js";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { ToolNode, toolsCondition } from "@langchain/langgraph/prebuilt"
import { retrieverTool } from "./tools/retriever.js";
import { AgentExecutor, createOpenAIToolsAgent } from "langchain/agents";
import { JsonOutputToolsParser } from "langchain/output_parsers";


import { IterableReadableStream } from "@langchain/core/utils/stream";

export const chatModel = new ChatOpenAI(
  {
    azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_API_CHAT_DEPLOYMENT_NAME,
    azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_API_INSTANCE_NAME,
    azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
    azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_CHAT_VERSION,
  }
);
export interface IState {
  messages: BaseMessage[];
  shopInfo: string
}
const graphState: StateGraphArgs<IState>["channels"] = {
  messages: {
    value: (x: BaseMessage[], y: BaseMessage[]) => x.concat(y),
    default: () => [],
  },
  shopInfo: {
    value: (x?: string, y?: string) => y ?? x ?? "",
    default: () => "",
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
const temp = prompt.pipe(chatModel.bindTools([retrieverTool]))
async function agent(state: IState, config?: RunnableConfig,) {
  const { messages } = state;
  // console.log("messages")
  // console.log(messages)
  // console.log("shopDomain")
  // console.log(config?.configurable?.shopDomain)
  const shopDomain = config?.configurable?.shopDomain
  const response = await temp.invoke({ messages: messages, shopDomain: shopDomain }, config);
  // console.log("response")
  // console.log(response)

  return { messages: [response] };
};


async function fetchInfo(state: IState, config: RunnableConfig) {

  console.log("---------Fetching Info------------------")
  return { shopInfo: config?.configurable?.shopDomain }
}

const workflow = new StateGraph<IState, unknown, string>({
  channels: graphState,
})

  .addNode("fetch_info", fetchInfo)
  .addNode("agent", agent)
  .addNode("tools", new ToolNode([retrieverTool]))
  .addConditionalEdges("agent", toolsCondition)
  .addEdge("tools", "agent")
  .addEdge("fetch_info", "agent")


workflow.addEdge(START, "fetch_info");


const app = workflow.compile();

const memory = SqliteSaver.fromConnString(process.env.SQLITE_URL || "/home/ubuntu/sqlite/maindb.sqlite");
const persistentGraph = workflow.compile({ checkpointer: memory });


export async function replytriaal(ticketId: string, query: string, shopDomain: string, io: any, roomName: string) {
  // await publishStoreMssg(ticketId, "user", query);
  let config = { configurable: { thread_id: ticketId, shopDomain: shopDomain } };
  const inputs = { messages: new HumanMessage(query) };
  // const events: IterableReadableStream<any> = await persistentGraph.stream(inputs, { ...config, streamMode: "values" })
  for await (
    const { messages } of await persistentGraph.stream(inputs, {
      ...config,
      streamMode: "values",
    })
  ) {
    const msg = messages[messages.length - 1];
    if (msg?.content) {
      io.in(roomName).emit('receiveMessage', { sender: 'bot', message: msg.content });
    }
    else if (msg?.tool_calls.length > 0) {
      console.log(msg)
    }
    else {
      console.log("------------don't know what it is--------------")
      console.log(msg)
    }
  }

  // for await (const {messages} of await persistentGraph.stream(inputs, { ...config, streamMode: "values", })) {
  //   console.log("after execution messages")
  //   console.log(messages)
  //   let msg = messages[messages?.length - 1];
  //   if (msg?.content) {
  //     console.log(msg.content);
  //     await publishStoreMssg(ticketId, "ai", msg.content);
  //     return msg.content
  //   } else if (msg?.tool_calls?.length > 0) {
  //     console.log(msg.tool_calls);
  //   } else {
  //     console.log(msg);
  //   }
  //   console.log("-----\n");
  // }
  // return processStream(ticketId, inputs, config);

}
