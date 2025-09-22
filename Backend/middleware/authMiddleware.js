const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    // Get token from the 'Authorization' header
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(401).json({ msg: 'No token, authorization denied.' });
    }

    // Check if the header format is "Bearer <token>" and extract the token
    const tokenParts = authHeader.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
         return res.status(401).json({ msg: 'Token format is invalid, authorization denied.' });
    }
    const token = tokenParts[1];
    
    if (!token) {
        return res.status(401).json({ msg: 'No token found after Bearer, authorization denied.' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Add user from payload (which contains { id, role }) to the request object
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid.' });
    }
};