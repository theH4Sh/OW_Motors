import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrdersByBranch } from '../../slice/orderSlice';
import Invoice from '../../components/Invoice';
import OrderDateFilter from '../../components/OrderDateFilter';
import toast from 'react-hot-toast';
import { orderMatchesSearch } from '../../utils/orderSearch';
import { getAvailableYears, orderMatchesDatePeriod } from '../../utils/orderDateFilter';
import { getErrorMessage } from '../../utils/apiError';

const OrderHistory = () => {
    const dispatch = useDispatch();
    const { orders, status, error } = useSelector(state => state.orders);
    const { branch } = useSelector(state => state.auth);

    const now = new Date();
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [datePeriod, setDatePeriod] = useState('all');
    const [filterMonth, setFilterMonth] = useState('any');
    const [filterYear, setFilterYear] = useState(now.getFullYear());

    useEffect(() => {
        if (branch) {
            dispatch(fetchOrdersByBranch(branch));
        }
    }, [dispatch, branch]);

    useEffect(() => {
        if (status === 'failed' && error) {
            toast.error(getErrorMessage(error, 'Failed to load orders'));
        }
    }, [status, error]);

    const availableYears = useMemo(() => getAvailableYears(orders), [orders]);

    const filteredOrders = useMemo(
        () => orders.filter(order => (
            orderMatchesDatePeriod(order, {
                period: datePeriod,
                month: filterMonth,
                year: filterYear,
            }) && orderMatchesSearch(order, searchQuery)
        )),
        [orders, searchQuery, datePeriod, filterMonth, filterYear]
    );

    const handlePeriodChange = (period) => {
        setDatePeriod(period);
        if (period === 'custom') {
            const currentYear = new Date().getFullYear();
            setFilterYear(availableYears.includes(currentYear) ? currentYear : availableYears[0]);
            setFilterMonth('any');
        }
    };

    const hasActiveFilters = datePeriod !== 'all' || searchQuery.trim().length > 0;

    const clearFilters = () => {
        setDatePeriod('all');
        setSearchQuery('');
    };

    const isLoading = status === 'loading';
    const isEmpty = !isLoading && orders.length === 0;
    const noMatches = !isLoading && !isEmpty && filteredOrders.length === 0;

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Order History</h1>
            </div>

            {!isLoading && !isEmpty && (
                <div className="filter-toolbar" style={{ alignItems: 'flex-start' }}>
                    <OrderDateFilter
                        period={datePeriod}
                        month={filterMonth}
                        year={filterYear}
                        years={availableYears}
                        onPeriodChange={handlePeriodChange}
                        onMonthChange={setFilterMonth}
                        onYearChange={setFilterYear}
                    />
                    <div className="search-field">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search by name, date, amount, product..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white shadow-sm text-sm focus:ring-2 focus:ring-[#0B7C56] focus:border-transparent outline-none transition-all"
                        />
                    </div>
                </div>
            )}

            {!isLoading && !isEmpty && (
                <div className="flex items-center gap-3 mb-4 -mt-2">
                    <p className="text-sm text-gray-500">
                        {filteredOrders.length} of {orders.length} orders
                    </p>
                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="text-sm font-semibold text-[#0B7C56] hover:text-[#095c40]"
                        >
                            Clear filters
                        </button>
                    )}
                </div>
            )}

            {isLoading ? (
                <p className="text-gray-500">Loading historical orders...</p>
            ) : isEmpty ? (
                <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed border-gray-200">
                    No orders have been processed at this branch yet.
                </div>
            ) : noMatches ? (
                <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed border-gray-200">
                    {searchQuery
                        ? `No orders matching "${searchQuery}"`
                        : 'No orders found for the selected period.'}
                </div>
            ) : (
                <>
                    <div className="mobile-list-wrap space-y-3">
                        {filteredOrders.map(order => (
                            <div key={order._id} className="mobile-card">
                                <div className="flex justify-between items-start gap-3">
                                    <div>
                                        <p className="font-semibold text-gray-900">{order.name}</p>
                                        <p className="text-sm text-gray-500 mt-0.5">{order.phone}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-[#0B7C56] whitespace-nowrap">
                                            PKR {order.totalAmount.toLocaleString()}
                                        </p>
                                        {order.paymentType === 'installment' && (
                                            <span className={`badge mt-1 ${order.paymentStatus === 'paid' ? 'badge-success' : order.paymentStatus === 'overdue' ? '' : 'badge-warning'}`}
                                                style={order.paymentStatus === 'overdue' ? { background: 'rgba(239, 68, 68, 0.12)', color: 'var(--danger)' } : undefined}
                                            >
                                                {order.paymentStatus === 'paid' ? 'Paid' : order.paymentStatus === 'overdue' ? 'Overdue' : 'Installment'}
                                            </span>
                                        )}
                                    </div>
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
                                    <th className="py-4 px-6 font-semibold">Payment</th>
                                    <th className="py-4 px-6 font-semibold">Total Amount</th>
                                    <th className="py-4 px-6 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredOrders.map(order => (
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
                                        <td className="py-4 px-6">
                                            {order.paymentType === 'installment' ? (
                                                <span className={`badge ${order.paymentStatus === 'paid' ? 'badge-success' : order.paymentStatus === 'overdue' ? '' : 'badge-warning'}`}
                                                    style={order.paymentStatus === 'overdue' ? { background: 'rgba(239, 68, 68, 0.12)', color: 'var(--danger)' } : undefined}
                                                >
                                                    {order.paymentStatus === 'paid' ? 'Paid' : order.paymentStatus === 'overdue' ? 'Overdue' : 'Installment'}
                                                </span>
                                            ) : (
                                                <span className="badge badge-success">Paid</span>
                                            )}
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
