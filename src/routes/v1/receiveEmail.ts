import { Storage } from "@google-cloud/storage";
import { randomUUID } from "crypto";
import { Router } from "express";
import { db } from "../../common/db";
const multipart = require('parse-multipart-data');
const bodyParser = require('body-parser');
const { simpleParser } = require('mailparser');
const multer = require('multer')
const upload = multer()

const router = Router();

// router.use(bodyParser.raw({ type: 'multipart/form-data', limit: '10mb' }));

async function uploadFileToGCS(filename: string, bytes: any) {
    const storage = new Storage({
        projectId: process.env.PROJECT_ID,
        credentials: {
            client_email: process.env.CLIENT_EMAIL,
            private_key: process.env.PRIVATE_KEY,
        },
    });
    const bucket = storage.bucket(process.env.EMAIL_BUCKET_NAME || "");
    const blob = bucket.file(filename);
    const buffer = Buffer.from(bytes);

    try {
        await new Promise((resolve, reject) => {
            const blobStream = blob.createWriteStream({
                resumable: false,
                metadata: {
                    cacheControl: 'no-cache',
                },
            });
            blobStream
                .on("error", (err) => reject(err))
                .on("finish", () => resolve(true));
            blobStream.end(buffer);
        });
        console.log(`${filename} uploaded`);
    } catch (error) {
        console.error(`Failed to upload ${filename}:`, error);
    }
}



router.post('/', upload.any(),async (req: any, res: any) => {

    const body = req.body
    console.log(body)
    console.log("subject: ", body.subject);
    console.log("text: ", body.text);
    const ticketId = body.subject.match(/\[#(.*?)\]/)
    console.log(ticketId[1])
    try {

        const newEmail = await db.email.create({
            data:{
                subject: body.subject,
                text: body.text,
                from: body.from,
                to: body.to,
            }
        })
        await db.aIEscalatedTicketEvent.create({
            data:{
                aiEscalatedTicketId: ticketId[1],
                type: 'EMAIL_RECEIVED',
                emailId: newEmail.id,
            }
        })
            // console.log("attachments: ", body.attachments);
    // console.log("attachment-info: ", body['attachment-info']);
    // console.log("content-ids: ", body['content-ids']);
    // if (req.files.length > 0) {
    //     // Log file data
    //     console.log(req.files)
    // } else {
    //     console.log('No files...')
    // }
        res.json({
            message: "ok",
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "error",
        })
    }
});

module.exports = router;


// router.post('/', async (req: any, res: any) => {
//     console.log("email received")
//     const contentType = req.headers['content-type'];
//     if (contentType.includes('multipart/form-data')) {
//         let boundary = contentType.replace(/^.*boundary=/, "");
//         const emailContents = req.body; // Assuming req.body contains the email content as buffer
//         const emailParts = multipart.parse(emailContents, boundary);
//         // console.log(emailParts)
//         for (let i = 0; i < emailParts.length; i++) {
//             const part = emailParts[i];
//             if (part.name !== undefined && part.data !== undefined) {
//                 let name = part.name.toLowerCase();
//                 if (name === "email") {
//                     const trial = part.data.toString('utf8');
//                     console.log(trial)
//                     let parsed = await simpleParser(part.data)
//                     // console.log(parsed)
//                     const uniqueId = randomUUID();
//                     const emailFolder = `${uniqueId}`;
//                     if (parsed.attachments && parsed.attachments.length > 0) {
//                         for (const attachment of parsed.attachments) {
//                             const attachmentFilename = `${emailFolder}/attachments/${attachment.filename}`;
//                             await uploadFileToGCS(attachmentFilename, attachment.content);
//                         }
//                     }
//                     const emailJsonBuffer = Buffer.from(JSON.stringify(parsed), 'utf8');
//                     await uploadFileToGCS(`${emailFolder}/email.json`, emailJsonBuffer);
//                     console.log(`email upload with id: ${uniqueId}`) 

//                 }
//             }
//         }
//     }
//     res.status(200).send('Request processed successfully');
// });