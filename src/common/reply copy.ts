require('dotenv').config();
import { MongoClient } from "mongodb";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { END } from "@langchain/langgraph";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { tool } from "@langchain/core/tools";
import { START } from "@langchain/langgraph";
import { SqliteSaver } from "@langchain/langgraph/checkpoint/sqlite"
import { z } from "zod";
import { pull } from "langchain/hub";
import { AIMessage, BaseMessage, FunctionMessage, } from "@langchain/core/messages";
import { convertToOpenAIFunction, convertToOpenAITool } from "@langchain/core/utils/function_calling";
export const embeddingModel = new OpenAIEmbeddings(
  {
    azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_API_EMBEDDING_DEPLOYMENT_NAME || "",
    azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_API_INSTANCE_NAME || "",
    azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY || "",
    azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_VERSION || ""
  }
);
export const chatModel = new ChatOpenAI(
  {
    azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_API_CHAT_DEPLOYMENT_NAME,
    azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_API_INSTANCE_NAME,
    azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
    azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_CHAT_VERSION,
  }
);
const adderSchema = z.object({
  question: z.string(),
});
const client = new MongoClient(process.env.MONGODB_ATLAS_URI || "");
const collection = client.db(process.env.MONGO_DB_NAME).collection("may15ka.myshopify.com");
const retrieverTool = tool(
  async (input): Promise<any> => {
    // console.log(client)
    console.log(process.env.MONGO_DB_NAME)
    const vectorStore = new MongoDBAtlasVectorSearch(embeddingModel, {
      collection,
      indexName: "vector_index"
    });
    console.log(input.question)
    const resultOne = await vectorStore.similaritySearch(input.question, 1);
    console.log(resultOne);
    return "resultOne";
  },
  {
    name: "adder",
    description: "Adds two numbers together",
    schema: adderSchema,
  }
);
// function shouldRetrieve(state: BaseMessage[]) {
//   console.log("---DECIDE TO RETRIEVE---");
//   const lastMessage = state[state.length - 1];
//   // If there is no function call then we finish.
//   if (!lastMessage.additional_kwargs.function_call) {
//     console.log("---DECISION: DO NOT RETRIEVE / DONE---");
//     return END;
//   }
//   console.log("---DECISION: RETRIEVE---");
//   return "retrieve";
// }

const all_tools = [retrieverTool];
import { ToolExecutor } from "@langchain/langgraph/prebuilt";
import { StringOutputParser } from "@langchain/core/dist/output_parsers";
const toolExecutor = new ToolExecutor({
  tools: [retrieverTool]
});

// async function retrieve(state: Array<BaseMessage>) {
//   console.log("---EXECUTE RETRIEVAL---");
//   const lastMessage = state[state.length - 1];
//   const action = {
//     tool: lastMessage.additional_kwargs.function_call?.name ?? "",
//     toolInput: JSON.parse(
//       lastMessage.additional_kwargs.function_call?.arguments ?? "{}",
//     ),
//   };
//   // We call the tool_executor and get back a response.
//   const response = await toolExecutor.invoke(action);
//   // We use the response to create a FunctionMessage.
//   const functionMessage = new FunctionMessage({
//     name: action.tool,
//     content: response,
//   });
//   return [functionMessage];
// }

// async function agent(state: Array<BaseMessage>) {
//   console.log("---CALL AGENT---");
//   const functions = all_tools.map((tool) => convertToOpenAIFunction(tool));
//   const model = new ChatOpenAI({
//     modelName: "gpt-4-0125-preview",
//     temperature: 0,
//     streaming: true,
//   }).bind({
//     functions,
//   });

//   const response = await model.invoke(state);
//   // We can return just the response because it will be appended to the state.
//   return [response];
// }

// async function rewrite(state: Array<BaseMessage>) {
//   console.log("---TRANSFORM QUERY---");
//   const question = state[0].content as string;
//   const prompt = ChatPromptTemplate.fromTemplate(
//     `Look at the input and try to reason about the underlying semantic intent / meaning. \n 
//   Here is the initial question:
//   \n ------- \n
//   {question} 
//   \n ------- \n
//   Formulate an improved question:`,
//   );

//   // Grader
//   const model = new ChatOpenAI({
//     modelName: "gpt-4-0125-preview",
//     temperature: 0,
//     streaming: true,
//   });
//   const response = await prompt.pipe(chatModel).invoke({ question });
//   return [response];
// }

// async function generate(state: Array<BaseMessage>) {
//   console.log("---GENERATE---");
//   const question = state[0].content as string;
//   const sendLastMessage = state[state.length - 2];

//   const docs = sendLastMessage.content as string;

//   const prompt = await pull<ChatPromptTemplate>("rlm/rag-prompt");

//   const llm = new ChatOpenAI({
//     modelName: "gpt-3.5-turbo",
//     temperature: 0,
//     streaming: true,
//   });

//   const ragChain = prompt.pipe(llm).pipe(new StringOutputParser());

//   const response = await ragChain.invoke({
//     context: docs,
//     question,
//   });

//   return [new AIMessage(response)];
// }
import { StateGraphArgs } from "@langchain/langgraph";

interface IState {
  messages: BaseMessage[];
}


const graphState: StateGraphArgs<IState>["channels"] = {
  messages: {
    value: (x: BaseMessage[], y: BaseMessage[]) => x.concat(y),
    default: () => [],
  },
};
import { RunnableConfig, RunnableLambda } from "@langchain/core/runnables";

import { StateGraph } from "@langchain/langgraph";


const routeMessage = (state: IState) => {
  const { messages } = state;
  const lastMessage = messages[messages.length - 1] as AIMessage;
  // If no tools are called, we can finish (respond to the user)
  if (!lastMessage.tool_calls?.length) {
    return END;
  }
  // Otherwise if there is, we continue and call the tools
  return "tools";
};

const callModel = async (
  state: IState,
  config?: RunnableConfig,
) => {
  const { messages } = state;
  const response = await chatModel.invoke(messages, config);
  return { messages: [response] };
};
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { publishStoreMssg } from "./pubsubPublisher";



// Define a new graph
const workflow = new StateGraph<IState>({
  channels: graphState,
})
  .addNode("agent", callModel)
  // .addNode("tools", toolNode)
  .addEdge(START, "agent")
  .addConditionalEdges("agent", routeMessage)
// .addEdge("tools", "agent");



workflow.addEdge(START, "agent");

const app = workflow.compile();

// const memory = SqliteSaver.fromConnString(process.env.SQLITE_URL || "");
const memory = SqliteSaver.fromConnString(process.env.SQLITE_URL || "/home/ubuntu/sqlite/maindb.sqlite");
const persistentGraph = workflow.compile({ checkpointer: memory });



// function create_toll_node_with_fallback() {

// return new ToolNode([retrieverTool]).withFallbacks([RunnableLambda()])

// }


export async function replytriaal(ticketId: string, query: string) {
  await publishStoreMssg(ticketId, "user", query);
  let config = { configurable: { thread_id: ticketId } };
  const inputs = { messages: [["user", query]] };
  for await (
    const { messages } of await persistentGraph.stream(inputs, {
      ...config,
      streamMode: "values",
    })
  ) {
    let msg = messages[messages?.length - 1];
    if (msg?.content) {
      console.log(msg.content);
      await publishStoreMssg(ticketId, "ai", msg.content);
      return msg.content
    } else if (msg?.tool_calls?.length > 0) {
      console.log(msg.tool_calls);
    } else {
      console.log(msg);
    }
    console.log("-----\n");
  }
}
