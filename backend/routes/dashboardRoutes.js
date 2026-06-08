const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Expense = require('../models/Expense');
const Product = require('../models/Product');

// GET DAILY SUMMARY
router.get('/summary', async (req, res) => {
    try {
        // 1. Figure out what "Today" is (Midnight to Midnight)
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        // 2. Fetch all sales from TODAY and attach the product details
        const todaySales = await Sale.find({
            createdAt: { $gte: startOfDay, $lte: endOfDay }
        }).populate('productId');

        let totalSalesQty = 0;
        let totalRevenue = 0;
        let totalCostOfGoods = 0;

        // 3. Calculate Revenue and Cost for today's sales
        todaySales.forEach(sale => {
            totalSalesQty += sale.quantitySold;
            // Check if product still exists in database
            if (sale.productId) {
                totalRevenue += (sale.productId.sellingPrice * sale.quantitySold);
                totalCostOfGoods += (sale.productId.costPrice * sale.quantitySold);
            }
        });

        // 4. Fetch Today's Expenses
        // Note: Check if your Expense model uses 'expenseDate' or 'createdAt'. We will check createdAt for safety.
        const todayExpenses = await Expense.find({
            createdAt: { $gte: startOfDay, $lte: endOfDay }
        });
        
        let totalExpenses = 0;
        todayExpenses.forEach(exp => {
            totalExpenses += exp.amount;
        });

        // 5. Calculate Final Net Profit
        // Profit = (Total Money In - Cost of Items Sold) - Extra Daily Expenses
        const netProfit = (totalRevenue - totalCostOfGoods) - totalExpenses;

        // 6. Send the final numbers to React!
        res.status(200).json({
            totalSalesQty,
            totalRevenue,
            totalExpenses,
            netProfit
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error calculating dashboard metrics", error: error.message });
    }
});

module.exports = router;