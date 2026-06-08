const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Product = require('../models/Product');

// Route: RECORD A NEW SALE
router.post('/add', async (req, res) => {
    try {
        const { productId, quantitySold } = req.body;

        // 1. Find the product in the database
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found!" });
        }

        // 2. Check stock levels
        if (product.quantity < quantitySold) {
            return res.status(400).json({ message: "Not enough stock available!" });
        }

        // 3. CRITICAL FIX: Use sellingPrice, not price!
        const totalAmount = product.sellingPrice * quantitySold;

        // 4. Create and save the sale record
        const newSale = new Sale({
            productId: productId,
            quantitySold: quantitySold,
            totalAmount: totalAmount
        });
        const savedSale = await newSale.save();

        // 5. REDUCE THE INVENTORY QUANTITY
        product.quantity = product.quantity - quantitySold;
        await product.save(); 

        res.status(201).json({ 
            message: "Sale recorded successfully!", 
            sale: savedSale,
            remainingStock: product.quantity
        });

    } catch (error) {
        res.status(500).json({ message: "Error recording sale", error: error.message });
    }
});

module.exports = router;