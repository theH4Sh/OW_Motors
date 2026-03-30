const express = require('express')
const { getBranchAnalytics } = require('../controllers/analyticsController')
const requireAuth = require('../middleware/requireAuth')
const { isManager } = require('../middleware/roles')

const router = express.Router()

router.use(requireAuth)

router.get('/branch-summary', isManager, getBranchAnalytics)

module.exports = router
