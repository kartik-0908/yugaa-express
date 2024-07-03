import { tool } from "@langchain/core/tools";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { OpenAIEmbeddings } from "@langchain/openai";
import { MongoClient } from "mongodb";
import { z } from "zod";
import { IState } from "../reply.js";
const retriverSchema = z.object({
    question: z.string(),
    shopDomain: z.string()
});
const client = new MongoClient(process.env.MONGODB_ATLAS_URI || "");
const collection = client.db(process.env.MONGO_DB_NAME).collection(process.env.MONGO_DB_COLLECTION || "");
const embeddingModel = new OpenAIEmbeddings(
    {
        azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_API_EMBEDDING_DEPLOYMENT_NAME || "",
        azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_API_INSTANCE_NAME || "",
        azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY || "",
        azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_VERSION || ""
    }
);
export const answer = tool(
    async (input:{question: string, shopDomain: string}): Promise<any> => {
        console.log(process.env.MONGO_DB_NAME)
        const vectorStore = new MongoDBAtlasVectorSearch(embeddingModel, {
            collection
        });
        const retriever = vectorStore.asRetriever({
            filter:{
                preFilter:{
                    yugaa_shop:{
                        $eq: input.shopDomain
                    }
                }
            }
        })
        console.log(input.question)
        // const resultOne = await vectorStore.similaritySearch(input.question, 1);
        const resultOne = await retriever.invoke(input.question);
        console.log(resultOne);
        return "resultOne";
    },
    {
        name: "retrieverTool",
        description: "Finds relevant information about company to answer user query",
        schema: retriverSchema,
    }
);
