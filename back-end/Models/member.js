const mongoose=require('mongoose');
const memberSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },

    mobileNo:{
        type:String,
        required:true,
    },
    address:{
        type:String,
        required:true,
    },
    membershipId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'membership',
        required:true,
    },
    gymId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'gym',
        required:true,
    },
    profilePic:{
        type:String,
        required:true,
    },
    status:{
        type:String,
        default:'active',
    },
    lastPayment:{
        type:Date,
        default:new Date(),
    },
    nextBill:{
        type:Date
    }

},{timestamps:true});

const member=mongoose.model('member',memberSchema);
module.exports=member;