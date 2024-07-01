// import { ChatAnthropic } from "@langchain/anthropic";
// import {
//     ChatPromptTemplate,
// } from "@langchain/core/prompts";
// import { ChatOpenAI } from "@langchain/openai";
// import {
//   MessagesPlaceholder,
// } from "@langchain/core/prompts";
// import { StructuredTool } from "@langchain/core/tools";
// import { convertToOpenAITool } from "@langchain/core/utils/function_calling";

// const chat2 = new ChatAnthropic({
//     temperature: 0.3,
//     model: "claude-3-haiku-20240307",
//     maxTokens: 1024,
// });
// const chat = new ChatOpenAI({
//     model: "gpt-4o-2024-05-13", // Defaults to "gpt-3.5-turbo-instruct" if no model provided.
//     temperature: 0.9,
//     apiKey: process.env.OPENAI_API_KEY, // In Node.js defaults to process.env.OPENAI_API_KEY
// });

// async function createAgent({
//     llm,
//     tools,
//     systemMessage,
//   }: {
//     llm: ChatOpenAI;
//     tools: StructuredTool[];
//     systemMessage: string;
//   }){
//     const toolNames = tools.map((tool) => tool.name).join(", ");
//     const formattedTools = tools.map((t) => convertToOpenAITool(t));
  
//     let prompt = ChatPromptTemplate.fromMessages([
//       [
//         "system",
//         "You are a helpful AI assistant, collaborating with other assistants." +
//         " Use the provided tools to progress towards answering the question." +
//         " If you are unable to fully answer, that's OK, another assistant with different tools " +
//         " will help where you left off. Execute what you can to make progress." +
//         " If you or any of the other assistants have the final answer or deliverable," +
//         " prefix your response with FINAL ANSWER so the team knows to stop." +
//         " You have access to the following tools: {tool_names}.\n{system_message}",
//       ],
//       new MessagesPlaceholder("messages"),
//     ]);
//     prompt = await prompt.partial({
//       system_message: systemMessage,
//       tool_names: toolNames,
//     });
//     return prompt.pipe(llm.bind({ tools: formattedTools }));
//   }


//   import { BaseMessage } from "@langchain/core/messages";
//   import { StateGraphArgs } from "@langchain/langgraph";
  
//   interface AgentStateChannels {
//     messages: BaseMessage[];
//     // The agent node that last performed work
//     sender: string;
//   }
  
//   // This defines the object that is passed between each node
//   // in the graph. We will create different nodes for each agent and tool
//   const agentStateChannels: StateGraphArgs<AgentStateChannels>["channels"] = {
//     messages: {
//       value: (x?: BaseMessage[], y?: BaseMessage[]) => (x ?? []).concat(y ?? []),
//       default: () => [],
//     },
//     sender: {
//       value: (x?: string, y?: string) => y ?? x ?? "user",
//       default: () => "user",
//     },
//   };



















// // const chat = new ChatOpenAI({
// //     model: "gpt-4-1106-preview", // Defaults to "gpt-3.5-turbo-instruct" if no model provided.
// //     temperature: 0.9,
// //     apiKey: process.env.OPENAI_API_KEY, // In Node.js defaults to process.env.OPENAI_API_KEY
// // });
// // const chat = new ChatOpenAI({
// //     model: "gpt-3.5-turbo-0125", // Defaults to "gpt-3.5-turbo-instruct" if no model provided.
// //     temperature: 0.9,
// //     apiKey: process.env.OPENAI_API_KEY, // In Node.js defaults to process.env.OPENAI_API_KEY
// // });
// // type Product = {
// //     name: string,
// //     imageURL: string,
// //     price: string
// // }
// // type response = {
// //     reply: string;
// //     products: Product[]
// // };
// // type finalresp = {
// //     response: response
// // }
// // export async function generateBotResponse(shopDomain: string, messages: any, io: any, conversationId: string) {
// //     const index = shopDomain.replace(/\./g, '-');
// //     const pineconeIndex = pinecone.Index(index);

// //     try {
// //         const { messagesArray1, messagesForPrompt, singleString } = formatMessages(messages);
// //         // console.log(messagesArray1)
// //         const prompt2 = await getMainPrompt(shopDomain, singleString) || "";
// //         const prompt1 = `
// //         ${messagesForPrompt}
// //         Given the above conversation, generate a search query to look up in order to get information relevant to the conversation. Only respond with the query, nothing else.If only one message is there return message as it is`;

