import { tool } from "@langchain/core/tools";
import { z } from "zod";
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
        try {
            await publishTicketEscalate(aiConversationTicketId, shop, userEmail )
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
