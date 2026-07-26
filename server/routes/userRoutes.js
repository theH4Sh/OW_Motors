const express = require('express')
const { loginUser, signUpUser, getUser, verifyEmail, forgotPassword, resetPassword, getAllManagers, deleteManager } = require('../controllers/userController')
const requireAuth = require('../middleware/requireAuth')
const { isAdmin } = require('../middleware/roles')
const router = express.Router()

router.post('/login', loginUser)
router.post('/signup', requireAuth, isAdmin, signUpUser)
router.get('/managers', requireAuth, isAdmin, getAllManagers)
router.delete('/managers/:id', requireAuth, isAdmin, deleteManager)
router.get('/:username', getUser)
router.get('/verify/:token', verifyEmail)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password/:token', resetPassword)

module.exports = router