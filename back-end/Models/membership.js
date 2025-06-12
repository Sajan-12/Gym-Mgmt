const mongoose= require('mongoose');

const membershipSchema = new mongoose.Schema({
    months: {
        type: Number,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    gymId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'gym',
        required: true,
    }
},{timestamps: true});

const membership = mongoose.model('membership', membershipSchema);
module.exports = membership;