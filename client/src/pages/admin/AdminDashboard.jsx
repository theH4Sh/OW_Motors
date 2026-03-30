import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
    const { token, username } = useSelector(state => state.auth);
    const [loading, setLoading] = useState(true);
    const [managers, setManagers] = useState([]);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);

    const API = import.meta.env.VITE_API || 'http://localhost:8000/api/';
    const headers = { 'Authorization': `Bearer ${token}` };

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [mgrRes, prodRes, orderRes] = await Promise.all([
                    fetch(`${API}auth/managers`, { headers }),
                    fetch(`${API}product`, { headers }),
                    fetch(`${API}orders/get-all-orders`, { headers }),
                ]);
                const mgrData = await mgrRes.json();
                const prodData = await prodRes.json();
                const orderData = await orderRes.json();

                if (mgrRes.ok) setManagers(mgrData);
                if (prodRes.ok) setProducts(prodData);
                if (orderRes.ok && Array.isArray(orderData)) setOrders(orderData);
            } catch (err) {
                console.error('Admin dashboard fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [token]);

    // Computed stats
    const totalManagers = managers.length;
    const totalProducts = products.length;
    const totalUnits = products.reduce((s, p) => s + p.quantity, 0);
    const totalStockValue = products.reduce((s, p) => s + (p.sellingPrice * p.quantity), 0);
    const lowStockProducts = products.filter(p => p.quantity <= 5);
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((s, o) => s + o.totalAmount, 0);
    const totalCOGS = orders.reduce((s, o) => s + o.items.reduce((sum, item) => sum + ((item.purchasePrice || item.product?.purchasePrice || 0) * item.quantity), 0), 0);
    const totalProfit = totalRevenue - totalCOGS;

    // Branch breakdown
    const branchMap = {};
    products.forEach(p => {
        if (!branchMap[p.branch]) branchMap[p.branch] = { products: 0, units: 0, value: 0, orders: 0, revenue: 0 };
        branchMap[p.branch].products++;
        branchMap[p.branch].units += p.quantity;
        branchMap[p.branch].value += p.sellingPrice * p.quantity;
    });
    orders.forEach(o => {
        if (!branchMap[o.branch]) branchMap[o.branch] = { products: 0, units: 0, value: 0, orders: 0, revenue: 0, cogs: 0, profit: 0 };
        branchMap[o.branch].orders++;
        branchMap[o.branch].revenue += o.totalAmount;
        const orderCOGS = o.items.reduce((sum, item) => sum + ((item.purchasePrice || item.product?.purchasePrice || 0) * item.quantity), 0);
        branchMap[o.branch].cogs += orderCOGS;
        branchMap[o.branch].profit += (o.totalAmount - orderCOGS);
    });

    // Recent orders (last 5)
    const recentOrders = orders.slice(0, 5);

    const fmt = (n) => 'PKR ' + (n || 0).toLocaleString();

    const greeting = () => {
        const h = new Date().getHours();
        if (h < 12) return 'Good morning';
        if (h < 17) return 'Good afternoon';
        return 'Good evening';
    };

    return (
        <div className="pb-10">
            {/* Welcome */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                    {greeting()}, {username} 👋
                </h1>
                <p className="text-gray-500 text-lg">
                    Here's a global overview of <span className="font-semibold text-[#0B7C56]">OW Motors</span> operations.
                </p>
            </div>

            {loading ? (
                <div className="text-center py-20 text-gray-400">
                    <div className="w-10 h-10 border-4 border-gray-200 border-t-[#0B7C56] rounded-full animate-spin mx-auto mb-4"></div>
                    <p>Loading dashboard...</p>
                </div>
            ) : (
                <>
                    {/* ─── KPIs ─── */}
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                        <div className="kpi-card">
                            <div className="kpi-icon bg-emerald-50 text-emerald-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <div>
                                <p className="kpi-label">Total Revenue</p>
                                <p className="kpi-value text-emerald-600">PKR {totalRevenue.toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="kpi-card">
                            <div className="kpi-icon bg-rose-50 text-rose-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                            </div>
                            <div>
                                <p className="kpi-label">Total Expenses</p>
                                <p className="kpi-value text-rose-600">PKR {totalCOGS.toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="kpi-card">
                            <div className="kpi-icon bg-emerald-100 text-[#0B7C56]">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                            </div>
                            <div>
                                <p className="kpi-label">Total Profit</p>
                                <p className="kpi-value text-[#0B7C56]">PKR {totalProfit.toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="kpi-card">
                            <div className="kpi-icon bg-blue-50 text-blue-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                            </div>
                            <div>
                                <p className="kpi-label">Total Orders</p>
                                <p className="kpi-value">{totalOrders}</p>
                            </div>
                        </div>
                        <div className="kpi-card">
                            <div className="kpi-icon bg-violet-50 text-violet-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                            </div>
                            <div>
                                <p className="kpi-label">Branches</p>
                                <p className="kpi-value">{totalManagers}</p>
                            </div>
                        </div>
                        <div className="kpi-card">
                            <div className="kpi-icon bg-amber-50 text-amber-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                            </div>
                            <div>
                                <p className="kpi-label">Product Types</p>
                                <p className="kpi-value">{totalProducts}</p>
                            </div>
                        </div>
                        <div className="kpi-card">
                            <div className="kpi-icon bg-cyan-50 text-cyan-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                            </div>
                            <div>
                                <p className="kpi-label">Total Units</p>
                                <p className="kpi-value">{totalUnits}</p>
                            </div>
                        </div>
                        <div className="kpi-card">
                            <div className="kpi-icon bg-slate-100 text-slate-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                            </div>
                            <div>
                                <p className="kpi-label">Stock Value</p>
                                <p className="kpi-value">PKR {totalStockValue.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    {/* ─── Branch Performance Table ─── */}
                    <div className="dash-panel mb-6">
                        <div className="dash-panel-header">
                            <h2 className="dash-panel-title">
                                <span className="inline-block w-2 h-2 rounded-full bg-[#0B7C56] mr-2"></span>
                                Branch Performance
                            </h2>
                            <span className="text-sm text-gray-500">{Object.keys(branchMap).length} branches</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-gray-200 text-gray-500">
                                    <tr>
                                        <th className="py-3 px-5 font-semibold text-xs uppercase tracking-wider">Branch</th>
                                        <th className="py-3 px-5 font-semibold text-xs uppercase tracking-wider text-center">Products</th>
                                        <th className="py-3 px-5 font-semibold text-xs uppercase tracking-wider text-center">Units</th>
                                        <th className="py-3 px-5 font-semibold text-xs uppercase tracking-wider text-right">Stock Value</th>
                                        <th className="py-3 px-5 font-semibold text-xs uppercase tracking-wider text-center">Orders</th>
                                        <th className="py-3 px-5 font-semibold text-xs uppercase tracking-wider text-right">Revenue</th>
                                        <th className="py-3 px-5 font-semibold text-xs uppercase tracking-wider text-right text-emerald-600">Profit</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {Object.keys(branchMap).length === 0 ? (
                                        <tr><td colSpan="6" className="text-center py-8 text-gray-400">No branch data yet.</td></tr>
                                    ) : (
                                        Object.entries(branchMap).sort((a, b) => b[1].revenue - a[1].revenue).map(([name, data]) => (
                                            <tr key={name} className="hover:bg-slate-50 transition-colors">
                                                <td className="py-3.5 px-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">{name[0]?.toUpperCase()}</div>
                                                        <span className="font-semibold text-gray-800">{name}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-5 text-center text-gray-600">{data.products}</td>
                                                <td className="py-3.5 px-5 text-center text-gray-600">{data.units}</td>
                                                <td className="py-3.5 px-5 text-right font-medium text-gray-800">{fmt(data.value)}</td>
                                                <td className="py-3.5 px-5 text-center text-gray-600">{data.orders}</td>
                                                <td className="py-3.5 px-5 text-right font-bold text-slate-800">{fmt(data.revenue)}</td>
                                                <td className="py-3.5 px-5 text-right font-bold text-[#0B7C56]">{fmt(data.profit)}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* ─── Panels: Low Stock + Quick Actions + Managers ─── */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                        {/* Low Stock */}
                        <div className="dash-panel">
                            <div className="dash-panel-header">
                                <h2 className="dash-panel-title">
                                    <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                                    Low Stock
                                </h2>
                                <span className="text-sm font-semibold text-red-500 bg-red-50 px-3 py-1 rounded-full">{lowStockProducts.length}</span>
                            </div>
                            <div className="dash-panel-body">
                                {lowStockProducts.length === 0 ? (
                                    <div className="text-center py-6 text-gray-400">
                                        <svg className="w-10 h-10 mx-auto mb-2 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        <p className="text-sm font-medium">All healthy!</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                                        {lowStockProducts.slice(0, 8).map(item => (
                                            <div key={item._id} className="flex items-center justify-between p-2.5 rounded-lg bg-red-50/50 border border-red-100">
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-800 leading-tight">{item.name}</p>
                                                    <p className="text-xs text-gray-500">{item.branch}</p>
                                                </div>
                                                <span className="text-sm font-bold text-red-500 flex-shrink-0">{item.quantity} left</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="dash-panel">
                            <div className="dash-panel-header">
                                <h2 className="dash-panel-title">Quick Actions</h2>
                            </div>
                            <div className="dash-panel-body space-y-2">
                                <Link to="/admin/managers" className="flex items-center gap-3 p-3 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 transition-all hover:-translate-y-0.5">
                                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                                    <span className="font-semibold text-sm">Register New Branch</span>
                                </Link>
                                <Link to="/admin/inventory" className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-all hover:-translate-y-0.5">
                                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                                    <span className="font-semibold text-sm">View Global Inventory</span>
                                </Link>
                                <Link to="/admin/orders" className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition-all hover:-translate-y-0.5">
                                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                                    <span className="font-semibold text-sm">View All Orders</span>
                                </Link>
                            </div>
                        </div>

                        {/* Managers List */}
                        <div className="dash-panel">
                            <div className="dash-panel-header">
                                <h2 className="dash-panel-title">
                                    <span className="inline-block w-2 h-2 rounded-full bg-violet-500 mr-2"></span>
                                    Active Managers
                                </h2>
                            </div>
                            <div className="dash-panel-body">
                                {managers.length === 0 ? (
                                    <p className="text-center py-4 text-gray-400 text-sm">No managers registered.</p>
                                ) : (
                                    <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                                        {managers.map(mgr => (
                                            <div key={mgr._id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors">
                                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0B7C56] to-emerald-400 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                                                    {mgr.username?.[0]?.toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-gray-800 truncate">{mgr.username}</p>
                                                    <p className="text-xs text-gray-500 truncate">{mgr.branch}</p>
                                                </div>
                                                {mgr.isVerified ? (
                                                    <span className="ml-auto text-xs font-semibold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full flex-shrink-0">Verified</span>
                                                ) : (
                                                    <span className="ml-auto text-xs font-semibold bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full flex-shrink-0">Pending</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ─── Recent Orders (Full Width Bottom) ─── */}
                    <div className="dash-panel">
                        <div className="dash-panel-header">
                            <h2 className="dash-panel-title">
                                <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                                Recent Orders
                            </h2>
                            <Link to="/admin/orders" className="text-sm font-semibold text-[#0B7C56] hover:underline">View All →</Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-gray-200 text-gray-500">
                                    <tr>
                                        <th className="py-3 px-5 font-semibold text-xs uppercase tracking-wider">Order ID</th>
                                        <th className="py-3 px-5 font-semibold text-xs uppercase tracking-wider">Customer</th>
                                        <th className="py-3 px-5 font-semibold text-xs uppercase tracking-wider">Branch</th>
                                        <th className="py-3 px-5 font-semibold text-xs uppercase tracking-wider text-center">Items</th>
                                        <th className="py-3 px-5 font-semibold text-xs uppercase tracking-wider text-right">Amount</th>
                                        <th className="py-3 px-5 font-semibold text-xs uppercase tracking-wider text-right">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {recentOrders.length === 0 ? (
                                        <tr><td colSpan="6" className="text-center py-8 text-gray-400">No orders yet.</td></tr>
                                    ) : (
                                        recentOrders.map(order => (
                                            <tr key={order._id} className="hover:bg-slate-50 transition-colors">
                                                <td className="py-3 px-5 font-mono text-sm text-gray-500">{order._id.slice(-8).toUpperCase()}</td>
                                                <td className="py-3 px-5">
                                                    <div className="font-semibold text-gray-800">{order.name}</div>
                                                    <div className="text-xs text-gray-500">{order.phone}</div>
                                                </td>
                                                <td className="py-3 px-5">
                                                    <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full">{order.branch}</span>
                                                </td>
                                                <td className="py-3 px-5 text-center text-gray-600">{order.items.reduce((s, i) => s + i.quantity, 0)}</td>
                                                <td className="py-3 px-5 text-right font-bold text-gray-800">{fmt(order.totalAmount)}</td>
                                                <td className="py-3 px-5 text-right text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminDashboard;
