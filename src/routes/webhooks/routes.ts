import { Router } from 'express';
const clerkWebhook = require('./clerk');
const workerWebhook = require('./worker');
const shopifyWebhook = require('./shopify');

const router = Router();

router.use('/clerk', clerkWebhook);
router.use('/worker', workerWebhook);
router.use('/shopify', shopifyWebhook);

module.exports = router ;
