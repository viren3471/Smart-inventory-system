const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    amount: { type: Number, required: true }
}, { timestamps: true }); // timestamps is required for the "Today" math to work

module.exports = mongoose.model('Expense', expenseSchema);