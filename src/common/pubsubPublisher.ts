import { PubSub } from '@google-cloud/pubsub';

const pubSubClient = new PubSub({
    projectId: "yugaa-424705",
    credentials: {
        client_email: process.env.CLIENT_EMAIL,
        private_key: process.env.PRIVATE_KEY,
    },
});

export async function publishEmailMessage(fromAddress: string, recipientAddress: string, subject: string, htmlContent: string) {
    const topicName = 'email-topic';

    const dataBuffer = Buffer.from(JSON.stringify({ 
        fromAddress,
        recipientAddress,
        subject,
        htmlContent,
     }));

    try {
        const messageId = await pubSubClient.topic(topicName).publishMessage({ data: dataBuffer });
        console.log(`Message ${messageId} published to ${topicName}.`);
    } catch (error) {
        console.error(`Error publishing message to ${topicName}:`, error);
    }
}

