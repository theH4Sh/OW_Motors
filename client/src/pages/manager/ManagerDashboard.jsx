import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProducts } from '../../slice/inventorySlice';
import { fetchOrdersByBranch } from '../../slice/orderSlice';
import { Link } from 'react-router-dom';

const ManagerDashboard = () => {
    const dispatch = useDispatch();
    const { products, status } = useSelector(state => state.inventory);
    const { orders } = useSelector(state => state.orders);
    const { branch, username } = useSelector(state => state.auth);

    useEffect(() => {
        dispatch(fetchProducts());
        if (branch) dispatch(fetchOrdersByBranch(branch));
    }, [dispatch, branch]);

    const totalInventory = products.length;
    const totalUnits = products.reduce((sum, p) => sum + p.quantity, 0);
    const lowStockItems = products.filter(p => p.quantity <= 5);
    const totalStockValue = products.reduce((acc, curr) => acc + (curr.sellingPrice * curr.quantity), 0);
    const totalRevenue = Array.isArray(orders) ? orders.reduce((sum, o) => sum + o.totalAmount, 0) : 0;
    const totalCOGS = Array.isArray(orders) ? orders.reduce((sum, o) => sum + o.items.reduce((itemSum, item) => itemSum + ((item.purchasePrice || item.product?.purchasePrice || 0) * item.quantity), 0), 0) : 0;
    const totalProfit = totalRevenue - totalCOGS;
    const totalOrders = Array.isArray(orders) ? orders.length : 0;

    const greeting = () => {
        const h = new Date().getHours();
        if (h < 12) return 'Good morning';
        if (h < 17) return 'Good afternoon';
        return 'Good evening';
    };

    return (
        <div className="pb-10">
            {/* Welcome Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                    {greeting()}, {username} 👋
                </h1>
                <p className="text-gray-500 text-lg">
                    Here's what's happening at <span className="font-semibold text-[#0B7C56]">{branch}</span> branch today.
                </p>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-10">
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
                        <p className="kpi-label">Orders Processed</p>
                        <p className="kpi-value">{totalOrders}</p>
                    </div>
                </div>

                <div className="kpi-card">
                    <div className="kpi-icon bg-violet-50 text-violet-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                    </div>
                    <div>
                        <p className="kpi-label">Stock Value</p>
                        <p className="kpi-value">PKR {totalStockValue.toLocaleString()}</p>
                    </div>
                </div>

                <div className="kpi-card">
                    <div className="kpi-icon bg-amber-50 text-amber-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                    </div>
                    <div>
                        <p className="kpi-label">Total Units</p>
                        <p className="kpi-value">{totalUnits}</p>
                    </div>
                </div>
            </div>

            {/* Two-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Low Stock Alerts */}
                <div className="dash-panel">
                    <div className="dash-panel-header">
                        <h2 className="dash-panel-title">
                            <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                            Low Stock Alerts
                        </h2>
                        <span className="text-sm font-semibold text-red-500 bg-red-50 px-3 py-1 rounded-full">{lowStockItems.length} items</span>
                    </div>
                    <div className="dash-panel-body">
                        {lowStockItems.length === 0 ? (
                            <div className="text-center py-8 text-gray-400">
                                <svg className="w-12 h-12 mx-auto mb-2 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <p className="font-medium">All stock levels are healthy!</p>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                                {lowStockItems.map(item => (
                                    <div key={item._id} className="flex items-center justify-between p-3 rounded-lg bg-red-50/50 border border-red-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-white border border-gray-100 overflow-hidden flex-shrink-0">
                                                {item.image && <img src={`http://localhost:8000/images/${item.image}`} alt={item.name} className="w-full h-full object-cover" />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-800">{item.name}</p>
                                                <p className="text-xs text-gray-500 capitalize">{item.category?.replace('_', ' ')}</p>
                                            </div>
                                        </div>
                                        <span className="text-sm font-bold text-red-500">{item.quantity} left</span>
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
                    <div className="dash-panel-body">
                        <div className="grid grid-cols-2 gap-3">
                            <Link to="/manager/pos" className="quick-action-card bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200">
                                <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg>
                                <span className="font-semibold text-sm">New Sale</span>
                            </Link>
                            <Link to="/manager/inventory" className="quick-action-card bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200">
                                <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                                <span className="font-semibold text-sm">Manage Stock</span>
                            </Link>
                            <Link to="/manager/orders" className="quick-action-card bg-violet-50 hover:bg-violet-100 text-violet-700 border-violet-200">
                                <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                <span className="font-semibold text-sm">View Orders</span>
                            </Link>
                            <Link to="/manager/analytics" className="quick-action-card bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200">
                                <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                <span className="font-semibold text-sm">Analytics</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagerDashboard;
