const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    barcode: { type: String, required: false },
    quantity: { type: Number, required: true, default: 0 },
    costPrice: { type: Number, required: true }, 
    sellingPrice: { type: Number, required: true }, 
    lowStockThreshold: { type: Number, default: 5 },
    
    // NEW: Link this product to a specific Supplier
    supplierId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Supplier', // This MUST match the name in Supplier.js
        required: false // Kept false so old products don't cause errors
    }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);