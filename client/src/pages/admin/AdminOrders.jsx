import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Invoice from '../../components/Invoice';

const AdminOrders = () => {
    const { token } = useSelector(state => state.auth);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [branchFilter, setBranchFilter] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState(null);

    const API = import.meta.env.VITE_API || 'http://localhost:8000/api/';

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await fetch(`${API}orders/get-all-orders`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (res.ok && Array.isArray(data)) setOrders(data);
            } catch (err) {
                console.error('Failed to fetch orders:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [token]);

    // Get unique branches
    const branches = [...new Set(orders.map(o => o.branch))];

    // Filters
    const filteredOrders = orders.filter(o => {
        const matchBranch = branchFilter === 'all' || o.branch === branchFilter;
        const q = searchQuery.toLowerCase();
        const matchSearch = !q ||
            o.name.toLowerCase().includes(q) ||
            o.phone?.toLowerCase().includes(q) ||
            o._id.toLowerCase().includes(q) ||
            o.branch.toLowerCase().includes(q);
        return matchBranch && matchSearch;
    });

    const totalRevenue = filteredOrders.reduce((s, o) => s + o.totalAmount, 0);
    const fmt = (n) => 'PKR ' + (n || 0).toLocaleString();

    return (
        <div className="pb-10">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">All Orders</h1>
                    <p className="text-sm text-gray-500 mt-1">{filteredOrders.length} orders • {fmt(totalRevenue)} total</p>
                </div>
            </div>

            {/* Filters Row */}
            <div className="flex items-center gap-4 mb-6 flex-wrap">
                {/* Branch Filter */}
                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={() => setBranchFilter('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${branchFilter === 'all'
                            ? 'bg-[#0B7C56] text-white shadow-md'
                            : 'bg-white text-gray-600 border border-gray-200 hover:border-[#0B7C56]'}`}
                    >All Branches</button>
                    {branches.map(b => (
                        <button
                            key={b}
                            onClick={() => setBranchFilter(b)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${branchFilter === b
                                ? 'bg-[#0B7C56] text-white shadow-md'
                                : 'bg-white text-gray-600 border border-gray-200 hover:border-[#0B7C56]'}`}
                        >{b}</button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative w-72 ml-auto">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    <input
                        type="text"
                        placeholder="Search orders..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white shadow-sm text-sm focus:ring-2 focus:ring-[#0B7C56] focus:border-transparent outline-none transition-all"
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20 text-gray-400">
                    <div className="w-10 h-10 border-4 border-gray-200 border-t-[#0B7C56] rounded-full animate-spin mx-auto mb-4"></div>
                    <p>Loading orders...</p>
                </div>
            ) : (
                <div className="dash-panel">
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
                                    <th className="py-3 px-5 font-semibold text-xs uppercase tracking-wider text-center">Invoice</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-12 text-gray-400">
                                            {searchQuery ? `No orders matching "${searchQuery}"` : 'No orders found.'}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredOrders.map(order => (
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
                                            <td className="py-3 px-5 text-center">
                                                <button
                                                    onClick={() => setSelectedOrder(order)}
                                                    className="text-xs font-semibold text-[#0B7C56] hover:text-[#095c40] bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-all"
                                                >
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Invoice Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <Invoice order={selectedOrder} onClose={() => setSelectedOrder(null)} />
                </div>
            )}
        </div>
    );
};

export default AdminOrders;
