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

    const isLoading = status === 'loading';
    const isEmpty = !isLoading && orders.length === 0;

    return (
        <div>
            <h1 className="page-title mb-6">Order History</h1>

            {isLoading ? (
                <p className="text-gray-500">Loading historical orders...</p>
            ) : isEmpty ? (
                <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed border-gray-200">
                    No orders have been processed at this branch yet.
                </div>
            ) : (
                <>
                    <div className="mobile-list-wrap space-y-3">
                        {orders.map(order => (
                            <div key={order._id} className="mobile-card">
                                <div className="flex justify-between items-start gap-3">
                                    <div>
                                        <p className="font-semibold text-gray-900">{order.name}</p>
                                        <p className="text-sm text-gray-500 mt-0.5">{order.phone}</p>
                                    </div>
                                    <p className="font-bold text-[#0B7C56] whitespace-nowrap">
                                        PKR {order.totalAmount.toLocaleString()}
                                    </p>
                                </div>
                                <dl className="mobile-card-meta">
                                    <dt>Order ID</dt>
                                    <dd className="font-mono text-xs">{order._id.slice(-8).toUpperCase()}</dd>
                                    <dt>Date</dt>
                                    <dd>{new Date(order.createdAt).toLocaleDateString()}</dd>
                                    <dt>Items</dt>
                                    <dd>{order.items.reduce((sum, item) => sum + item.quantity, 0)}</dd>
                                </dl>
                                <button
                                    type="button"
                                    onClick={() => setSelectedOrder(order)}
                                    className="btn btn-secondary w-full mt-3"
                                >
                                    View Invoice
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="desktop-table-wrap bg-white shadow-xl rounded-2xl border border-gray-100 data-table-wrap">
                        <table className="w-full text-left min-w-[720px]">
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
                                {orders.map(order => (
                                    <tr key={order._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="py-4 px-6 font-mono text-sm text-gray-500">{order._id.slice(-8).toUpperCase()}</td>
                                        <td className="py-4 px-6 text-gray-800">{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td className="py-4 px-6">
                                            <div className="font-semibold text-gray-800">{order.name}</div>
                                            <div className="text-sm text-gray-500">{order.phone}</div>
                                        </td>
                                        <td className="py-4 px-6 text-gray-600">
                                            {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                                        </td>
                                        <td className="py-4 px-6 font-bold text-gray-900">
                                            PKR {order.totalAmount.toLocaleString()}
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedOrder(order)}
                                                className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-[#0B7C56] hover:text-white rounded-lg font-medium transition-colors text-sm"
                                            >
                                                View Invoice
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {selectedOrder && (
                <div className="fixed inset-0 z-[3000] overflow-y-auto">
                    <Invoice order={selectedOrder} onClose={() => setSelectedOrder(null)} />
                </div>
            )}
        </div>
    );
};

export default OrderHistory;