// //         io.in(conversationId).emit('status', { status: 'thinking' });
// //         const vectorstore = await PineconeStore.fromExistingIndex(
// //             new OpenAIEmbeddings(),
// //             { pineconeIndex }
// //         );
// //         const retriever = vectorstore.asRetriever(8);
// //         const queryGenerator = PromptTemplate.fromTemplate(prompt1).pipe(chat2).pipe(new StringOutputParser()).pipe(retriever);
// //         const questionAnsweringPrompt = ChatPromptTemplate.fromMessages([
// //             [
// //                 "system",
// //                 prompt2,
// //             ],
// //         ]);
// //         const documentChain = await createStuffDocumentsChain({
// //             llm: chat,
// //             prompt: questionAnsweringPrompt,
// //         });
// //         const parser = new JsonOutputParser<finalresp>();
// //         const conversationalRetrievalChain = RunnableSequence.from([
// //             { context: queryGenerator },
// //             documentChain,
// //         ]);

// //         const finalChain = conversationalRetrievalChain.pipe(parser)
// //         const lastAns = await finalChain.invoke({
// //         })
// //         console.log(lastAns.response)
// //         io.in(conversationId).emit('status', { status: 'writing' });
// //         return lastAns.response
// //     } catch (error) {
// //         console.log(error)
// //         io.in(conversationId).emit('status', { status: 'writing' });
// //         return "Not available right now due to some technical issues. Our Apologies for that"
// //     }
// // }
// // export async function reply(ticketId: string, messages: string[][], domain: string, conversationId: string, timestamp: string, userDetails: any, io: any) {
// //     console.log(messages)
// //     console.log(domain)
// //     console.log(conversationId)
// //     console.log(ticketId)
// //     try {
// //         // await redis.lpush('create-ticket', JSON.stringify({
// //         //     ticketId: ticketId,
// //         //     shop: domain,
// //         //     conversationId: conversationId,
// //         //     time: timestamp
// //         // }));
// //         // await redis.lpush('create-conv', JSON.stringify({
// //         //     shop: domain,
// //         //     id: conversationId,
// //         //     time: timestamp
// //         // }));

// //         // await redis.lpush('create-mssg', JSON.stringify({
// //         //     convId: conversationId,
// //         //     timestamp: timestamp,
// //         //     sender: 'user',
// //         //     text: messages[messages.length - 1][1]
// //         // }));
// //         const botResponse = await generateBotResponse(domain, messages, io, conversationId);
// //         // await redis.lpush('create-mssg', JSON.stringify({
// //         //     convId: conversationId,
// //         //     timestamp: new Date(),
// //         //     sender: 'bot',
// //         //     text: JSON.stringify(botResponse)
// //         // }));
// //         return botResponse
// //     } catch (error) {
// //         console.log(error)
// //         return 'Internal Server Error';
// //     }
// // }
// // function formatMessages(messages: any) {
// //     const len = messages.length;
// //     let messagesArray1 = []
// //     let messagesForPrompt = []
// //     let singleString = "";
// //     for (let i = 0; i < len; i++) {
// //         if (!messages[i][1]) continue
// //         if (messages[i][0] == "user") {
// //             messagesArray1.push(new HumanMessage(messages[i][1]));
// //             messagesForPrompt.push("user : " + messages[i][1])
// //             singleString+=("user: "+ messages[i][1] + "\n")
// //         }
// //         else {
// //             messagesArray1.push(new AIMessage(messages[i][1].reply));
// //             messagesForPrompt.push("Ai Assistant : " + (messages[i][1].reply))
// //             singleString+=("Yours reply: "+ messages[i][1].reply + "\n")
// //         }
// //     }
// //     return {
// //         messagesArray1,
// //         messagesForPrompt,
// //         singleString
// //     }
// // }
// // async function getMainPrompt(shopDomain: string, singleString: string) {
// //     try {
// //         const email = await getEmail(shopDomain)
// //         const instructions = await getCustomizationData(email || "")
// //         let botName;
// //         let greetingMessage;
// //         let toneAndStyle;
// //         let userGuidance;
// //         let positiveReinforcement;
// //         let errorHandling;
// //         let politeness;
// //         let clarityAndSimplicity;
// //         let personalization;
// //         let responseLength;
// //         let clarificationPrompt;
// //         let apologyAndRetryAttempt;
// //         let errorMessageStyle;

