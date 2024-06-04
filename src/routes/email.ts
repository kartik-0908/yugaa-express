import axios from 'axios';
import { Router } from 'express';
require('dotenv').config();
const express = require('express');
const router = Router();
const { GoogleAuth } = require('google-auth-library');
const { DNS } = require('@google-cloud/dns');

router.use(express.json());

const projectId = process.env.PROJECT_ID;
const clientEmail = process.env.CLIENT_EMAIL;
const privateKey = process.env.PRIVATE_KEY;

// const dns = new DNS({
//     projectId: projectId,
//     credentials: {
//         client_email: clientEmail,
//         private_key: privateKey,
//     },
// });
// const dns = new DNS({
//     projectId,

// });
const dns = new DNS({
    projectId: projectId,
    clientEmail: clientEmail,
    privateKey: privateKey,
});
const zone = dns.zone('yugaa')
// const zone = dns.zone('yugaa');

// async function createSubdomain(subdomain: string) {
//     const record = zone.record('A', {
//         name: `${subdomain}.yourdomain.com.`,
//         ttl: 300,
//         data: 'IP_ADDRESS', // Replace with your server's IP address
//     });

//     await zone.addRecord(record);
//     console.log(`Subdomain ${subdomain}.yourdomain.com created.`);
// }

// const recordType = 'CNAME';
// const ttl = 300;

// async function createSubdomain(subdomain: string) {
//     const auth = new GoogleAuth({
//         credentials: {
//           client_email: clientEmail,
//           private_key: privateKey,
//         },
//         scopes: ['https://www.googleapis.com/auth/cloud-platform'],
//       });

//       const client = await auth.getClient();
//       const accessToken = await client.getAccessToken();
//       console.log(client)
//       console.log(accessToken)

//   const url = `https://dns.googleapis.com/dns/v1/projects/${projectId}/managedZones/yugaa/changes`;

//   const data = {
//     additions: [
//       {
//         name: `${subdomain}.yourdomain.com.`,
//         type: recordType,
//         ttl: ttl,
//       },
//     ],
//   };

//   try {
//     const response = await axios.post(url, data, {
//         headers: {
//             Authorization: `Bearer ${accessToken.token}`,
//             'Content-Type': 'application/json',
//           },
//     });

//     console.log(`Subdomain ${subdomain}.yourdomain.com created.`);
//   } catch (error) {
//     console.log ('Error creating subdomain:', error);
//   }
// }

async function quickstart() {
    // Lists all zones in the current project
    try {
        const newARecord = zone.record('A', { name: 'hvhvhv.yugaa.tech.', data: '5.6.7.8', ttl: 86400 });
        // const res = await zone.createChange({
        //     add: newARecord
        // })
        const res = await zone.addRecords(newARecord)
        // console.log(newARecord)
        console.log(res)

        // const [zones] = await dns.getZones();
        // console.log('Zones:');
        // zones.forEach((zone: any) => console.log(zone.name));
    } catch (error) {
        console.log(error)
    }
}

router.get('/', (req, res) => {
    // createSubdomain('user-subdomain'); 
    // createSubdomain("hihihi")

    res.json({
        "message": "inside email"
    })
})


router.post('/', (req, res) => {
    // createSubdomain('user-subdomain'); 
    // createSubdomain("hihihi")
    // quickstart();

    console.log('Request Body:', req.body);

    res.status(200).json({
        message: "inside email",
        requestBody: req.body // Optional: echoing back the request body
    });
})


module.exports = router;