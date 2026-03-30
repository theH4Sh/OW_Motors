const mongoose = require('mongoose')
const Order = require('../models/Order')
const Product = require('../models/Product')

const createOrder = async (req, res, next) => {
    try {
        const { items, name, phone, address } = req.body
        // const userId = req.user._id
        let branch = null

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'Order must contain at least one item' })
        }

        if (!name) {
            return res.status(400).json({ message: 'Name is required' })
        }

        if (!phone) {
            return res.status(400).json({ message: 'Phone number is required' })
        }

        if (!address) {
            return res.status(400).json({ message: 'Shipping address is required' })
        }

        let totalAmount = 0
        const orderItems = []

        for (const item of items) {
            const product = await Product.findById(item.product)

            if (!product) {
                return res.status(404).json({ message: `Product not found` })
            }

            // SECURITY CHECK: Intercept cross-branch inventory deduction
            if (req.user.role === 'manager' && product.branch !== req.user.branch) {
                return res.status(403).json({ message: `Forbidden: You cannot sell inventory assigned to a different branch.` })
            }

            // ✅ Check stock
            if (product.quantity < item.quantity) {
                return res.status(400).json({
                    message: `Not enough stock for ${product.name}. Available: ${product.quantity}`
                })
            }

            totalAmount += product.sellingPrice * item.quantity

            orderItems.push({
                product: product._id,
                quantity: item.quantity,
                price: product.sellingPrice,
                purchasePrice: product.purchasePrice
            })

            if (!branch) branch = product.branch;

            //Reduce Stock
            product.quantity -= item.quantity
            await product.save()
        }

        const order = new Order({
            // user: userId,
            items: orderItems,
            totalAmount,
            name,
            phone,
            address,
            branch
        })

        await order.save()
        res.status(201).json({
            message: 'Order Created Successfully',
            order
        })
    } catch (error) {
        next(error)
    }
}

const getOrders = async (req, res, next) => {
    try {
        // const userId = req.user._id
        const orders = await Order.find().populate('items.product').sort({ createdAt: -1 })

        if (orders.length === 0) {
            return res.status(404).json({ message: 'No orders found' })
        }

        res.status(200).json(orders)
    } catch (error) {
        next(error)
    }
}

const getAllOrders = async (req, res, next) => {
    try {
        const orders = await Order.find().populate('items.product').sort({ createdAt: -1 })

        if (orders.length === 0) {
            return res.status(404).json({ message: 'No orders found' })
        }

        res.status(200).json(orders)
    } catch (error) {
        next(error)
    }
}

const getAllOrdersByBranch = async (req, res, next) => {
    try {
        const { branch } = req.params
        
        // SECURITY CHECK: Intercept cross-branch data leaks
        if (req.user.role === 'manager' && req.user.branch !== branch) {
            return res.status(403).json({ message: 'Forbidden: You can only view orders for your assigned branch.' })
        }

        const orders = await Order.find({ branch }).populate('items.product').sort({ createdAt: -1 })

        if (orders.length === 0) {
            return res.status(404).json({ message: 'No orders found' })
        }

        res.status(200).json(orders)
    } catch (error) {
        next(error)
    }
}


module.exports = {
    createOrder,
    getOrders,
    getAllOrders,
    getAllOrdersByBranch
}