// //         if (instructions) {
// //             botName = instructions.botName
// //             greetingMessage = instructions.greetingMessage
// //             toneAndStyle = instructions.toneAndStyle
// //             userGuidance = instructions.userGuidance
// //             positiveReinforcement = instructions.positiveReinforcement
// //             errorHandling = instructions.errorHandling
// //             politeness = instructions.politeness
// //             clarityAndSimplicity = instructions.clarityAndSimplicity
// //             personalization = instructions.personalization
// //             responseLength = instructions.responseLength
// //             clarificationPrompt = instructions.clarificationPrompt
// //             apologyAndRetryAttempt = instructions.apologyAndRetryAttempt
// //             errorMessageStyle = instructions.errorMessageStyle

// //         }
// //         const shopName = shopDomain.slice(-14);

// //         const prompt2 = `
// //         You are ${botName}, AI shopping assistant for brand called ${shopName}. Your task is to help customers by answering their questions about the store and its products.Your speciality is you talk exactly like human. To do this, you will be provided with two pieces of information:
        
// //         <KnowledgeBase>
// //         {context}
// //         </KnowledgeBase>
        
// //         This knowledge base contains all the information you are allowed to use to answer customer queries. Do not use any information outside of what is provided in the knowledge base.
        
// //         <instructions>
// //         response length : ${responseLength}
// //         response style: ${errorMessageStyle}
// //         greetingMessage: ${greetingMessage}
// //         toneAndStyle: ${toneAndStyle}
// //         personalization: ${personalization}
// //         clarificationPrompt: ${clarificationPrompt}
// //         apologyAndRetryAttempt: ${apologyAndRetryAttempt}
        
// //         </instructions>
        
// //         To generate a good answer, first carefully read the knowledge base. Then search through it to find the pieces of information that are most relevant to answering the customer's specific query. Combine these pieces of information together into a coherent answer.
    
// //         Remember, you MUST answer the query using only the information provided in the knowledge base. Do not add any additional information. If the query cannot be answered based on the knowledge base, use apolofy and Retry attempt instructoin from the merchant.
// //         From the knowledge Base only take information, Don't use formatting of the knowledgeBase, also give only necessary information from the knowledgeBase.
        
// //         Response length guidelines:
// //         - If the response length is 'short', you must answer  under 30 words.
// //         - If the response length is 'medium', you must answer under 50 words but more than 30 words.
// //         - If the response length is 'long', you must answer with more than 50 words but under 70 words.


// //         Dont provide exact number of inventory quantity, just say "this item is in stock" and if inventory quantity is 0 just say "out of stock for now"
        
// //         Strictly dont discuss about the source of knowledge or about the length of knowledge base.

// //         Below is  the conversation history between you and the user, so form answer accordingly.

// //         <ConversationHistory>
// //         ${singleString}
// //         </ConversationHistory>
        
       
// //     Where reply is reply for the user query,and products is an array of products, each product should include name, imageUrl, and the price .
// //         All the prices of the products are in Indian Rupees
// //     Answer the user query. Output your answer as JSON that
// //     matches the given schema: \`\`\`json\n
// //    {{ response: {{ reply: "string", products: [{{ name: "string", imageUrl: "string", price: "string" }}] }} }}
// //     \n\`\`\`.
// //     Make sure to wrap the answer in \`\`\`json and \`\`\` tags

// //     in reply for highlightinng any word put then in double stars like below

// //     **highlighted words**


// //     Only insert products in the array if it's necessary to show some products, if reply is not about products, keep the product array empty

// //         `;
// //         return prompt2
// //     } catch (error) {
// //         console.log(error)
// //     }
// // }
const sgMail = require('@sendgrid/mail');
import { v4 as uuidv4 } from 'uuid';
export async function sendInitialEmail() {
    const messageId = uuidv4(); // Generate a unique ID for the email
    // console.log(process.env.SENDGRID_API_KEY)
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const emailMessage = {
        to: "kartikagarwal0908@gmail.com",
        from: "help@test.yugaa.tech", // Dynamic sender address
        subject: "subject",
        html: "htmlContent",
        headers: {
            'Message-ID': `<${messageId}@yourdomain.com>`,
        },
    };

    try {
        const result = await sgMail.send(emailMessage);
        console.log(result);
        // return messageId; // Return the unique message ID for tracking
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}