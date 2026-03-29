const express = require('express')
const { createOrder, getOrders, getAllOrders, getAllOrdersByBranch } = require('../controllers/orderController')

const router = express.Router()

router.post('/create-order', createOrder)

router.get('/get-orders', getOrders)

router.get('/get-all-orders', getAllOrders)

router.get('/get-all-orders-by-branch/:branch', getAllOrdersByBranch)

module.exports = router