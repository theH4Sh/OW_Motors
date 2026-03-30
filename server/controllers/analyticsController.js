const Order = require('../models/Order')
const Product = require('../models/Product')

const getBranchAnalytics = async (req, res, next) => {
    try {
        const { from, to } = req.query
        const branch = req.user.role === 'manager' ? req.user.branch : req.query.branch

        if (!branch) {
            return res.status(400).json({ message: 'Branch is required' })
        }

        // ── Inventory Stats ──
        const products = await Product.find({ branch })
        const totalProducts = products.length
        const totalStockQty = products.reduce((sum, p) => sum + p.quantity, 0)
        const totalStockValue = products.reduce((sum, p) => sum + (p.sellingPrice * p.quantity), 0)
        const totalCostValue = products.reduce((sum, p) => sum + (p.purchasePrice * p.quantity), 0)
        const lowStockItems = products.filter(p => p.quantity <= 5).length

        // Category breakdown
        const categoryBreakdown = {}
        products.forEach(p => {
            if (!categoryBreakdown[p.category]) {
                categoryBreakdown[p.category] = { count: 0, qty: 0, value: 0, profit: 0 }
            }
            categoryBreakdown[p.category].count++
            categoryBreakdown[p.category].qty += p.quantity
            categoryBreakdown[p.category].value += p.sellingPrice * p.quantity
        })

        // ── Sales Stats (date-filtered) ──
        const orderFilter = { branch }
        if (from || to) {
            orderFilter.createdAt = {}
            if (from) orderFilter.createdAt.$gte = new Date(from)
            if (to) {
                const toDate = new Date(to)
                toDate.setHours(23, 59, 59, 999)
                orderFilter.createdAt.$lte = toDate
            }
        }

        const orders = await Order.find(orderFilter).populate('items.product')
        const totalOrders = orders.length
        const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0)
        const totalCOGS = orders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + ((i.purchasePrice || i.product?.purchasePrice || 0) * i.quantity), 0), 0)
        const totalProfit = totalRevenue - totalCOGS
        const totalItemsSold = orders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0)
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

        const productSales = {}
        orders.forEach(order => {
            order.items.forEach(item => {
                const id = item.product?._id?.toString() || item.product?.toString()
                if (!productSales[id]) {
                    productSales[id] = {
                        name: item.product?.name || 'Unknown',
                        category: item.product?.category || '',
                        qtySold: 0,
                        revenue: 0,
                        profit: 0
                    }
                }
                const purchaseP = item.purchasePrice || item.product?.purchasePrice || 0;
                productSales[id].qtySold += item.quantity
                productSales[id].revenue += item.price * item.quantity
                productSales[id].profit += (item.price - purchaseP) * item.quantity;
                
                // Also add to category profit
                const cat = item.product?.category || 'other'
                if (categoryBreakdown[cat]) {
                    if (!categoryBreakdown[cat].profit) categoryBreakdown[cat].profit = 0;
                    categoryBreakdown[cat].profit += (item.price - purchaseP) * item.quantity;
                }
            })
        })
        const topProducts = Object.values(productSales)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 10)

        res.status(200).json({
            inventory: {
                totalProducts,
                totalStockQty,
                totalStockValue,
                totalCostValue,
                lowStockItems,
                categoryBreakdown
            },
            sales: {
                totalOrders,
                totalRevenue,
                totalCOGS,
                totalProfit,
                totalItemsSold,
                avgOrderValue,
                topProducts
            }
        })
    } catch (error) {
        next(error)
    }
}

module.exports = { getBranchAnalytics }
