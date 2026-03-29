const express = require('express')
const { loginUser, signUpUser, getUser, verifyEmail, forgotPassword, resetPassword } = require('../controllers/userController')
const isVerified = require('../middleware/isVerified')
const requireAuth = require('../middleware/requireAuth')
const router = express.Router()

router.post('/login', loginUser)
router.post('/signup', requireAuth, signUpUser)
router.get('/:username', getUser)
router.get('/verify/:token', verifyEmail)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password/:token', resetPassword)

module.exports = router