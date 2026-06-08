const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Use a secret key for tokens (in a real app, this goes in a hidden .env file)
const JWT_SECRET = "super_secret_shop_key_123"; 

// Route 1: REGISTER A NEW USER
router.post('/register', async (req, res) => {
    try {
        const { username, password, role } = req.body;

        // 1. Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "Username already exists!" });
        }

        // 2. Encrypt (Hash) the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Create the user
        const newUser = new User({
            username,
            password: hashedPassword,
            role
        });

        await newUser.save();
        res.status(201).json({ message: "User registered successfully!" });

    } catch (error) {
        res.status(500).json({ message: "Error registering user", error: error.message });
    }
});

// Route 2: LOGIN AND GET TOKEN
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // 1. Find the user
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: "User not found!" });
        }

        // 2. Compare the typed password with the encrypted password in the database
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials!" });
        }

        // 3. Create the JWT Token (The digital ID card)
        const token = jwt.sign(
            { userId: user._id, role: user.role }, // Stuff we want to put inside the ID card
            JWT_SECRET,
            { expiresIn: '1d' } // Token expires in 1 day
        );

        // 4. Send token to the frontend
        res.status(200).json({ 
            message: "Login successful!", 
            token: token,
            role: user.role
        });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;