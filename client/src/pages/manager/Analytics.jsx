import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const Analytics = () => {
    const { token, branch } = useSelector(state => state.auth);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('all');
    const [customFrom, setCustomFrom] = useState('');
    const [customTo, setCustomTo] = useState('');

    const getDateRange = (filter) => {
        const now = new Date();
        let from = null, to = null;
        to = now.toISOString().split('T')[0];

        switch (filter) {
            case 'today':
                from = to;
                break;
            case 'week': {
                const d = new Date(now);
                d.setDate(d.getDate() - 7);
                from = d.toISOString().split('T')[0];
                break;
            }
            case 'month': {
                const d = new Date(now);
                d.setMonth(d.getMonth() - 1);
                from = d.toISOString().split('T')[0];
                break;
            }
            case 'year': {
                const d = new Date(now);
                d.setFullYear(d.getFullYear() - 1);
                from = d.toISOString().split('T')[0];
                break;
            }
            default:
                from = null;
                to = null;
        }
        return { from, to };
    };

    const doFetch = async (from, to) => {
        setLoading(true);
        const API_URL = import.meta.env.VITE_API || 'http://localhost:8000/api/';
        let url = `${API_URL}analytics/branch-summary`;
        const params = new URLSearchParams();
        if (from) params.append('from', from);
        if (to) params.append('to', to);
        if (params.toString()) url += `?${params.toString()}`;

        try {
            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await res.json();
            if (res.ok) setData(json);
        } catch (err) {
            console.error('Analytics fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAnalytics = async (filter) => {
        const { from, to } = getDateRange(filter);
        doFetch(from, to);
    };

    const fetchCustomRange = () => {
        if (!customFrom || !customTo) return;
        setActiveFilter('custom');
        doFetch(customFrom, customTo);
    };

    useEffect(() => {
        fetchAnalytics(activeFilter);
    }, [activeFilter]);

    const handleFilter = (filter) => {
        setActiveFilter(filter);
        setCustomFrom('');
        setCustomTo('');
    };

    const filters = [
        { key: 'today', label: 'Today' },
        { key: 'week', label: 'Last 7 Days' },
        { key: 'month', label: 'Last 30 Days' },
        { key: 'year', label: 'This Year' },
        { key: 'all', label: 'All Time' },
    ];

    const fmt = (n) => '$' + (n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return (
        <div className="mt-4 pb-10">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Analytics — {branch}</h1>
            </div>

            {/* Date Range Filters */}
            <div className="flex gap-2 mb-4 flex-wrap items-center">
                {filters.map(f => (
                    <button
                        key={f.key}
                        onClick={() => handleFilter(f.key)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeFilter === f.key
                            ? 'bg-[#0B7C56] text-white shadow-md'
                            : 'bg-white text-gray-600 border border-gray-200 hover:border-[#0B7C56] hover:text-[#0B7C56]'
                            }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Custom Date Range */}
            <div className="flex gap-3 mb-8 items-center flex-wrap">
                <span className="text-sm text-gray-500 font-medium">Custom Range:</span>
                <input
                    type="date"
                    value={customFrom}
                    onChange={e => setCustomFrom(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#0B7C56] outline-none"
                />
                <span className="text-gray-400">→</span>
                <input
                    type="date"
                    value={customTo}
                    onChange={e => setCustomTo(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#0B7C56] outline-none"
                />
                <button
                    onClick={fetchCustomRange}
                    disabled={!customFrom || !customTo}
                    className="px-4 py-2 bg-[#0B7C56] text-white rounded-lg text-sm font-medium hover:bg-[#095c40] disabled:opacity-40 transition-all"
                >
                    Apply
                </button>
            </div>

            {loading ? (
                <div className="text-center py-16 text-gray-400">
                    <div className="w-10 h-10 border-4 border-gray-200 border-t-[#0B7C56] rounded-full animate-spin mx-auto mb-4"></div>
                    <p>Loading analytics...</p>
                </div>
            ) : data ? (
                <>
                    {/* ─── Sales KPI Row ─── */}
                    <h2 className="text-lg font-bold text-gray-700 mb-3">Sales Performance</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                            <p className="text-sm text-gray-500 font-medium mb-1">Total Revenue</p>
                            <p className="text-3xl font-bold text-[#0B7C56]">{fmt(data.sales.totalRevenue)}</p>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                            <p className="text-sm text-gray-500 font-medium mb-1">Orders Processed</p>
                            <p className="text-3xl font-bold text-gray-800">{data.sales.totalOrders}</p>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                            <p className="text-sm text-gray-500 font-medium mb-1">Items Sold</p>
                            <p className="text-3xl font-bold text-gray-800">{data.sales.totalItemsSold}</p>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                            <p className="text-sm text-gray-500 font-medium mb-1">Avg Order Value</p>
                            <p className="text-3xl font-bold text-gray-800">{fmt(data.sales.avgOrderValue)}</p>
                        </div>
                    </div>

                    {/* ─── Inventory Stats Row ─── */}
                    <h2 className="text-lg font-bold text-gray-700 mb-3">Inventory Overview</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                            <p className="text-sm text-gray-500 font-medium mb-1">Product Types</p>
                            <p className="text-3xl font-bold text-gray-800">{data.inventory.totalProducts}</p>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                            <p className="text-sm text-gray-500 font-medium mb-1">Total Units</p>
                            <p className="text-3xl font-bold text-gray-800">{data.inventory.totalStockQty}</p>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                            <p className="text-sm text-gray-500 font-medium mb-1">Stock Value (Selling)</p>
                            <p className="text-3xl font-bold text-[#0B7C56]">{fmt(data.inventory.totalStockValue)}</p>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                            <p className="text-sm text-gray-500 font-medium mb-1">Stock Value (Cost)</p>
                            <p className="text-3xl font-bold text-gray-800">{fmt(data.inventory.totalCostValue)}</p>
                        </div>
                        <div className={`rounded-xl border shadow-sm p-5 ${data.inventory.lowStockItems > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'}`}>
                            <p className="text-sm text-gray-500 font-medium mb-1">Low Stock Alerts</p>
                            <p className={`text-3xl font-bold ${data.inventory.lowStockItems > 0 ? 'text-red-500' : 'text-gray-800'}`}>{data.inventory.lowStockItems}</p>
                        </div>
                    </div>

                    {/* ─── Category Breakdown ─── */}
                    {Object.keys(data.inventory.categoryBreakdown).length > 0 && (
                        <>
                            <h2 className="text-lg font-bold text-gray-700 mb-3">Category Breakdown</h2>
                            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-8">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 border-b border-gray-200">
                                        <tr>
                                            <th className="py-3 px-6 font-semibold text-gray-600">Category</th>
                                            <th className="py-3 px-6 font-semibold text-gray-600 text-center">Product Types</th>
                                            <th className="py-3 px-6 font-semibold text-gray-600 text-center">Total Qty</th>
                                            <th className="py-3 px-6 font-semibold text-gray-600 text-right">Value</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {Object.entries(data.inventory.categoryBreakdown).map(([cat, info]) => (
                                            <tr key={cat} className="hover:bg-slate-50 transition-colors">
                                                <td className="py-3 px-6 font-medium text-gray-800 capitalize">{cat.replace('_', ' ')}</td>
                                                <td className="py-3 px-6 text-center text-gray-600">{info.count}</td>
                                                <td className="py-3 px-6 text-center text-gray-600">{info.qty}</td>
                                                <td className="py-3 px-6 text-right font-semibold text-gray-800">{fmt(info.value)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    {/* ─── Top Selling Products ─── */}
                    {data.sales.topProducts.length > 0 && (
                        <>
                            <h2 className="text-lg font-bold text-gray-700 mb-3">Top Selling Products</h2>
                            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 border-b border-gray-200">
                                        <tr>
                                            <th className="py-3 px-6 font-semibold text-gray-600">#</th>
                                            <th className="py-3 px-6 font-semibold text-gray-600">Product</th>
                                            <th className="py-3 px-6 font-semibold text-gray-600">Category</th>
                                            <th className="py-3 px-6 font-semibold text-gray-600 text-center">Qty Sold</th>
                                            <th className="py-3 px-6 font-semibold text-gray-600 text-right">Revenue</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {data.sales.topProducts.map((prod, i) => (
                                            <tr key={i} className="hover:bg-slate-50 transition-colors">
                                                <td className="py-3 px-6 font-bold text-gray-400">{i + 1}</td>
                                                <td className="py-3 px-6 font-semibold text-gray-800">{prod.name}</td>
                                                <td className="py-3 px-6 text-gray-600 capitalize">{prod.category?.replace('_', ' ')}</td>
                                                <td className="py-3 px-6 text-center font-medium text-gray-700">{prod.qtySold}</td>
                                                <td className="py-3 px-6 text-right font-bold text-[#0B7C56]">{fmt(prod.revenue)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </>
            ) : (
                <p className="text-gray-500">Failed to load analytics data.</p>
            )}
        </div>
    );
};

export default Analytics;
