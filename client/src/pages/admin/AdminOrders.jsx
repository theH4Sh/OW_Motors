import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import Invoice from '../../components/Invoice';
import OrderDateFilter from '../../components/OrderDateFilter';
import { orderMatchesSearch } from '../../utils/orderSearch';
import { getAvailableYears, orderMatchesDatePeriod } from '../../utils/orderDateFilter';

const AdminOrders = () => {
    const { token } = useSelector(state => state.auth);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [branchFilter, setBranchFilter] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const now = new Date();
    const [datePeriod, setDatePeriod] = useState('all');
    const [filterMonth, setFilterMonth] = useState('any');
    const [filterYear, setFilterYear] = useState(now.getFullYear());

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

    const branches = [...new Set(orders.map(o => o.branch))];
    const availableYears = useMemo(() => getAvailableYears(orders), [orders]);

    const filteredOrders = useMemo(() => (
        orders.filter(o => {
            const matchBranch = branchFilter === 'all' || o.branch === branchFilter;
            const matchDate = orderMatchesDatePeriod(o, {
                period: datePeriod,
                month: filterMonth,
                year: filterYear,
            });
            const matchSearch = orderMatchesSearch(o, searchQuery, {
                includeProcessedBy: true,
                includeBranch: true,
            });
            return matchBranch && matchDate && matchSearch;
        })
    ), [orders, branchFilter, searchQuery, datePeriod, filterMonth, filterYear]);

    const handlePeriodChange = (period) => {
        setDatePeriod(period);
        if (period === 'custom') {
            const currentYear = new Date().getFullYear();
            setFilterYear(availableYears.includes(currentYear) ? currentYear : availableYears[0]);
            setFilterMonth('any');
        }
    };

    const hasActiveFilters = branchFilter !== 'all' || datePeriod !== 'all' || searchQuery.trim().length > 0;

    const clearFilters = () => {
        setBranchFilter('all');
        setDatePeriod('all');
        setSearchQuery('');
    };

    const totalRevenue = filteredOrders.reduce((s, o) => s + o.totalAmount, 0);
    const totalUnits = filteredOrders.reduce((s, o) => s + o.items.reduce((n, i) => n + i.quantity, 0), 0);

    const fmt = (n) => 'PKR ' + (n || 0).toLocaleString();
    const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

    const emptyMessage = searchQuery
        ? `No orders matching "${searchQuery}"`
        : hasActiveFilters
            ? 'No orders found for the selected filters.'
            : 'No orders found.';

    return (
        <div className="pb-10">
            <div className="page-header">
                <div>
                    <h1 className="page-title">All Orders</h1>
                    <p className="text-sm text-gray-500 mt-1">{filteredOrders.length} orders • {fmt(totalRevenue)} total</p>
                </div>
                <div className="search-field">
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

            {/* ─── Filters ─── */}
            <div className="dash-panel mb-6">
                <div className="dash-panel-body space-y-4">
                    {branches.length > 0 && (
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Branch</p>
                            <div className="filter-buttons">
                                <button
                                    onClick={() => setBranchFilter('all')}
                                    className={`btn ${branchFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                                >All Branches</button>
                                {branches.map(b => (
                                    <button
                                        key={b}
                                        onClick={() => setBranchFilter(b)}
                                        className={`btn ${branchFilter === b ? 'btn-primary' : 'btn-secondary'}`}
                                    >{b}</button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Time Period</p>
                        <OrderDateFilter
                            period={datePeriod}
                            month={filterMonth}
                            year={filterYear}
                            years={availableYears}
                            onPeriodChange={handlePeriodChange}
                            onMonthChange={setFilterMonth}
                            onYearChange={setFilterYear}
                        />
                    </div>

                    {hasActiveFilters && (
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                            <p className="text-sm text-gray-500">
                                Showing <span className="font-semibold text-gray-800">{filteredOrders.length}</span> of {orders.length} orders
                            </p>
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0B7C56] hover:text-[#095c40]"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                Clear all filters
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20 text-gray-400">
                    <div className="w-10 h-10 border-4 border-gray-200 border-t-[#0B7C56] rounded-full animate-spin mx-auto mb-4"></div>
                    <p>Loading orders...</p>
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                    <p className="font-medium">{emptyMessage}</p>
                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="mt-3 text-sm font-semibold text-[#0B7C56] hover:text-[#095c40]"
                        >
                            Clear all filters
                        </button>
                    )}
                </div>
            ) : (
                <>
                    {/* Mobile cards */}
                    <div className="mobile-list-wrap space-y-3 mb-4">
                        {filteredOrders.map(order => (
                            <div key={order._id} className="mobile-card">
                                    <div className="flex justify-between items-start gap-3">
                                        <div className="min-w-0">
                                            <p className="font-semibold text-gray-900 truncate">{order.name}</p>
                                            <p className="text-sm text-gray-500">{order.phone}</p>
                                            {order.paymentType === 'installment' && (
                                                <span className={`badge mt-2 ${order.paymentStatus === 'paid' ? 'badge-success' : order.paymentStatus === 'overdue' ? '' : 'badge-warning'}`}
                                                    style={order.paymentStatus === 'overdue' ? { background: 'rgba(239, 68, 68, 0.12)', color: 'var(--danger)' } : undefined}
                                                >
                                                    {order.paymentStatus === 'paid' ? 'Paid' : order.paymentStatus === 'overdue' ? 'Overdue' : 'Installment'}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="font-bold text-[#0B7C56]">{fmt(order.totalAmount)}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">{fmtDate(order.createdAt)}</p>
                                        </div>
                                    </div>
                                <dl className="mobile-card-meta">
                                    <dt>Branch</dt>
                                    <dd>{order.branch}</dd>
                                    <dt>Items</dt>
                                    <dd>{order.items.reduce((s, i) => s + i.quantity, 0)}</dd>
                                    <dt>Processed by</dt>
                                    <dd>{order.processedBy || '—'}</dd>
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

                    {/* Desktop table */}
                    <div className="desktop-table-wrap dash-panel">
                        <div className="dash-panel-header">
                            <h2 className="dash-panel-title">
                                <span className="inline-block w-2 h-2 rounded-full bg-[#0B7C56] mr-2"></span>
                                Orders
                            </h2>
                            <span className="text-xs font-semibold text-gray-400">
                                {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'} • {fmt(totalRevenue)} • {totalUnits.toLocaleString()} units
                            </span>
                        </div>
                        <div className="data-table-wrap">
                            <table className="w-full text-left min-w-[800px]">
                                <thead className="bg-slate-50 border-b border-gray-200 text-gray-500">
                                    <tr>
                                        <th className="py-3 px-5 font-semibold text-xs uppercase tracking-wider">Order ID</th>
                                        <th className="py-3 px-5 font-semibold text-xs uppercase tracking-wider">Customer</th>
                                        <th className="py-3 px-5 font-semibold text-xs uppercase tracking-wider">Branch</th>
                                        <th className="py-3 px-5 font-semibold text-xs uppercase tracking-wider">Processed By</th>
                                        <th className="py-3 px-5 font-semibold text-xs uppercase tracking-wider">Payment</th>
                                        <th className="py-3 px-5 font-semibold text-xs uppercase tracking-wider text-center">Items</th>
                                        <th className="py-3 px-5 font-semibold text-xs uppercase tracking-wider text-right">Amount</th>
                                        <th className="py-3 px-5 font-semibold text-xs uppercase tracking-wider text-right">Date</th>
                                        <th className="py-3 px-5 font-semibold text-xs uppercase tracking-wider text-center">Invoice</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredOrders.map(order => (
                                        <tr key={order._id} className="hover:bg-slate-50 transition-colors">
                                            <td className="py-3 px-5 font-mono text-sm text-gray-500">{order._id.slice(-8).toUpperCase()}</td>
                                            <td className="py-3 px-5">
                                                <div className="font-semibold text-gray-800">{order.name}</div>
                                                <div className="text-xs text-gray-500">{order.phone}</div>
                                            </td>
                                            <td className="py-3 px-5">
                                                <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full">{order.branch}</span>
                                            </td>
                                            <td className="py-3 px-5 text-sm text-gray-700">{order.processedBy || '—'}</td>
                                            <td className="py-3 px-5">
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
                                            <td className="py-3 px-5 text-center text-gray-600">{order.items.reduce((s, i) => s + i.quantity, 0)}</td>
                                            <td className="py-3 px-5 text-right font-bold text-gray-800 whitespace-nowrap">{fmt(order.totalAmount)}</td>
                                            <td className="py-3 px-5 text-right text-sm text-gray-500 whitespace-nowrap">{fmtDate(order.createdAt)}</td>
                                            <td className="py-3 px-5 text-center">
                                                <button
                                                    onClick={() => setSelectedOrder(order)}
                                                    className="text-xs font-semibold text-[#0B7C56] hover:text-[#095c40] bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-all"
                                                >
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* Invoice Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-[3000] overflow-y-auto">
                    <Invoice order={selectedOrder} onClose={() => setSelectedOrder(null)} />
                </div>
            )}
        </div>
    );
};

export default AdminOrders;
