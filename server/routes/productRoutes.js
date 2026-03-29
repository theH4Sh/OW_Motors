const express = require('express')
const { getAllProducts, getProduct, deleteProduct, addProduct, updateProduct, searchProducts } = require('../controllers/productController')
const upload = require('../middleware/upload')
const requireAuth = require('../middleware/requireAuth')
const { isManager, isAdmin } = require('../middleware/roles')

const router = express.Router()

// Apply requireAuth to all product routes below this point
router.use(requireAuth)

// Both Managers and Admins can access these
router.get("/product/search", isManager, searchProducts)
router.get('/product', isManager, getAllProducts)
router.get('/product/:id', isManager, getProduct)
router.put('/product/:id', isManager, upload.single('image'), updateProduct)
router.post('/product', isManager, upload.single('image'), addProduct)
router.delete('/product/:id', isManager, deleteProduct)

module.exports = router