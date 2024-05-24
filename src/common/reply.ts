import { ChatAnthropic } from "@langchain/anthropic";
import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import {
    ChatPromptTemplate,
    MessagesPlaceholder,
} from "@langchain/core/prompts";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { getCustomizationData, getEmail } from "./user";
import { ChatOpenAI } from "@langchain/openai";
import redis from "../lib/redis";
import { z } from "zod";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import {
    RunnablePassthrough,
} from "@langchain/core/runnables";

const pinecone = new Pinecone();
const chat = new ChatAnthropic({
    temperature: 0.9,
    model: "claude-3-haiku-20240307",
    maxTokens: 1024,
});
const chat2 = new ChatAnthropic({
    temperature: 0.3,
    model: "claude-3-haiku-20240307",
    maxTokens: 1024,
});
// const chat = new ChatOpenAI({
//     model: "gpt-3.5-turbo-1106", // Defaults to "gpt-3.5-turbo-instruct" if no model provided.
//     temperature: 0.9,
//     apiKey: process.env.OPENAI_API_KEY, // In Node.js defaults to process.env.OPENAI_API_KEY
//   });

export async function generateBotResponse(shopDomain: string, messages: any, io: any, conversationId: string) {
    const index = shopDomain.replace(/\./g, '-');
    const pineconeIndex = pinecone.Index(index);

    try {
        const { messagesArray1, messagesForPrompt } = formatMessages(messages);
        // console.log(messagesArray1)
        const prompt2 = await getMainPrompt(shopDomain) || "";
        const prompt1 = `
        ${messagesForPrompt}
        Given the above conversation, generate a search query to look up in order to get information relevant to the conversation. Only respond with the query, nothing else.If only one message is there return message as it is`;

        io.in(conversationId).emit('status', { status: 'thinking' });
        const vectorstore = await PineconeStore.fromExistingIndex(
            new OpenAIEmbeddings(),
            { pineconeIndex }
        );
        const retriever = vectorstore.asRetriever(8);
        const queryGenerator = PromptTemplate.fromTemplate(prompt1).pipe(chat2).pipe(new StringOutputParser()).pipe(retriever);
        const questionAnsweringPrompt = ChatPromptTemplate.fromMessages([
            [
                "system",
                prompt2,
            ],
            new MessagesPlaceholder("messages"),
        ]);
        const documentChain = await createStuffDocumentsChain({
            llm: chat,
            prompt: questionAnsweringPrompt,
        });
        const conversationalRetrievalChain = RunnablePassthrough.assign({
            context: queryGenerator,
        }).assign({
            answer: documentChain,
        });

        const { answer } = await conversationalRetrievalChain.invoke({
            messages: messagesArray1,
        })
        io.in(conversationId).emit('status', { status: 'writing' });
        // console.log("lastReply")
        return {
            reply: answer,
            product: []
        };
    } catch (error) {
        console.log(error)
        return "Not available right now due to some technical issues. Our Apologies for that"
    }
}
export async function reply(ticketId: string, messages: string[][], domain: string, conversationId: string, timestamp: string, userDetails: any, io: any) {
    console.log(messages)
    console.log(domain)
    console.log(conversationId)
    console.log(ticketId)
    try {
        await redis.lpush('create-ticket', JSON.stringify({
            ticketId: ticketId,
            shop: domain,
            conversationId: conversationId,
            time: timestamp
        }));
        await redis.lpush('create-conv', JSON.stringify({
            shop: domain,
            id: conversationId,
            time: timestamp
        }));

        await redis.lpush('create-mssg', JSON.stringify({
            convId: conversationId,
            timestamp: timestamp,
            sender: 'user',
            text: messages[messages.length - 1][1]
        }));
        const botResponse = await generateBotResponse(domain, messages, io, conversationId);
        await redis.lpush('create-mssg', JSON.stringify({
            convId: conversationId,
            timestamp: new Date(),
            sender: 'bot',
            text: JSON.stringify(botResponse)
        }));
        return botResponse
    } catch (error) {
        console.log(error)
        return 'Internal Server Error';
    }
}

