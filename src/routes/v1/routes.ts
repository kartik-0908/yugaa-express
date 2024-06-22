import { Router } from 'express';
const userRouter = require('../v1/user');
const shopifyRouter = require('../v1/shopify');
const adminRouter = require('../v1/admin');

const router = Router();

router.use('/user', userRouter);
router.use('/shopify', shopifyRouter);
router.use('/admin', adminRouter);

module.exports = router;
