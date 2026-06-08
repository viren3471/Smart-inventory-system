const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');

// Route 1: Add a new expense
router.post('/add', async (req, res) => {
    try {
        const newExpense = new Expense(req.body);
        const savedExpense = await newExpense.save();
        res.status(201).json({ message: "Expense recorded!", expense: savedExpense });
    } catch (error) {
        res.status(500).json({ message: "Error adding expense", error: error.message });
    }
});

// Route 2: Get all expenses (for a ledger view later)
router.get('/all', async (req, res) => {
    try {
        const expenses = await Expense.find().sort({ expenseDate: -1 }); // -1 sorts by newest first
        res.status(200).json(expenses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// FETCH ALL EXPENSES
router.get('/all', async (req, res) => {
    try {
        // Find all expenses and sort them by newest first
        const expenses = await Expense.find().sort({ createdAt: -1 });
        res.status(200).json(expenses);
    } catch (error) {
        res.status(500).json({ message: "Error fetching expenses", error: error.message });
    }
});
module.exports = router;