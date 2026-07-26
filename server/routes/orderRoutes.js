const express = require('express')
const {
    createOrder,
    getOrders,
    getAllOrders,
    getAllOrdersByBranch,
    getInstallmentOrders,
    recordInstallmentPayment
} = require('../controllers/orderController')
const requireAuth = require('../middleware/requireAuth')
const { isAdmin, isManager } = require('../middleware/roles')

const router = express.Router()

router.use(requireAuth)

router.post('/create-order', isManager, createOrder)
router.get('/get-orders', getOrders)
router.get('/get-all-orders', isAdmin, getAllOrders)
router.get('/get-all-orders-by-branch/:branch', isManager, getAllOrdersByBranch)
router.get('/installments', isManager, getInstallmentOrders)
router.post('/:id/payments', isManager, recordInstallmentPayment)

module.exports = router
