import { RunnableConfig } from "@langchain/core/runnables";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
const escalatorSchema = z.object({
    shopDomain: z.string(),
});
export const TicketEscalatorTool = tool(
    async (input: { shopDomain: string},config ): Promise<any> => {
        console.log(input.shopDomain)
        const userEmail = config?.configurable.userEmail
        return `Ticket id : 982948 created for ${userEmail} `

    },
    {
        name: "TicketEscalatorTool",
        description: "Use this tool to escalate the ticket to Human Operator",
        schema: escalatorSchema,
    }
);
