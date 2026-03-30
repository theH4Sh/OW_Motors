const Order = require('../models/Order')
const Product = require('../models/Product')

const getBranchAnalytics = async (req, res, next) => {
    try {
        const { from, to } = req.query
        const isManager = req.user.role === 'manager'
        const branch = isManager ? req.user.branch : req.query.branch

        // ── 1. Inventory Stats ──
        const inventoryFilter = branch ? { branch } : {}
        const products = await Product.find(inventoryFilter)
        
        const totalProducts = products.length
        const totalStockQty = products.reduce((sum, p) => sum + p.quantity, 0)
        const totalStockValue = products.reduce((sum, p) => sum + (p.sellingPrice * p.quantity), 0)
        const totalCostValue = products.reduce((sum, p) => sum + (p.purchasePrice * p.quantity), 0)
        const lowStockItems = products.filter(p => p.quantity <= 5).length

        // Category breakdown
        const categoryBreakdown = {}
        products.forEach(p => {
            if (!categoryBreakdown[p.category]) {
                categoryBreakdown[p.category] = { count: 0, qty: 0, value: 0, profit: 0, revenue: 0 }
            }
            categoryBreakdown[p.category].count++
            categoryBreakdown[p.category].qty += p.quantity
            categoryBreakdown[p.category].value += p.sellingPrice * p.quantity // Total potential value on shelf
        })

        // ── 2. Sales Stats (date-filtered) ──
        const orderFilter = branch ? { branch } : {}
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

        // Time-series & Grouped Stats for Charts
        const dailyData = {}
        const branchPerformance = {}
        const productSales = {}

        orders.forEach(order => {
            // Trend Data (Day-by-Day)
            const dateKey = new Date(order.createdAt).toISOString().split('T')[0]
            if (!dailyData[dateKey]) dailyData[dateKey] = { date: dateKey, revenue: 0, profit: 0, orders: 0 }
            dailyData[dateKey].revenue += order.totalAmount
            dailyData[dateKey].orders++

            // Branch Comparison (Only if global)
            const b = order.branch
            if (!branchPerformance[b]) branchPerformance[b] = { name: b, revenue: 0, profit: 0, orders: 0 }
            branchPerformance[b].revenue += order.totalAmount
            branchPerformance[b].orders++

            let orderProfit = 0
            order.items.forEach(item => {
                const id = item.product?._id?.toString() || item.product?.toString()
                const purchaseP = item.purchasePrice || item.product?.purchasePrice || 0;
                const itemRevenue = item.price * item.quantity
                const itemProfit = (item.price - purchaseP) * item.quantity
                orderProfit += itemProfit

                // Product Sales
                if (!productSales[id]) {
                    productSales[id] = {
                        name: item.product?.name || 'Unknown',
                        category: item.product?.category || 'other',
                        qtySold: 0,
                        revenue: 0,
                        profit: 0
                    }
                }
                productSales[id].qtySold += item.quantity
                productSales[id].revenue += itemRevenue
                productSales[id].profit += itemProfit

                // Category Profit / Revenue
                const cat = item.product?.category || 'other'
                if (categoryBreakdown[cat]) {
                    categoryBreakdown[cat].revenue += itemRevenue
                    categoryBreakdown[cat].profit += itemProfit
                }
            })
            dailyData[dateKey].profit += orderProfit
            branchPerformance[b].profit += orderProfit
        })

        const trendData = Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date))
        const branchComparison = Object.values(branchPerformance).sort((a, b) => b.revenue - a.revenue)
        const topProducts = Object.values(productSales).sort((a, b) => b.revenue - a.revenue).slice(0, 10)

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
            },
            charts: {
                trendData,
                branchComparison,
                categoryData: Object.entries(categoryBreakdown).map(([name, data]) => ({ name, ...data }))
            }
        })
    } catch (error) {
        next(error)
    }
}

module.exports = { getBranchAnalytics }
