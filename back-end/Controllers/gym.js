const gym = require('../Models/gym');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const jwt=require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { email, userName, password, profilePic, gymName } = req.body;

        // Check if the gym already exists
        const existingGym = await gym.findOne({ email });
        if (existingGym) {
            return res.status(400).json({ message: 'email already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        // Create a new gym
        const newGym = new gym({
            email,
            userName,
            password: hashedPassword,
            profilePic,
            gymName
        });

        // Save the gym to the database
        await newGym.save();
        console.log(newGym);

        res.status(201).json({ message: 'Gym registered successfully', data: newGym });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

const cookieoptions = {
    httpOnly: true,
    secure: false,
    maxAge: 24*3600000 
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
    
        const existingGym = await gym.findOne({ email });
        if (existingGym && await bcrypt.compare(password, existingGym.password)) {
            const token=jwt.sign({gym_id:existingGym._id}, 'gymsecretkey',
                {expiresIn:'1day'});
            res.cookie('token', token, cookieoptions);
            res.status(200).json({ message: 'Login successful', data: existingGym,token: token });
        }
        else {
            res.status(400).json({ message: 'Invalid email or password' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

const transporter=nodemailer.createTransport({
    service:'gmail',
    auth: {
        user:'sajan9088075@gmail.com', 
        pass: 'klxglirgqytumzus'
    }
});


exports.sendOtp = async (req, res) => {
    const { email } = req.body;
    try {
        // Find the gym by email
        const existingGym = await gym.findOne({ email });
        if (!existingGym) {
            return res.status(404).json({ message: 'Gym not found' });
        }
        // Generate a random 6-digit OTP
        const token = crypto.randomInt(100000, 999999).toString();
        existingGym.resetPasswordToken = token;
        existingGym.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiration
        await existingGym.save();


        //for email sending
        const mailOptions = {
            from:'sajan9088075@gmail.com',
            to:email,
            subject:'Password Reset OTP',
            text:`Your OTP for password reset is: ${token}. It is valid for 1 hour.`
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                return res.status(500).json({ message: 'Error sending email' });
            }
            console.log('Email sent:', info.response);
            res.status(200).json({ message: 'OTP sent successfully', token });
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.verifyOtp= async (req, res) => {
    const { email, otp } = req.body;
    try {
        // Find the gym by email
        const existingGym = await gym.findOne({ email, resetPasswordToken: otp });
        if (!existingGym) {
            return res.status(404).json({ message: 'Gym not found' });
        }
        // Check if the token is valid and not expired
        if ( existingGym.resetPasswordExpires > Date.now()) {
            res.status(200).json({ message: 'OTP verified successfully', data: existingGym });
        } else {
            res.status(400).json({ message: 'Invalid or expired OTP' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.resetPassword = async (req, res) => {
    const { email, newPassword } = req.body;
    try {
        // Find the gym by email
        const existingGym = await gym.findOne({ email });
        if (!existingGym) {
            return res.status(404).json({ message: 'Gym not found' });
        }
        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        existingGym.password = hashedPassword;
        existingGym.resetPasswordToken = undefined;
        existingGym.resetPasswordExpires = undefined;
        await existingGym.save();
        res.status(200).json({ message: 'Password reset successfully' });
    }catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.logout = async (req, res) => {
    try {
        res.clearCookie('token', cookieoptions);
        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}