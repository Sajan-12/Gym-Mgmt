 const express = require('express');
const router = express.Router();

const memberController = require('../Controllers/member');
const auth = require('../middleware/auth');

router.post('/addmember',auth,memberController.addMember);
router.get('/getmembers',auth,memberController.getMembers);
router.get('/search',auth,memberController.searchMembers);
router.get('/monthly-joined',auth,memberController.monthlyJoinedMembers);
router.get('/expiring-within-3-days',auth,memberController.expiringWithin3Days);
router.get('/expiring-4-7-days',auth,memberController.expiring4to7Days);
router.get('/expired',auth,memberController.expiredMembers);
router.get('/inactive',auth,memberController.inActiveMembers);
router.get('/details/:id',auth,memberController.getMemberDetails);
router.put('/update-status/:id',auth,memberController.updateSataus);
router.put('/update-member-plan/:id',auth,memberController.updateMemberPlan);
router.put('/update-member',auth,memberController.updateMember);
router.delete('/delete/:id',auth,memberController.deleteMember);
module.exports = router;