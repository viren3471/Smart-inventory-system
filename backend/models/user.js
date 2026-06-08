const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true // No two users can have the same username
    },
    password: { 
        type: String, 
        required: true 
    },
    role: { 
        type: String, 
        enum: ['Admin', 'Cashier'], // These are the only two allowed roles
        default: 'Cashier' 
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);