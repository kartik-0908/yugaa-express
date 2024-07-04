import { RunnableConfig } from "@langchain/core/runnables";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { db } from "../db";
import { publishTicketEscalate } from "../pubsubPublisher";
const escalatorSchema = z.object({
    shopDomain: z.string(),
});
export const TicketEscalatorTool = tool(
    async (input: { shopDomain: string }, config): Promise<any> => {
        console.log(input.shopDomain)
        const shop = input.shopDomain += ".myshopify.com"
        const userEmail = config?.configurable.userEmail
        const aiConversationTicketId = config?.configurable.thread_id
        let ticketId;
        try {
            await publishTicketEscalate(aiConversationTicketId, shop, userEmail )
            // await db.$transaction(async (prisma) => {
            //     // Count the number of tickets for the shopDomain
            //     const ticketCount = await prisma.aIEscalatedTicket.count({
            //         where: {
            //             shopDomain: shop,
            //         },
            //     });
            //     const newTicketId = `${shop}-${ticketCount + 1}`;
            //     ticketId = newTicketId
            //     await prisma.aIEscalatedTicket.create({
            //         data: {
            //             id: newTicketId,
            //             shopDomain: input.shopDomain,
            //             customerEmail: userEmail,
            //             aiConversationTicketId: aiConversationTicketId,
            //         },
            //     });
            //     await prisma.$executeRaw`SELECT pg_advisory_xact_lock(1);`;
            // }, {
            //     isolationLevel: 'Serializable', // Ensuring the highest isolation level
            // });
            return `Ticket escalated and will be responded to given email Id`


        } catch (error) {
            console.log(error)
            return "some error has occured. Try after sometime"
        }
    },
    {
        name: "TicketEscalatorTool",
        description: "Use this tool to escalate the ticket to Human Operator",
        schema: escalatorSchema,
    }
);
