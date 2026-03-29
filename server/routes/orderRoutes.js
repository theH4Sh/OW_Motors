const express = require('express')
const { createOrder, getOrders, getAllOrders, getAllOrdersByBranch } = require('../controllers/orderController')
const requireAuth = require('../middleware/requireAuth')
const { isAdmin, isManager } = require('../middleware/roles')

const router = express.Router()

router.use(requireAuth)

// Managers create orders for their branch
router.post('/create-order', isManager, createOrder)

// Generic get orders for a specific user (if relevant)
router.get('/get-orders', getOrders)

// Admins can see EVERYTHING
router.get('/get-all-orders', isAdmin, getAllOrders)

// Managers can see orders for their specific branch (Admins can also use this if we modify isManager)
router.get('/get-all-orders-by-branch/:branch', isManager, getAllOrdersByBranch)

module.exports = router