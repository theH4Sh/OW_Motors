const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    quantity: { type: Number, required: true },
    purchasePrice: { type: Number, required: true },
    sellingPrice: { type: Number, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true },
    branch: { type: String, required: true },
}, { timestamps: true })

productSchema.index({
    name: "text",
    description: "text",
    category: "text"
});


module.exports = mongoose.model('Product', productSchema)