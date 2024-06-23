import { PrismaClient } from '@prisma/client'
import { hashPassword } from './auth';
import { randomUUID } from 'crypto';
import { publishEmailMessage } from './pubsubPublisher';
import { clerkClient } from "@clerk/clerk-sdk-node";

const prisma = new PrismaClient()

export const findUser = async (email: string) => {
    try {
        return await prisma.user.findUnique({
            where: { email },
        });
    } catch (error) {
        console.log(error)
    }
};

export const updateLastLoginAt = async (email: string) => {
    const now = new Date();
    await prisma.user.update({
        where: { email },
        data: { lastLoginAt: now },
    });
};


export const checkUser = async (email: string, firstName: string, lastName: string, provider: string, providerId: string) => {
    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (!existingUser) {
            const res = await prisma.user.create({
                data: {
                    role: "admin",
                    email,
                    firstName,
                    lastName,
                },
            });
            return res
        }
        else {
            return existingUser
        }
    } catch (error) {
        console.log(error)
        return null
    }
};



export const storeUser = async (clerkUser: any) => {
    const userData = {
        id: clerkUser.id,

        email: clerkUser.email_addresses[0].email_address,
        firstName: clerkUser.first_name,
        lastName: clerkUser.last_name,
        lastLoginAt: new Date(clerkUser.last_sign_in_at),
        shopDomain: clerkUser.public_metadata.shopDomain, // Adjust as necessary
        emailVerified: clerkUser.email_addresses[0].verification.status === 'verified' ? new Date() : null,
        image: clerkUser.profile_image_url,
        createdAt: new Date(clerkUser.created_at),
        updatedAt: new Date(clerkUser.updated_at),
        role: clerkUser.public_metadata.role, // Adjust if you have this data
    };

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email: userData.email },
        });

        if (existingUser) {
            // Update existing user
            const updatedUser = await prisma.user.update({
                where: { email: userData.email },
                data: userData,
            });
            console.log('User updated:', updatedUser);
        } else {
            const newUser = await prisma.user.create({
                data: userData,
            });
            console.log('User stored:', newUser);
        }
    } catch (error) {
        console.error('Error storing/updating user:', error);
    }
};
export const getRoleByEmail = async (email: string): Promise<string | null> => {
    try {
        const invitedUser = await prisma.invitedUser.findUnique({
            where: { email },
        });

        if (invitedUser) {
            return invitedUser.role;
        } else {
            return null; // Return null if the user is not found
        }
    } catch (error) {
        console.error('Error fetching user role:', error);
        return null; // Return null in case of an error
    }
};
export const getRoleById = async (id: string): Promise<string | null> => {
    try {
        const invitedUser = await prisma.user.findUnique({
            where: { id },
        });
        if (invitedUser) {
            return invitedUser.role;
        } else {
            return null; // Return null if the user is not found
        }
    } catch (error) {
        console.error('Error fetching user role:', error);
        return null; // Return null in case of an error
    }
};
export async function updateForm(formData: any) {

    const { email } = formData;
    const { roleId } = formData;
    const { shopDomain } = formData
    const { firstName } = formData;
    const { lastName } = formData;

    if (roleId === 'admin' && !shopDomain) {
        return { error: 'Shop domain is required.' };
    }
    const domain = shopDomain + ".myshopify.com"
    try {
        const updatedUser = await prisma.user.update({
            where: {
                email: email,
            },
            data: {
                shopDomain: domain,
                firstName: firstName,
                lastName: lastName,
            },
        });

        console.log('User updated:', updatedUser);
        return true;
    } catch (error) {
        console.error('Error updating user:', error);
        return false;
    }
}


export async function setDomainwithId(id: string, shopDomain: string) {
    try {
        await prisma.user.update({
            where: {
                id
            },
            data: {
                shopDomain: shopDomain
            }
        })

    } catch (error) {
        console.log(error)
    }
}
export async function storeToken(shop: string, accessToken: string) {
    try {
        const existingShop = await prisma.shopifyInstalledShop.findUnique({
            where: {
                shop: shop,
            },
        });
        if (existingShop) {
            const updatedShop = await prisma.shopifyInstalledShop.update({
                where: {
                    shop: shop,
                },
                data: {
                    accessToken: accessToken,
                },
            });
            console.log("Updated token for existing shop: ", updatedShop);
        } else {
            // If the shop does not exist, create a new row
            const newInstalledShop = await prisma.shopifyInstalledShop.create({
                data: {
                    shop: shop,
                    accessToken: accessToken,
                },
            });
            console.log("Stored token for new shop: ", newInstalledShop);
        }
    } catch (error) {
        console.log(error)
    }
}

export async function initializePlan(shop: string) {
    try {
        const planDetails = await prisma.planDetails.create({
            data: {
                shopifyDomain: shop,
                planId: 0,
                planStartDate: new Date(),
                convleft: 50
            },
        });
    } catch (error) {
        console.log(error)
    }

}

export async function getInviteCodesForShop(shop: string) {
    try {
        const shopData = await prisma.shopifyInstalledShop.findUnique({
            where: {
                shop: shop,
            },
            select: {
                adminInviteCode: true,
                memberInviteCode: true,
            },
        });

        if (!shopData) {
            console.log(`No shop found with the shop name: ${shop}`);
            return null;
        }

        return {
            adminInviteCode: shopData.adminInviteCode,
            memberInviteCode: shopData.memberInviteCode,
        };
    } catch (error) {
        console.error('Error retrieving invite codes:', error);
        return null;
    }
}

export async function getUsersForShopDomain(shopDomain: string){
    try {
        const users = await prisma.user.findMany({
            where: {
                shopDomain: shopDomain,
            },
            select: {
                email: true,
                firstName: true,
                lastName: true,
                image: true,
                role: true,
            },
        });

        return users;
    } catch (error) {
        console.error('Error retrieving users for shop domain:', error);
        throw error;
    }
}
export async function getshopbyCode(code: string) {

    try {
        const shop = await prisma.shopifyInstalledShop.findMany({
            where:{
                adminInviteCode: code
            }
        })
        if(shop){
            return shop[0].shop
        }
        return null
    } catch (error) {
        console.log(error)
        return null
    }
    
}