import { Router } from 'express';
import { getInviteCodesForShop, getRoleById, getUsersForShopDomain, getshopbyCode, setDomainwithId } from '../../common/db';
const express = require('express');
const router = Router();

router.use(express.json())
router.post('/verify/', async (req, res) => {
    const {code} = req.body;

    if (!code) {
        return res.status(400).json({ message: 'code is required' });
    }
    console.log(code)
    const shopDomain = await getshopbyCode(code)
    console.log(shopDomain)
    return res.json({ shopDomain });
});



module.exports = router;