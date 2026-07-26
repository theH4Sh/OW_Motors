const mongoose = require('mongoose')
const Order = require('../models/Order')
const Product = require('../models/Product')
const {
    roundMoney,
    remainingBalance,
    buildFixedInstallments,
    refreshInstallmentStatuses,
    computePaymentStatus,
    applyPaymentToFixedInstallments
} = require('../utils/installments')

const createOrder = async (req, res, next) => {
    try {
        const {
            items,
            name,
            fatherName,
            cnic,
            phone,
            address,
            paymentType = 'full',
            installmentType = null,
            downPayment = 0,
            installmentCount = null
        } = req.body

        let branch = null

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'Order must contain at least one item' })
        }

        if (!name) {
            return res.status(400).json({ message: 'Name is required' })
        }

        if (!fatherName) {
            return res.status(400).json({ message: "Father's name is required" })
        }

        if (!cnic) {
            return res.status(400).json({ message: 'CNIC is required' })
        }

        const cnicDigits = String(cnic).replace(/\D/g, '')
        if (cnicDigits.length !== 13) {
            return res.status(400).json({ message: 'CNIC must be 13 digits' })
        }

        const formattedCnic = `${cnicDigits.slice(0, 5)}-${cnicDigits.slice(5, 12)}-${cnicDigits.slice(12)}`

        if (!phone) {
            return res.status(400).json({ message: 'Phone number is required' })
        }

        if (!address) {
            return res.status(400).json({ message: 'Shipping address is required' })
        }

        if (!['full', 'installment'].includes(paymentType)) {
            return res.status(400).json({ message: 'Invalid payment type' })
        }

        if (paymentType === 'installment' && !['fixed', 'flexible'].includes(installmentType)) {
            return res.status(400).json({ message: 'Choose fixed or flexible installment plan' })
        }

        let totalAmount = 0
        const orderItems = []

        for (const item of items) {
            const product = await Product.findById(item.product)

            if (!product) {
                return res.status(404).json({ message: `Product not found` })
            }

            if (req.user.role === 'manager' && product.branch !== req.user.branch) {
                return res.status(403).json({ message: `Forbidden: You cannot sell inventory assigned to a different branch.` })
            }

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

            if (!branch) branch = product.branch

            product.quantity -= item.quantity
            await product.save()
        }

        totalAmount = roundMoney(totalAmount)

        let paidNow = 0
        let installments = []
        let count = null
        let planType = null
        let status = 'paid'

        if (paymentType === 'full') {
            paidNow = totalAmount
            status = 'paid'
        } else {
            paidNow = roundMoney(Number(downPayment) || 0)

            if (paidNow < 0 || paidNow >= totalAmount) {
                return res.status(400).json({
                    message: 'Down payment must be greater than 0 and less than the total amount'
                })
            }

            if (paidNow <= 0) {
                return res.status(400).json({ message: 'Down payment is required for installment sales' })
            }

            planType = installmentType
            const remaining = roundMoney(totalAmount - paidNow)

            if (installmentType === 'fixed') {
                count = Number(installmentCount)
                if (![3, 6, 9, 12].includes(count)) {
                    return res.status(400).json({ message: 'Installment count must be 3, 6, 9, or 12' })
                }
                installments = buildFixedInstallments(remaining, count)
            }

            status = 'ongoing'
        }

        const orderPayload = {
            items: orderItems,
            totalAmount,
            name,
            fatherName: fatherName.trim(),
            cnic: formattedCnic,
            phone,
            address,
            branch,
            processedBy: req.user.username,
            paymentType,
            downPayment: paidNow,
            amountPaid: paidNow,
            paymentStatus: status,
            installments,
            payments: paidNow > 0 ? [{
                amount: paidNow,
                paidAt: new Date(),
                recordedBy: req.user.username,
                note: paymentType === 'full' ? 'Full payment' : 'Down payment'
            }] : []
        }

        if (paymentType === 'installment') {
            orderPayload.installmentType = planType
            if (count) orderPayload.installmentCount = count
        }

        const order = new Order(orderPayload)

        await order.save()
        const populated = await Order.findById(order._id).populate('items.product')

        res.status(201).json({
            message: 'Order Created Successfully',
            order: populated
        })
    } catch (error) {
        next(error)
    }
}

