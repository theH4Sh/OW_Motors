const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    // user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true },
            purchasePrice: { type: Number, required: true }
        }
    ],
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    totalAmount: { type: Number, required: true },
    branch: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);