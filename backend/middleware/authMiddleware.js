const jwt = require('jsonwebtoken');

// This MUST match the secret key you used in authRoutes.js
const JWT_SECRET = "super_secret_shop_key_123"; 

// Guard 1: Are you logged in? (Do you have an ID card?)
const verifyToken = (req, res, next) => {
    // 1. Look for the token in the request headers
    const authHeader = req.header('Authorization');

    if (!authHeader) {
        return res.status(401).json({ message: "Access Denied! No token provided." });
    }

    try {
        // 2. Tokens usually come in the format "Bearer <token_string>"
        // We need to slice off the word "Bearer " to get the actual token
        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

        // 3. Verify the token using our secret key
        const verifiedData = jwt.verify(token, JWT_SECRET);
        
        // 4. Attach the user data (like their role) to the request so the next function can use it
        req.user = verifiedData; 
        
        next(); // "Your ID is valid, go ahead!"
    } catch (error) {
        res.status(400).json({ message: "Invalid Token!" });
    }
};

// Guard 2: Are you an Admin? (Do you have VIP access?)
const isAdmin = (req, res, next) => {
    // We already verified the token above, so req.user exists
    if (req.user.role !== 'Admin') {
        return res.status(403).json({ message: "Access Denied! Only Admins can view this." });
    }
    next(); // "You are an Admin, welcome in."
};

module.exports = { verifyToken, isAdmin };