const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(401).json({ msg: 'Authorization denied. No token provided.' });
    }

    const tokenParts = authHeader.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
         return res.status(400).json({ msg: 'Token format is invalid. Use "Bearer <token>".' });
    }
    const token = tokenParts[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ msg: 'Token has expired. Please login again.' });
        }
        res.status(401).json({ msg: 'Token is not valid.' });
    }
};
