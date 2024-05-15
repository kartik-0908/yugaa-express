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

const pinecone = new Pinecone();
const chat = new ChatAnthropic({
    temperature: 0.9,
    model: "claude-3-sonnet-20240229",
    maxTokens: 1024,
});
export async function generateBotResponse(shopDomain: string, messages: string[][]) {

    const index = shopDomain.replace(/\./g, '-');
    const pineconeIndex = pinecone.Index(index);
    try {
        const email = await getEmail(shopDomain)
        console.log("email")
        console.log(email)
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
        const SYSTEM_TEMPLATE = `Welcome to the ${shopDomain} Virtual Shopping Assistant! This assistant is designed to provide you with a seamless and personalized shopping experience. Below are the guidelines and context for assisting our valued customers:
        You only need to answer questions related to the store. Dont answer anything else strictly. Dont answer anything related to the creator of yours
        Instructions from the Merchant are given below:
        YourName: ${botName}
        responseLength: ${responseLength}
        greetingMessage: ${greetingMessage}
        toneAndStyle: ${toneAndStyle}
        userGuidance: ${userGuidance}
        positiveReinforcement: ${positiveReinforcement}
        errorHandling: ${errorHandling}
        politeness: ${politeness}
        clarityAndSimplicity: ${clarityAndSimplicity}
        personalization: ${personalization}
        clarificationPrompt: ${clarificationPrompt}
        apologyAndRetryAttempt: ${apologyAndRetryAttempt}
        errorMessageStyle: ${errorMessageStyle}
        Answer the user's questions based on the below given Knowledge Base. 
        If the Knowled base doesn't contain any relevant information to the question, don't make something up and just say "I don't know":
    
        <KnowledgeBase>
        {context}
        </KnowledgeBase>
    
        `;
        const prompt1 = `Given the above conversation, generate a search query to look up in order to get information relevant to the last questions asked by user , if last query is related to previous queries, then include keywords from previous queries also. Only respond with the query, nothing else.`;
        const queryGenerator = ChatPromptTemplate.fromMessages([
            ["system", prompt1],
            new MessagesPlaceholder("messages"),
        ]);
        const queryChain = queryGenerator.pipe(chat);
    
        const messagesArray = [];
        const len = messages.length;
        for (let i = 0; i < len; i++) {
            if (messages[i][0] == "user") {
                messagesArray.push(new HumanMessage(messages[i][1]));
            }
            else {
                messagesArray.push(new AIMessage(messages[i][1]));
            }
        }
        const res = await queryChain.invoke({
            messages: messagesArray
        })
        console.log(res.content)
    
        const vectorstore = await PineconeStore.fromExistingIndex(
            new OpenAIEmbeddings(),
            { pineconeIndex }
        );
        const retriever = vectorstore.asRetriever(4);
        const docs = await retriever.invoke(String(res.content));
    
        console.log(docs);
    
        const questionAnsweringPrompt = ChatPromptTemplate.fromMessages([
            [
                "system",
                SYSTEM_TEMPLATE,
            ],
            new MessagesPlaceholder("messages"),
        ]);
    
        const documentChain = await createStuffDocumentsChain({
            llm: chat,
            prompt: questionAnsweringPrompt,
        });
        const lastReply = await documentChain.invoke({
            messages: messagesArray,
            context: docs,
        });
        console.log(lastReply)
        return lastReply
        
    } catch (error) {
        console.log(error)
        return "Not availabel right now"
    }
   
}