const membership=require('../Models/membership');

exports.addMembership = async (req, res) => {
    try {
        const {months, price}=req.body;
        
        const existMembership= await membership.findOne({gymId:req.gym._id,months:months });
        if(existMembership) {
            existMembership.months=months;
            existMembership.price=price;
            await existMembership.save();
            return res.status(400).json({ message: 'Membership is Updated'});
        }
        // Create a new membership
        else{
              const newMembership = new membership({
            months,
            price,
            gymId: req.gym._id
        });

        // Save the membership to the database
        await newMembership.save();

        res.status(201).json({ message: 'Membership added successfully', data: newMembership });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.getMemberships=async (req, res) => {
    try {
        const memberships = await membership.find({gymId:req.gym._id});
        if (memberships.length === 0) {
            return res.status(404).json({ message: 'No memberships found for this gym' });
        }
        res.status(200).json({ message: 'Memberships retrieved successfully', data: memberships });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}