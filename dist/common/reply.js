"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateBotResponse = void 0;
const anthropic_1 = require("@langchain/anthropic");
const pinecone_1 = require("@pinecone-database/pinecone");
const openai_1 = require("@langchain/openai");
const pinecone_2 = require("@langchain/pinecone");
const combine_documents_1 = require("langchain/chains/combine_documents");
const prompts_1 = require("@langchain/core/prompts");
const messages_1 = require("@langchain/core/messages");
const user_1 = require("./user");
const pinecone = new pinecone_1.Pinecone();
const chat = new anthropic_1.ChatAnthropic({
    temperature: 0.9,
    model: "claude-3-sonnet-20240229",
    maxTokens: 1024,
});
function generateBotResponse(shopDomain, messages) {
    return __awaiter(this, void 0, void 0, function* () {
        const index = shopDomain.replace(/\./g, '-');
        const pineconeIndex = pinecone.Index(index);
        try {
            const email = yield (0, user_1.getEmail)(shopDomain);
            console.log("email");
            console.log(email);
            const instructions = yield (0, user_1.getCustomizationData)(email || "");
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
                botName = instructions.botName;
                greetingMessage = instructions.greetingMessage;
                toneAndStyle = instructions.toneAndStyle;
                userGuidance = instructions.userGuidance;
                positiveReinforcement = instructions.positiveReinforcement;
                errorHandling = instructions.errorHandling;
                politeness = instructions.politeness;
                clarityAndSimplicity = instructions.clarityAndSimplicity;
                personalization = instructions.personalization;
                responseLength = instructions.responseLength;
                clarificationPrompt = instructions.clarificationPrompt;
                apologyAndRetryAttempt = instructions.apologyAndRetryAttempt;
                errorMessageStyle = instructions.errorMessageStyle;
            }
            const SYSTEM_TEMPLATE = `Welcome to the ${shopDomain} Virtual Shopping Assistant! This assistant is designed to provide you with a seamless and personalized shopping experience. Below are the guidelines and context for assisting our valued customers:
        You only need to answer questions related to the store
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
            const prompt1 = `Given the above conversation, generate a search query to look up in order to get information relevant to the conversation.Include all the keywords for the search purpose. Give more weightage to last user messages Only respond with the query, nothing else.`;
            const queryGenerator = prompts_1.ChatPromptTemplate.fromMessages([
                ["system", prompt1],
                new prompts_1.MessagesPlaceholder("messages"),
            ]);
            const queryChain = queryGenerator.pipe(chat);
            const messagesArray = [];
            const len = messages.length;
            for (let i = 0; i < len; i++) {
                if (messages[i][0] == "user") {
                    messagesArray.push(new messages_1.HumanMessage(messages[i][1]));
                }
                else {
                    messagesArray.push(new messages_1.AIMessage(messages[i][1]));
                }
            }
            const res = yield queryChain.invoke({
                messages: messagesArray
            });
            console.log(res.content);
            const vectorstore = yield pinecone_2.PineconeStore.fromExistingIndex(new openai_1.OpenAIEmbeddings(), { pineconeIndex });
            const retriever = vectorstore.asRetriever(4);
            const docs = yield retriever.invoke(String(res.content));
            console.log(docs);
            const questionAnsweringPrompt = prompts_1.ChatPromptTemplate.fromMessages([
                [
                    "system",
                    SYSTEM_TEMPLATE,
                ],
                new prompts_1.MessagesPlaceholder("messages"),
            ]);
            const documentChain = yield (0, combine_documents_1.createStuffDocumentsChain)({
                llm: chat,
                prompt: questionAnsweringPrompt,
            });
            const lastReply = yield documentChain.invoke({
                messages: messagesArray,
                context: docs,
            });
            console.log(lastReply);
            return lastReply;
        }
        catch (error) {
            console.log(error);
            return "Not availabel right now";
        }
    });
}
exports.generateBotResponse = generateBotResponse;