function formatMessages(messages: any) {
    const len = messages.length;
    let messagesArray1 = []
    let messagesForPrompt = []
    for (let i = 0; i < len; i++) {
        if (!messages[i][1]) continue
        if (messages[i][0] == "user") {
            messagesArray1.push(new HumanMessage(messages[i][1]));
            messagesForPrompt.push("user : " + messages[i][1])
        }
        else {
            messagesArray1.push(new AIMessage(messages[i][1].reply));
            messagesForPrompt.push("Ai Assistant : " + (messages[i][1].reply))
        }
    }
    return {
        messagesArray1,
        messagesForPrompt
    }
}

async function getMainPrompt(shopDomain: string) {
    try {
        const email = await getEmail(shopDomain)
        // console.log("email")
        // console.log(email)
        const instructions = await getCustomizationData(email || "")
        let botName;
        let greetingMessage;
        let toneAndStyle;
        let userGuidance;
        let positiveReinforcement;
        let errorHandling;
        let politeness;
        let clarityAndSimplicity;
        let personalization;
        let responseLength;
        let clarificationPrompt;
        let apologyAndRetryAttempt;
        let errorMessageStyle;

        if (instructions) {
            botName = instructions.botName
            greetingMessage = instructions.greetingMessage
            toneAndStyle = instructions.toneAndStyle
            userGuidance = instructions.userGuidance
            positiveReinforcement = instructions.positiveReinforcement
            errorHandling = instructions.errorHandling
            politeness = instructions.politeness
            clarityAndSimplicity = instructions.clarityAndSimplicity
            personalization = instructions.personalization
            responseLength = instructions.responseLength
            clarificationPrompt = instructions.clarificationPrompt
            apologyAndRetryAttempt = instructions.apologyAndRetryAttempt
            errorMessageStyle = instructions.errorMessageStyle

        }
        const shopName = shopDomain.slice(-14);

        const prompt2 = `
        You are ${botName}, AI shopping assistant for brand called ${shopName}. Your task is to help customers by answering their questions about the store and its products. To do this, you will be provided with two pieces of information:
        
        <KnowledgeBase>
        {context}
        </KnowledgeBase>
        
        This knowledge base contains all the information you are allowed to use to answer customer queries. Do not use any information outside of what is provided in the knowledge base.
        
        <instructions>
        response length : ${responseLength}
        greetingMessage: ${greetingMessage}
        toneAndStyle: ${toneAndStyle}
        personalization: ${personalization}
        clarificationPrompt: ${clarificationPrompt}
        apologyAndRetryAttempt: ${apologyAndRetryAttempt}
        errorMessageStyle: ${errorMessageStyle}
        </instructions>
        
        To generate a good answer, first carefully read the knowledge base. Then search through it to find the pieces of information that are most relevant to answering the customer's specific query. Combine these pieces of information together into a coherent answer.
    
        Remember, you MUST answer the query using only the information provided in the knowledge base. Do not add any additional information. If the query cannot be answered based on the knowledge base, use apolofy and Retry attempt instructoin from the merchant.
        From the knowledge Base only take information, Don't use formatting of the knowledgeBase, also give only necessary information from the knowledgeBase.
        
        Response length guidelines:
        - If the response length is 'short', you must answer  under 30 words.
        - If the response length is 'medium', you must answer under 50 words but more than 30 words.
        - If the response length is 'long', you must answer with more than 50 words but under 70 words.


        Dont provide exact number of inventory quantity, just say "this item is in stock" and if inventory quantity is 0 just say "out of stock for now"
        
        Strictly dont discuss about the source of knowledge or about the length of knowledge base
        `;
        return prompt2
    } catch (error) {
        console.log(error)
    }
}