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

        const SYSTEM_TEMPLATE = `
        You are an AI shopping assistant for ${shopDomain}. Your task is to help customers by answering their questions about the store and its products. To do this, you will be provided with two pieces of information:
        
        <KnowledgeBase>
        {context}
        </KnowledgeBase>

        This knowledge base contains all the information you are allowed to use to answer customer queries. Do not use any information outside of what is provided in the knowledge base.
        
        <instructions>
        YourName: ${botName}
        responseLength should be ${responseLength}
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
        </instructions>

        To generate a good answer, first carefully read the knowledge base. Then search through it to find the pieces of information that are most relevant to answering the customer's specific query. Combine these pieces of information together into a coherent answer.

        Format your answer in HTML. Use appropriate HTML headings and tags to structure the information. Add line breaks where needed to keep the text readable. If you are suggesting a specific product to the customer and an image of that product is available in the knowledge base, include the image in your answer, width and height of the image should be less than 260.
        
        Write your final answer inside <answer> tags.
        
        Remember, you MUST answer the query using only the information provided in the knowledge base. Do not add any additional information. If the query cannot be answered based on the knowledge base, say "I do not have enough information to answer this query."
       
    
        `;
        // Answer will be used as an HTML content so format answer accordingly.
        // For heading use <h3></h3> tag

        // Answer should be in a format where it looks good, if image sorce is there put the image link in the src of a img tag so that it can be displayed, width and height must be under 200,after image text should be in next line, also add proper line breaks and bold heading for nice formatting, 
        // image should be centered from the parent div
        // after every image insert a <br></br> tag for line break
        // If necessary , you can answer in numbered points, so that it looks good.
        // Dont use long paragraphs, break paragraphs in different points

        // Answer the user's questions based on the below given Knowledge Base. 
        // If the Knowled base doesn't contain any relevant information to the question or you dont have anything to answer, don't make something up and ask for more clarification , if then also you dont have any answer then just say I dont know":

        console.log(SYSTEM_TEMPLATE)
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