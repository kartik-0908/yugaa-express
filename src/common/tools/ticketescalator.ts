import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { publishTicketEscalate } from "../pubsubPublisher";
import { db } from "../db";
const escalatorSchema = z.object({
    shopDomain: z.string(),
});
export const TicketEscalatorTool = tool(
    async (input: { shopDomain: string }, config): Promise<any> => {
        console.log(input.shopDomain)
        const shop = input.shopDomain + ".myshopify.com"
        const userEmail = config?.configurable.userEmail
        const aiConversationTicketId = config?.configurable.thread_id
        try {
            // await db.$transaction(async (tx) => {
            //     // Count existing tickets for the given shopDomain
            //     const ticketCount = await tx.aIEscalatedTicket.count({
            //         where: { shopDomain: shop },
            //     });

            //     // Generate the new unique ID
            //     const newId = `${input.shopDomain}-${ticketCount + 1}`;

            //     // Create the new ticket
            //     const newTicket = await tx.aIEscalatedTicket.create({
            //         data: {
            //             id: newId,
            //             shopDomain: shop,
            //             customerEmail: userEmail,
            //             aiConversationTicketId,
            //         },
            //     });

            //     await tx.aIEscalatedTicketEvent.create({
            //         data: {
            //             aiEscalatedTicketId: newTicket.id,
            //             eventType: 'created',
            //             newStatus: newTicket.status, // Assuming the status is set to a default value
            //         },
            //     });

            //     return newTicket;
            // }, {
            //     // Set a timeout for the transaction (adjust as needed)
            //     timeout: 10000, // 10 seconds
            //     // Use serializable isolation level for strongest consistency
            //     isolationLevel: 'Serializable',
            // });

            await publishTicketEscalate(aiConversationTicketId, shop, userEmail);
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
