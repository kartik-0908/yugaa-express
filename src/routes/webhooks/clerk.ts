import { Router } from 'express';
const router = Router();
import bodyParser from 'body-parser';
import { Webhook, WebhookRequiredHeaders } from 'svix';
import { IncomingHttpHeaders } from 'http';
import { storeUser } from '../../common/db';

type EventType = "user.created" | "user.updated" | "*";

type Event = {
    data: {
        id: string,
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
            await storeUser(attributes)
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