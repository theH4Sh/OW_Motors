const express = require('express')
const { getAllProducts, getProduct, deleteProduct, addProduct, updateProduct, searchProducts } = require('../controllers/productController')
const upload = require('../middleware/upload')


const router = express.Router()

router.get("/product/search", searchProducts)
router.get('/product', getAllProducts)
router.get('/product/:id', getProduct)
router.put('/product/:id', upload.single('image'), updateProduct)


// Admin Routes
router.delete('/product/:id', deleteProduct)
router.post('/product', upload.single('image'), addProduct)

module.exports = router