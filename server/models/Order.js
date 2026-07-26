const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
    amount: { type: Number, required: true },
    paidAt: { type: Date, default: Date.now },
    recordedBy: { type: String, required: true },
    note: { type: String, default: '' }
}, { _id: true });

const installmentSchema = new mongoose.Schema({
    dueDate: { type: Date, required: true },
    amountDue: { type: Number, required: true },
    amountPaid: { type: Number, default: 0 },
    paidAt: { type: Date, default: null },
    status: {
        type: String,
        enum: ['pending', 'partial', 'paid', 'overdue'],
        default: 'pending'
    }
}, { _id: true });

const orderSchema = new mongoose.Schema({
    items: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true },
            purchasePrice: { type: Number, required: true }
        }
    ],
    name: { type: String, required: true },
    fatherName: { type: String, required: true },
    cnic: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    totalAmount: { type: Number, required: true },
    branch: { type: String, required: true },
    processedBy: { type: String, required: true },

    // Payment / installments
    paymentType: {
        type: String,
        enum: ['full', 'installment'],
        default: 'full'
    },
    installmentType: {
        type: String,
        enum: ['fixed', 'flexible'],
        required: false
    },
    downPayment: { type: Number, default: 0 },
    amountPaid: { type: Number, default: 0 },
    paymentStatus: {
        type: String,
        enum: ['paid', 'ongoing', 'overdue'],
        default: 'paid'
    },
    installmentCount: { type: Number, default: null },
    installments: [installmentSchema],
    payments: [paymentSchema]
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