const getOrders = async (req, res, next) => {
    try {
        const orders = await Order.find().populate('items.product').sort({ createdAt: -1 })
        res.status(200).json(orders)
    } catch (error) {
        next(error)
    }
}

const getAllOrders = async (req, res, next) => {
    try {
        const orders = await Order.find().populate('items.product').sort({ createdAt: -1 })
        res.status(200).json(orders)
    } catch (error) {
        next(error)
    }
}

const getAllOrdersByBranch = async (req, res, next) => {
    try {
        const { branch } = req.params

        if (req.user.role === 'manager' && req.user.branch !== branch) {
            return res.status(403).json({ message: 'Forbidden: You can only view orders for your assigned branch.' })
        }

        const orders = await Order.find({ branch }).populate('items.product').sort({ createdAt: -1 })
        res.status(200).json(orders)
    } catch (error) {
        next(error)
    }
}

const getInstallmentOrders = async (req, res, next) => {
    try {
        const filter = {
            paymentType: 'installment',
            paymentStatus: { $in: ['ongoing', 'overdue'] }
        }

        if (req.user.role === 'manager') {
            filter.branch = req.user.branch
        } else if (req.query.branch && req.query.branch !== 'all') {
            filter.branch = req.query.branch
        }

        const orders = await Order.find(filter)
            .populate('items.product')
            .sort({ updatedAt: -1 })

        // Refresh overdue statuses on read
        await Promise.all(orders.map(async (order) => {
            const before = order.paymentStatus
            refreshInstallmentStatuses(order)
            order.paymentStatus = computePaymentStatus(order)
            if (before !== order.paymentStatus) {
                await order.save()
            }
        }))

        res.status(200).json(orders)
    } catch (error) {
        next(error)
    }
}

const recordInstallmentPayment = async (req, res, next) => {
    try {
        const { id } = req.params
        const { amount, note = '' } = req.body

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid order id' })
        }

        const paymentAmount = roundMoney(Number(amount))
        if (!paymentAmount || paymentAmount <= 0) {
            return res.status(400).json({ message: 'Payment amount must be greater than 0' })
        }

        const order = await Order.findById(id).populate('items.product')
        if (!order) {
            return res.status(404).json({ message: 'Order not found' })
        }

        if (req.user.role === 'manager' && order.branch !== req.user.branch) {
            return res.status(403).json({ message: 'Forbidden: You can only record payments for your branch.' })
        }

        if (order.paymentType !== 'installment') {
            return res.status(400).json({ message: 'This order is not an installment sale' })
        }

        if (order.paymentStatus === 'paid' || remainingBalance(order) <= 0) {
            return res.status(400).json({ message: 'This order is already fully paid' })
        }

        const remaining = remainingBalance(order)
        if (paymentAmount > remaining + 0.001) {
            return res.status(400).json({
                message: `Payment exceeds remaining balance of PKR ${remaining.toLocaleString()}`
            })
        }

        order.amountPaid = roundMoney(order.amountPaid + paymentAmount)
        order.payments.push({
            amount: paymentAmount,
            paidAt: new Date(),
            recordedBy: req.user.username,
            note: String(note || '').trim()
        })

        if (order.installmentType === 'fixed') {
            applyPaymentToFixedInstallments(order, paymentAmount)
        }

        order.paymentStatus = computePaymentStatus(order)
        await order.save()

        res.status(200).json({
            message: 'Payment recorded successfully',
            order
        })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    createOrder,
    getOrders,
    getAllOrders,
    getAllOrdersByBranch,
    getInstallmentOrders,
    recordInstallmentPayment
}
