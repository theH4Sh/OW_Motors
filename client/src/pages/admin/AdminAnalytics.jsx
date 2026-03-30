import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';

const AdminAnalytics = () => {
    const { token } = useSelector(state => state.auth);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('month');
    const [customFrom, setCustomFrom] = useState('');
    const [customTo, setCustomTo] = useState('');

    const API_URL = import.meta.env.VITE_API || 'http://localhost:8000/api/';

    const getDateRange = (filter) => {
        const now = new Date();
        let from = null, to = now.toISOString().split('T')[0];
        switch (filter) {
            case 'today': from = to; break;
            case 'week': {
                const d = new Date(now); d.setDate(d.getDate() - 7);
                from = d.toISOString().split('T')[0]; break;
            }
            case 'month': {
                const d = new Date(now); d.setMonth(d.getMonth() - 1);
                from = d.toISOString().split('T')[0]; break;
            }
            case 'year': {
                const d = new Date(now); d.setFullYear(d.getFullYear() - 1);
                from = d.toISOString().split('T')[0]; break;
            }
            default: from = null; to = null;
        }
        return { from, to };
    };

    const fetchAnalytics = async (f, t) => {
        setLoading(true);
        let url = `${API_URL}analytics/branch-summary`;
        const params = new URLSearchParams();
        if (f) params.append('from', f);
        if (t) params.append('to', t);
        if (params.toString()) url += `?${params.toString()}`;

        try {
            const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
            const json = await res.json();
            if (res.ok) setData(json);
        } catch (err) {
            console.error('Admin analytics error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeFilter !== 'custom') {
            const { from, to } = getDateRange(activeFilter);
            fetchAnalytics(from, to);
        }
    }, [activeFilter]);

    const handleCustomApply = () => {
        if (customFrom && customTo) {
            setActiveFilter('custom');
            fetchAnalytics(customFrom, customTo);
        }
    };

    const fmt = (n) => 'PKR ' + (n || 0).toLocaleString();
    const fmtShort = (n) => (n >= 1000000 ? (n/1000000).toFixed(1) + 'M' : n >= 1000 ? (n/1000).toFixed(1) + 'k' : n);

    const COLORS = [
        '#0B7C56', // Emerald
        '#3b82f6', // blue-500
        '#8b5cf6', // violet-500
        '#f59e0b', // amber-500
        '#ef4444', // red-500
        '#06b6d4', // cyan-500
        '#ec4899', // pink-500
    ];

    if (loading && !data) return (
        <div className="flex flex-col items-center justify-center min-vh-70 py-20">
            <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-medium">Brewing amazing analytics...</p>
        </div>
    );

    return (
        <div className="pb-10 animate-in fade-in duration-500">
            {/* Header & Filter */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Organization Analytics</h1>
                    <p className="text-slate-500 mt-1">Global performance overview across all branches</p>
                </div>
                
                <div className="flex flex-col gap-3">
                    <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-100 self-end">
                        {['today', 'week', 'month', 'year', 'all'].map(f => (
                            <button
                                key={f}
                                onClick={() => setActiveFilter(f)}
                                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all capitalize ${activeFilter === f ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
                            >{f}</button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                         <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} className="text-xs p-2 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500" />
                         <span className="text-slate-400">→</span>
                         <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)} className="text-xs p-2 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500" />
                         <button onClick={handleCustomApply} className="bg-emerald-600 text-white p-2 rounded-lg hover:bg-emerald-700 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg></button>
                    </div>
                </div>
            </div>

            {data && (
                <>
                    {/* KPI Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><svg className="w-16 h-16 text-emerald-600" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/><path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"/></svg></div>
                            <p className="text-sm font-medium text-slate-500 mb-1">Total Revenue</p>
                            <h3 className="text-2xl font-black text-slate-900">{fmt(data.sales.totalRevenue)}</h3>
                            <div className="mt-2 flex items-center gap-1 text-emerald-600 text-xs font-bold">
                                <span>Global Sum</span>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><svg className="w-16 h-16 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd"/></svg></div>
                            <p className="text-sm font-medium text-slate-500 mb-1">Company Profit</p>
                            <h3 className="text-2xl font-black text-emerald-600">{fmt(data.sales.totalProfit)}</h3>
                            <p className="text-xs text-slate-400 mt-2 font-medium">Margin: <span className="text-emerald-600">{data.sales.totalRevenue > 0 ? ((data.sales.totalProfit / data.sales.totalRevenue) * 100).toFixed(1) : 0}%</span></p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative group">
                             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><svg className="w-16 h-16 text-purple-600" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/></svg></div>
                            <p className="text-sm font-medium text-slate-500 mb-1">Total Orders</p>
                            <h3 className="text-2xl font-black text-slate-900">{data.sales.totalOrders}</h3>
                            <p className="text-xs text-slate-400 mt-2 font-medium">Avg Order: {fmt(data.sales.avgOrderValue)}</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><svg className="w-16 h-16 text-amber-600" fill="currentColor" viewBox="0 0 20 20"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"/></svg></div>
                            <p className="text-sm font-medium text-slate-500 mb-1">Stock Portfolio</p>
                            <h3 className="text-2xl font-black text-slate-900">{fmtShort(data.inventory.totalStockValue)}</h3>
                            <p className="text-xs text-slate-400 mt-2 font-medium">{data.inventory.totalStockQty} Units across all branches</p>
                        </div>
                    </div>

                    {/* Chart Row 1: Trend */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Revenue & Profit Trend</h3>
                                <p className="text-xs text-slate-500">Performance over the selected timeframe</p>
                            </div>
                        </div>
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data.charts.trendData}>
                                    <defs>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0B7C56" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#0B7C56" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} tickFormatter={(v) => v.split('-').slice(1).join('/')} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} tickFormatter={(v) => fmtShort(v)} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        formatter={(v) => [fmt(v), '']}
                                    />
                                    <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#0B7C56" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                                    <Area type="monotone" dataKey="profit" name="Profit" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorProf)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Chart Row 2: Category & Branch */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                             <h3 className="text-lg font-bold text-slate-900 mb-6">Category Profitability</h3>
                             <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data.charts.categoryData.filter(c => c.revenue > 0)} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} tick={{fontSize: 12, fill: '#475569', fontWeight: 600}} />
                                        <Tooltip 
                                            cursor={{fill: '#f8fafc'}}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                            formatter={(v) => fmt(v)}
                                        />
                                        <Bar dataKey="profit" radius={[0, 4, 4, 0]} barSize={20}>
                                            {data.charts.categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                             </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
                            <h3 className="text-lg font-bold text-slate-900 mb-6 w-full text-left">Revenue by Branch</h3>
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={data.charts.branchComparison}
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="revenue"
                                        >
                                            {data.charts.branchComparison.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(v) => fmt(v)} />
                                        <Legend verticalAlign="bottom" height={36}/>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Tables Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Branch Table */}
                        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-5 border-b border-slate-50 flex justify-between items-center">
                                <h3 className="font-bold text-slate-900">Branch Performance</h3>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{data.charts.branchComparison.length} Active Branches</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 text-slate-500 font-semibold">
                                        <tr>
                                            <th className="py-4 px-6">Branch Name</th>
                                            <th className="py-4 px-6 text-center">Orders</th>
                                            <th className="py-4 px-6 text-right">Revenue</th>
                                            <th className="py-4 px-6 text-right">Profit</th>
                                            <th className="py-4 px-6 text-right">Margin</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {data.charts.branchComparison.map((b, i) => (
                                            <tr key={i} className="hover:bg-slate-50 transition-colors">
                                                <td className="py-4 px-6 font-bold text-slate-700">{b.name}</td>
                                                <td className="py-4 px-6 text-center text-slate-600">{b.orders}</td>
                                                <td className="py-4 px-6 text-right font-medium text-slate-600">{fmt(b.revenue)}</td>
                                                <td className="py-4 px-6 text-right font-bold text-emerald-600">{fmt(b.profit)}</td>
                                                <td className="py-4 px-6 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <span className="text-xs font-bold text-slate-400">{(b.revenue > 0 ? (b.profit / b.revenue * 100) : 0).toFixed(0)}%</span>
                                                        <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                            <div className="h-full bg-emerald-500" style={{ width: `${(b.revenue > 0 ? (b.profit / b.revenue * 100) : 0)}%` }}></div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Top Products */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-5 border-b border-slate-50">
                                <h3 className="font-bold text-slate-900">Top 10 Products</h3>
                            </div>
                            <div className="p-2">
                                {data.sales.topProducts.map((p, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-all group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">#{i+1}</div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800 line-clamp-1">{p.name}</p>
                                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">{p.category}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-black text-slate-700">{fmtShort(p.revenue)}</p>
                                            <p className="text-[10px] text-emerald-600 font-bold">+{p.qtySold} sold</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminAnalytics;
