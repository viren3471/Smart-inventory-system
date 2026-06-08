const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
    // The "ref" below is the magic word that prevents the 400 error!
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantitySold: { type: Number, required: true }
}, { timestamps: true }); // timestamps is required for the "Today" math to work

module.exports = mongoose.model('Sale', saleSchema);