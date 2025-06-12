const gym=require('../Models/gym');
const jwt = require('jsonwebtoken');

const auth= async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized User' });
        }

        const decoded = jwt.verify(token, 'gymsecretkey');
        const gymUser = await gym.findById(decoded.gym_id).select('-password');
        req.gym= gymUser;
        next();
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Server error' });
        }
}
module.exports = auth;