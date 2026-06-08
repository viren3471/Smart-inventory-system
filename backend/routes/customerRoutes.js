const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');

// 1. GET ALL CUSTOMERS
router.get('/all', async (req, res) => {
    try {
        const customers = await Customer.find();
        res.status(200).json(customers);
    } catch (error) {
        res.status(500).json({ message: "Error fetching customers", error: error.message });
    }
});

// 2. ADD A NEW CUSTOMER
router.post('/add', async (req, res) => {
    try {
        const { name, phone, totalDue } = req.body;
        const newCustomer = new Customer({ name, phone, totalDue });
        const savedCustomer = await newCustomer.save();
        res.status(201).json(savedCustomer);
    } catch (error) {
        res.status(500).json({ message: "Error adding customer", error: error.message });
    }
});

// 3. SETTLE (PAY OFF) UDHAAR
router.put('/:id/pay', async (req, res) => {
    try {
        const { amountPaid } = req.body;
        const customer = await Customer.findById(req.params.id);

        if (!customer) {
            return res.status(404).json({ message: "Customer not found!" });
        }

        // Reduce their debt
        customer.totalDue = customer.totalDue - amountPaid;
        await customer.save();

        res.status(200).json({ message: "Debt settled successfully!", customer });
    } catch (error) {
        res.status(500).json({ message: "Error settling debt", error: error.message });
    }
});

module.exports = router;