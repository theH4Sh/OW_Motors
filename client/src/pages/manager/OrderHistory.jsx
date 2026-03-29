import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrdersByBranch } from '../../slice/orderSlice';
import Invoice from '../../components/Invoice';

const OrderHistory = () => {
    const dispatch = useDispatch();
    const { orders, status } = useSelector(state => state.orders);
    const { branch } = useSelector(state => state.auth);
    
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        if (branch) {
            dispatch(fetchOrdersByBranch(branch));
        }
    }, [dispatch, branch]);

    return (
        <div className="mt-4">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Order History</h1>
            
            <div className="bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-gray-200 text-gray-600">
                        <tr>
                            <th className="py-4 px-6 font-semibold">Order ID</th>
                            <th className="py-4 px-6 font-semibold">Date</th>
                            <th className="py-4 px-6 font-semibold">Customer</th>
                            <th className="py-4 px-6 font-semibold">Items</th>
                            <th className="py-4 px-6 font-semibold">Total Amount</th>
                            <th className="py-4 px-6 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {status === 'loading' ? (
                            <tr><td colSpan="6" className="text-center py-8 text-gray-500">Loading historical orders...</td></tr>
                        ) : orders.length === 0 ? (
                            <tr><td colSpan="6" className="text-center py-12 text-gray-500">No orders have been processed at this branch yet.</td></tr>
                        ) : (
                            orders.map(order => (
                                <tr key={order._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="py-4 px-6 font-mono text-sm text-gray-500">{order._id.slice(-8).toUpperCase()}</td>
                                    <td className="py-4 px-6 text-gray-800">{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td className="py-4 px-6">
                                        <div className="font-semibold text-gray-800">{order.name}</div>
                                        <div className="text-sm text-gray-500">{order.phone}</div>
                                    </td>
                                    <td className="py-4 px-6 text-gray-600">
                                        {/* Summarize item count */}
                                        {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                                    </td>
                                    <td className="py-4 px-6 font-bold text-gray-900">
                                        ${order.totalAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <button 
                                            onClick={() => setSelectedOrder(order)}
                                            className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-[#0B7C56] hover:text-white rounded-lg font-medium transition-colors text-sm"
                                        >
                                            View Invoice
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Reprint Invoice Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <Invoice order={selectedOrder} onClose={() => setSelectedOrder(null)} />
                </div>
            )}
        </div>
    );
};

export default OrderHistory;
