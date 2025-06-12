const express = require('express');
const router = express.Router();
const gymController = require('../Controllers/gym');
const auth = require('../middleware/auth');

router.post('/register',gymController.register);
router.post('/login', gymController.login);
router.post('/reset-password/sendotp',gymController.sendOtp);
router.post('/reset-password/verifyotp', gymController.verifyOtp);
router.post('/reset-password', gymController.resetPassword);
router.post('/logout',gymController.logout);
module.exports=router;