import { client } from "../lib/prisma"
// export async function getEmail(shopDomain: string) {
//   try {
//     const user = await client.user.findUnique({
//       where: {
//         shopifyDomain: shopDomain,
//       },
//       select: {
//         email: true,
//       },
//     });

//     return user ? user.email : null;
//   } catch (error) {
//     console.error('Error fetching email for shopDomain:', error);
//     return null;
//   }
// }

// export async function getShop(email: string) {
//   console.log(email)
//   const existingUser = await client.user.findUnique({
//     where: {
//       email: email
//     }
//   });
//   console.log(existingUser)
//   if (existingUser) {
//     return (existingUser.shopifyDomain);
//   }
// }
// export const getCustomizationData = async (email: string) => {
//   if (email) {
//     const customizations = await client.chatbotCustomization.findUnique({
//       where: {
//         userEmail: email,
//       },
//     });
//     return customizations
//   }
// }
// export async function updatePlanDetails(shopifyDomain: string): Promise<void> {
//   try {
//     await client.planDetails.update({
//       where: {
//         shopifyDomain: shopifyDomain,
//       },
//       data: {
//         planId: 0,
//         convleft: 50,
//       },
//     });
//     console.log('Plan details updated successfully');
//   } catch (error) {
//     console.error('Error updating plan details:', error);
//     throw error;
//   }
// }
export const getPreviousMessages = async (ticketId: string) => {
    try {
        return await client.message.findMany({
            where: {
                ticketId
            },
            orderBy: {
                createdAt: 'asc',
            }
        });
    } catch (error) {
        console.error('Error fetching previous messages:', error);
        throw error;
    }
};