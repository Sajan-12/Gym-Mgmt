const member=require('../Models/member');
const membership=require('../Models/membership');


exports.getMembers = async (req, res) => {
    try {
        // Fetch all members for the gym
        const {skip,limit}=req.query;
        const members = await member.find({ gymId: req.gym._id }).populate('membershipId', 'months price');
        totalMembers=members.length;
        const limitedMembers= await member.find({ gymId: req.gym._id }).sort({ createdAt: -1}).skip(parseInt(skip)).limit(parseInt(limit)).populate('membershipId', 'months price');       
        res.status(200).json({ message: 'Members fetched successfully', members: limitedMembers,totalMembers });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

function nextBillDate(currentDate, months) {
    const date = new Date(currentDate);      
    const originalDay = date.getDate();     

    date.setMonth(date.getMonth() + months);   

    if (date.getDate() < originalDay) {       
        date.setDate(0);                       
    }

    return date;     
}
exports.addMember = async (req, res) => {
    try {
        let { name, mobileNo, address, membershipId,profilePic,joiningDate } = req.body;
         if(!joiningDate){
            joiningDate = new Date();
          } // Default to current date if not provided
        // Check if the member already exists
        const existingMember = await member.findOne({ mobileNo, gymId: req.gym._id });
        if (existingMember) {
            return res.status(400).json({ message: 'Member already exists' });
        }

        // Check if the membership ID is valid
        const existingMembership = await membership.findById({_id:membershipId,gymId: req.gym._id});
        if (!existingMembership) {
            return res.status(400).json({ message: 'Invalid membership ID' });
        }

        // Create a new member
        const newMember = new member({
            name,
            mobileNo,
            address,
            profilePic,
            membershipId:membershipId,
            gymId:req.gym._id,
            lastPayment: joiningDate,
            nextBill:nextBillDate(joiningDate, existingMembership.months)
        });

        // Save the member to the database
        await newMember.save();

        res.status(201).json({ message: 'Member added successfully', data: newMember });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.searchMembers = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        // Search for members by name or mobile number
        const members = await member.find({
            gymId: req.gym._id,
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { mobileNo: { $regex: query, $options: 'i' } }
            ]
        }).populate('membershipId', 'months price');

        if (members.length === 0) {
            return res.status(404).json({ message: 'No members found' });
        }

        res.status(200).json({ message: 'Members found', members: members });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.monthlyJoinedMembers = async (req, res) => {
    try {
        const currentDate = new Date();
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1,23, 59, 59, 999); // Start of the month
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0,23, 59, 59,999); // End of the month
        // Fetch members who joined in the current month
        const members = await member.find({
            gymId: req.gym._id,
            createdAt: { $gte: startOfMonth, $lte: endOfMonth }
        }).populate('membershipId', 'months price');

        res.status(200).json({ message: 'Monthly joined members fetched successfully', data: members });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.expiringWithin3Days=async (req, res) => {
    try {
        const currentDate = new Date();
        const threeDaysFromNow = new Date(currentDate);
        threeDaysFromNow.setDate(currentDate.getDate() + 3);

        // Fetch members whose next bill date is within the next 3 days
        const members = await member.find({
            gymId: req.gym._id,
            nextBill: { $gte: currentDate, $lte: threeDaysFromNow }
        }).populate('membershipId', 'months price');
        if(members.length===0){
            return res.status(404).json({ message: 'No members expiring within 3 days' });
        }
        res.status(200).json({ message: 'Members expiring within 3 days fetched successfully', data: members });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.expiring4to7Days=async (req, res) => {
    try {
        const currentDate = new Date();
        const fourDaysFromNow = new Date(currentDate);
        fourDaysFromNow.setDate(currentDate.getDate() + 4);
        const sevenDaysFromNow = new Date(currentDate);
        sevenDaysFromNow.setDate(currentDate.getDate() + 7);

        // Fetch members whose next bill date is within the next 4 to 7 days
        const members = await member.find({
            gymId: req.gym._id,
            nextBill: { $gte: fourDaysFromNow, $lte: sevenDaysFromNow }
        }).populate('membershipId', 'months price');
        if(members.length===0){
            return res.status(404).json({ message: 'No members expiring within 4 to 7 days' });
        }
        res.status(200).json({ message: 'Members expiring within 4 to 7 days fetched successfully', data: members });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.expiredMembers = async (req, res) => {
    try {
        const currentDate = new Date();

        // Fetch members whose next bill date is before the current date
        const members = await member.find({
            gymId: req.gym._id,
            nextBill: { $lt: currentDate }
        }).populate('membershipId', 'months price');
        if(members.length===0){
            return res.status(404).json({ message: 'No expired members found' });
        }
        res.status(200).json({ message: 'Expired members fetched successfully', data: members });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.inActiveMembers = async (req, res) => {
    try {
        // Fetch members whose status is 'inactive'
        const members = await member.find({
            gymId: req.gym._id,
            status: 'pending'
        }).populate('membershipId', 'months price');
        if(members.length===0){
            return res.status(404).json({ message: 'No inactive members found' });
        }
        res.status(200).json({ message: 'Inactive members fetched successfully', data: members });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.getMemberDetails = async (req, res) => {
    const { id } = req.params;
    try {
        // Fetch member details by ID
        const memberDetails = await member.findOne({_id:id,gymId:req.gym._id});
        if (!memberDetails) {
            return res.status(404).json({ message: 'Member not found' });
        }
        res.status(200).json({ message: 'Member details fetched successfully', data: memberDetails });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.updateSataus=async (req, res) => {
    const {id}=req.params;
    const {status}=req.body;
    try {
        // Fetch member by ID
        const memberToUpdate = await member.findOne({_id:id,gymId:req.gym._id});
        if (!memberToUpdate) {
            return res.status(404).json({ message: 'Member not found' });
        }

        // Update member details
        memberToUpdate.status=status;

        // Save the updated member
        await memberToUpdate.save();

        res.status(200).json({ message: 'status updated successfully', data: memberToUpdate });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.updateMemberPlan = async (req, res) => {
    const { id } = req.params;
    let { membershipId,joiningDate} = req.body;
    try {
        // Fetch member by ID
        const memberToUpdate = await member.findOne({_id:id,gymId:req.gym._id}).populate('membershipId', 'months price');
        if (!memberToUpdate) {
            return res.status(404).json({ message: 'Member not found' });
        }
  
        // Check if the new membership ID is valid
        const existingMembership = await membership.findById({_id:membershipId,gymId: req.gym._id});
        if (!existingMembership) {
            return res.status(400).json({ message: 'Invalid membership ID' });
        }

        // Update member details
        if(!joiningDate){
            joiningDate=new Date();
        }
        memberToUpdate.membershipId = membershipId;
        memberToUpdate.lastPayment=joiningDate;
        memberToUpdate.nextBill=nextBillDate(joiningDate, existingMembership.months);

        // Save the updated member
        await memberToUpdate.save();

        res.status(200).json({ message: 'Member plan updated successfully', data: memberToUpdate });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.updateMember=async(req,res)=>{
   
    let { name, mobileNo, address, membershipId,profilePic,joiningDate } = req.body;
    try {
        // Fetch member by ID
        const memberToUpdate = await member.findOne({mobileNo,gymId:req.gym._id});
        if (!memberToUpdate) {
            return res.status(404).json({ message: 'Member not found' });
        }
  
        // Check if the new membership ID is valid
        const existingMembership = await membership.findById({_id:membershipId,gymId: req.gym._id});
        if (!existingMembership) {
            return res.status(400).json({ message: 'Invalid membership ID' });
        }

        // Update member details
        if(!joiningDate){
            joiningDate=new Date();
        }
         memberToUpdate.name=name||memberToUpdate.name;
        memberToUpdate.address=address|| memberToUpdate.address;
        memberToUpdate.profilePic=profilePic|| memberToUpdate.profilePic;
        memberToUpdate.membershipId =membershipId|| memberToUpdate.membershipId;
        memberToUpdate.lastPayment=joiningDate;
        memberToUpdate.nextBill=nextBillDate(joiningDate, existingMembership.months);

        // Save the updated member
        await memberToUpdate.save();

        res.status(200).json({ message: 'Member  updated successfully', data: memberToUpdate });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.deleteMember=async(req,res)=>{
       const {id}=req.params;
       try{
        let memberToDelete=member.find({_id:id,gymId:req.gym._id});
       if(!memberToDelete){
           return res.status(404).json({ message: 'Member not found' });
       }
       else{
        await member.deleteOne({_id:id,gymId:req.gym._id});
         res.status(200).json({ message: 'Member deleted successfully' });
       }
       }
       catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}