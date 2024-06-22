import { Router } from 'express';
const clerkWebhook = require('./clerk');

const router = Router();

router.use('/clerk', clerkWebhook);

module.exports = router ;
