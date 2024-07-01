import { Router } from 'express';
const router = Router();
import bodyParser from 'body-parser';
import { Webhook, WebhookRequiredHeaders } from 'svix';
import { IncomingHttpHeaders } from 'http';
import { db } from '../../common/db';

type EventType = "user.created" | "user.updated" | "*";

type Event = {
    data: {
        id: string,
        email_addresses: {
            email_address: string,
            verification: {
                status: string
            }
        }[] | [],
        first_name: string,
        last_name: string,
        last_sign_in_at: number,
        profile_image_url: string,
        created_at: number,
        updated_at: number,
        public_metadata: {
            role?: string,
            shopDomain?: string
        }
    }
    object: "event",
    type: EventType
}

router.use(bodyParser.raw({ type: 'application/json' }))

router.post('/', async function (req, res) {
    try {
        const payloadString = req.body.toString();
        const svixHeaders = req.headers;
        // console.log(process.env.CLERK_WEBHOOK_SECRET_KEY)
        const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET_KEY || "");
        const evt: Event | null = wh.verify(payloadString, svixHeaders as IncomingHttpHeaders & WebhookRequiredHeaders) as Event;
        const { id } = evt.data;
        const { ...attributes } = evt.data;
        // Handle the webhooks
        const eventType = evt.type;
        if (eventType === 'user.updated' || eventType === 'user.created') {
            console.log(`User ${id} was ${eventType}`);
            const userData = {
                id: attributes.id,
                email: attributes?.email_addresses[0].email_address,
                firstName: attributes.first_name,
                lastName: attributes.last_name,
                lastLoginAt: new Date(attributes.last_sign_in_at),
                shopDomain: attributes.public_metadata.shopDomain, // Adjust as necessary
                emailVerified: attributes.email_addresses[0].verification.status === 'verified' ? new Date() : null,
                image: attributes.profile_image_url,
                createdAt: new Date(attributes.created_at),
                updatedAt: new Date(attributes.updated_at),
                role: attributes.public_metadata.role, // Adjust if you have this data
            };
            const existingUser = await db.user.findUnique({
                where: { email: userData.email },
            });
            if (existingUser) {
                const updatedUser = await db.user.update({
                    where: { email: userData.email },
                    data: userData,
                });
                console.log('User updated:', updatedUser);
            } else {
                const newUser = await db.user.create({
                    data: userData,
                });
                console.log('User stored:', newUser);
            }
        }
        res.status(200).json({
            success: true,
            message: 'Webhook received',
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: (err as Error).message,
        });
    }
}
);


module.exports = router;