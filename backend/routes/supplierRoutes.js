const express = require('express');
const router = express.Router();
const Supplier = require('../models/Supplier');

// 1. GET ALL SUPPLIERS
router.get('/all', async (req, res) => {
    try {
        const suppliers = await Supplier.find();
        res.status(200).json(suppliers);
    } catch (error) {
        res.status(500).json({ message: "Error fetching suppliers", error: error.message });
    }
});

// 2. ADD A NEW SUPPLIER
router.post('/add', async (req, res) => {
    try {
        const { name, company, phone } = req.body;
        const newSupplier = new Supplier({ name, company, phone });
        const savedSupplier = await newSupplier.save();
        
        // Sending the saved supplier BACK to React so it gets the real _id!
        res.status(201).json(savedSupplier);
    } catch (error) {
        res.status(500).json({ message: "Error adding supplier", error: error.message });
    }
});

// 3. DELETE A SUPPLIER
router.delete('/:id', async (req, res) => {
    try {
        const deletedSupplier = await Supplier.findByIdAndDelete(req.params.id);
        
        if (!deletedSupplier) {
            return res.status(404).json({ message: "Supplier not found!" });
        }
        
        res.status(200).json({ message: "Supplier deleted successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting supplier", error: error.message });
    }
});

module.exports = router;