const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// 1. GET ALL PRODUCTS
router.get('/all', async (req, res) => {
    try {
        // We use .populate() just in case you ever want to show supplier names on the inventory page!
        const products = await Product.find().populate('supplierId');
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: "Error fetching products", error: error.message });
    }
});

// 2. ADD A NEW PRODUCT
router.post('/add', async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct); // Send the new product back to React
    } catch (error) {
        res.status(500).json({ message: "Error adding product", error: error.message });
    }
});

// 3. DELETE A PRODUCT
router.delete('/:id', async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        
        if (!deletedProduct) {
            return res.status(404).json({ message: "Product not found!" });
        }
        
        res.status(200).json({ message: "Product deleted successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting product", error: error.message });
    }
});

// 4. UPDATE A PRODUCT
router.put('/:id', async (req, res) => {
    try {
        // Find the product by its ID and update it with the new data from the frontend
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { returnDocument: 'after' } // <-- FIX: The modern Mongoose way!
        );
        
        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found!" });
        }
        
        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(500).json({ message: "Error updating product", error: error.message });
    }
});
module.exports = router;