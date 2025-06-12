 const express = require('express');
const router = express.Router();

const membershipController = require('../Controllers/membership');
const auth = require('../middleware/auth');
router.post('/add-membership', auth, membershipController.addMembership);
router.get('/get-memberships', auth, membershipController.getMemberships);
module.exports = router;