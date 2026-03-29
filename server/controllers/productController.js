const Product = require('../models/Product')
const mongoose = require('mongoose')
const path = require("path")
const fs = require("fs")

const searchProducts = async (req, res, next) => {
    try {
        const {
            q,              // search keyword
            category,
            minPrice,
            maxPrice,
            page = 1,
            limit = 10,
            sort = "relevance" // relevance | price_low | price_high | newest
        } = req.query;

        const skip = (Number(page) - 1) * Number(limit);

        const matchStage = {};

        // Text search
        if (q) {
            matchStage.$text = { $search: q };
        }

        // Filters
        if (category) matchStage.category = category;

        if (minPrice || maxPrice) {
            matchStage.sellingPrice = {};
            if (minPrice) matchStage.sellingPrice.$gte = Number(minPrice);
            if (maxPrice) matchStage.sellingPrice.$lte = Number(maxPrice);
        }

        // Sorting logic
        let sortStage = {};
        if (q && sort === "relevance") {
            sortStage = { score: { $meta: "textScore" } };
        } else if (sort === "price_low") {
            sortStage = { sellingPrice: 1 };
        } else if (sort === "price_high") {
            sortStage = { sellingPrice: -1 };
        } else if (sort === "newest") {
            sortStage = { createdAt: -1 };
        }

        const pipeline = [
            { $match: matchStage },

            // Add text score if searching
            ...(q
                ? [{
                    $addFields: { score: { $meta: "textScore" } }
                }]
                : []),

            // Join reviews (same as your main route)
            {
                $lookup: {
                    from: "reviews",
                    localField: "_id",
                    foreignField: "product",
                    as: "reviews"
                }
            },
            {
                $addFields: {
                    reviewCount: { $size: "$reviews" },
                    averageRating: {
                        $cond: [
                            { $gt: [{ $size: "$reviews" }, 0] },
                            { $avg: "$reviews.rating" },
                            0
                        ]
                    }
                }
            },
            { $project: { reviews: 0 } },

            { $sort: Object.keys(sortStage).length ? sortStage : { createdAt: -1 } },
            { $skip: skip },
            { $limit: Number(limit) }
        ];

        const products = await Product.aggregate(pipeline);

        res.status(200).json(products);
    } catch (error) {
        next(error);
    }
};


const getAllProducts = async (req, res, next) => {
    try {
        const page = Number(req.query.page) || 1;
        const category = req.query.category;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Build match stage dynamically
        const matchStage = {};
        if (category) matchStage.category = category;

        const products = await Product.aggregate([
            { $match: matchStage }, // <-- filter by category here
            {
                $lookup: {
                    from: "reviews",        // Mongo collection name
                    localField: "_id",
                    foreignField: "product",
                    as: "reviews"
                }
            },
            {
                $addFields: {
                    reviewCount: { $size: "$reviews" },
                    averageRating: {
                        $cond: [
                            { $gt: [{ $size: "$reviews" }, 0] },
                            { $avg: "$reviews.rating" },
                            0
                        ]
                    }
                }
            },
            {
                $project: {
                    reviews: 0 // remove heavy array
                }
            },
            { $skip: skip },
            { $limit: limit }
        ]);

        res.status(200).json(products);
    } catch (error) {
        next(error);
    }
};

const getProductByBranch = async (req, res, next) => {
    try {
        const { branch } = req.params
        const products = await Product.find({ branch })
        res.status(200).json(products)
    } catch (error) {
        next(error)
    }
}

const getProduct = async (req, res, next) => {
    try {
        const { id } = req.params
        //validating id
        if (!mongoose.Types.ObjectId.isValid(id)) {
            const error = new Error("Invalid product id")
            error.status = 400
            return next(error)
        }

        const product = await Product.findById(id)

        if (!product) {
            const error = new Error("Product Not Found")
            error.status = 404
            return next(error)
        }

        res.status(200).json(product)
    } catch (error) {
        next(error)
    }
}

const deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params
        //validating id
        if (!mongoose.Types.ObjectId.isValid(id)) {
            const error = new Error("Invalid product id")
            error.status = 400
            return next(error)
        }

        const deleteProduct = await Product.findByIdAndDelete(id)

        if (!deleteProduct) {
            const error = new Error("Product Not Found")
            error.status = 404
            return next(error)
        }

        res.status(200).json({ message: 'Product Deleted Successfully', deleteProduct })
    } catch (error) {
        next(error)
    }
}

const addProduct = async (req, res, next) => {
    try {
        const { name, purchasePrice, sellingPrice, description, quantity, category, branch } = req.body

        if (!req.file) {
            return res.status(400).json({ error: 'Product Image Required' })
        }

        const newProduct = new Product({
            name,
            purchasePrice,
            sellingPrice,
            description,
            quantity,
            image: req.file.filename,
            category,
            branch
        })

        await newProduct.save()
        res.status(201).json(newProduct)
    } catch (error) {
        next(error)
    }
}

const updateProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Update fields if provided
        product.name = req.body.name || product.name;
        product.description = req.body.description || product.description;
        product.purchasePrice = req.body.purchasePrice || product.purchasePrice;
        product.sellingPrice = req.body.sellingPrice || product.sellingPrice;
        product.quantity = req.body.quantity || product.quantity;
        product.category = req.body.category || product.category;
        product.branch = req.body.branch || product.branch;

        // If new image uploaded
        if (req.file) {
            // delete old image
            const oldImagePath = path.join(__dirname, "..", "images", product.image);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }

            product.image = req.file.filename;
        }

        const updatedProduct = await product.save();
        res.status(200).json(updatedProduct);
    } catch (error) {
        next(error);
    }
};

module.exports = { getAllProducts, getProduct, deleteProduct, addProduct, updateProduct, searchProducts }