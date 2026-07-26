import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { fetchInstallmentOrders, recordInstallmentPayment } from '../../slice/orderSlice';
import Invoice from '../../components/Invoice';
import { getErrorMessage } from '../../utils/apiError';

const fmt = (n) => 'PKR ' + (n || 0).toLocaleString();
const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

const remainingOf = (order) => Math.max(0, (order.totalAmount || 0) - (order.amountPaid || 0));

const nextDue = (order) => {
    if (order.installmentType !== 'fixed' || !order.installments?.length) return null;
    return order.installments.find((i) => i.status !== 'paid') || null;
};

const statusBadge = (status) => {
    if (status === 'overdue') {
        return <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.12)', color: 'var(--danger)' }}>Overdue</span>;
    }
    return <span className="badge badge-warning">Ongoing</span>;
};

const Installments = () => {
    const dispatch = useDispatch();
    const { role, branch } = useSelector((state) => state.auth);
    const { installments, installmentsStatus, error } = useSelector((state) => state.orders);

    const [searchQuery, setSearchQuery] = useState('');
    const [branchFilter, setBranchFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [paymentOrder, setPaymentOrder] = useState(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentNote, setPaymentNote] = useState('');
    const [recording, setRecording] = useState(false);

    const isAdmin = role === 'admin';

    useEffect(() => {
        dispatch(fetchInstallmentOrders());
    }, [dispatch, branch]);

    useEffect(() => {
        if (installmentsStatus === 'failed' && error) {
            toast.error(getErrorMessage(error, 'Failed to load installments'));
        }
    }, [installmentsStatus, error]);

    const branches = useMemo(
        () => [...new Set(installments.map((o) => o.branch).filter(Boolean))],
        [installments]
    );

    const filtered = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        return installments.filter((order) => {
            if (isAdmin && branchFilter !== 'all' && order.branch !== branchFilter) return false;
            if (statusFilter !== 'all' && order.paymentStatus !== statusFilter) return false;
            if (!q) return true;
            return (
                order.name?.toLowerCase().includes(q) ||
                order.phone?.toLowerCase().includes(q) ||
                order.cnic?.toLowerCase().includes(q) ||
                order.processedBy?.toLowerCase().includes(q) ||
                order._id?.toLowerCase().includes(q) ||
                order.branch?.toLowerCase().includes(q)
            );
        });
    }, [installments, searchQuery, statusFilter, branchFilter, isAdmin]);

    const totalOutstanding = filtered.reduce((s, o) => s + remainingOf(o), 0);

    const openPayment = (order) => {
        setPaymentOrder(order);
        setPaymentAmount('');
        setPaymentNote('');
    };

    const closePayment = () => {
        if (recording) return;
        setPaymentOrder(null);
        setPaymentAmount('');
        setPaymentNote('');
    };

    const submitPayment = async (e) => {
        e.preventDefault();
        if (!paymentOrder) return;

        const amount = Number(paymentAmount);
        const remaining = remainingOf(paymentOrder);

        if (!amount || amount <= 0) {
            return toast.error('Enter a valid payment amount');
        }
        if (amount > remaining) {
            return toast.error(`Amount exceeds remaining balance of ${fmt(remaining)}`);
        }

        setRecording(true);
        try {
            const updated = await dispatch(recordInstallmentPayment({
                id: paymentOrder._id,
                amount,
                note: paymentNote,
            })).unwrap();

            toast.success(
                updated.paymentStatus === 'paid'
                    ? 'Final payment recorded — order fully paid'
                    : 'Payment recorded'
            );
            setPaymentOrder(null);
            setPaymentAmount('');
            setPaymentNote('');
            dispatch(fetchInstallmentOrders());
        } catch (error) {
            toast.error(getErrorMessage(error, 'Failed to record payment'));
        } finally {
            setRecording(false);
        }
    };

    const isLoading = installmentsStatus === 'loading';

    return (
        <div className="pb-10">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Installments</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {filtered.length} active • {fmt(totalOutstanding)} outstanding
                    </p>
                </div>
                <div className="search-field">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search customer, phone, CNIC..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white shadow-sm text-sm focus:ring-2 focus:ring-[#0B7C56] focus:border-transparent outline-none transition-all"
                    />
                </div>
            </div>

            <div className="filter-toolbar">
                <div className="filter-buttons">
                    <button
                        type="button"
                        onClick={() => setStatusFilter('all')}
                        className={`btn ${statusFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                    >
                        All
                    </button>
                    <button
                        type="button"
                        onClick={() => setStatusFilter('ongoing')}
                        className={`btn ${statusFilter === 'ongoing' ? 'btn-primary' : 'btn-secondary'}`}
                    >
                        Ongoing
                    </button>
                    <button
                        type="button"
                        onClick={() => setStatusFilter('overdue')}
                        className={`btn ${statusFilter === 'overdue' ? 'btn-primary' : 'btn-secondary'}`}
                    >
                        Overdue
                    </button>
                </div>

                {isAdmin && branches.length > 0 && (
                    <div className="filter-buttons">
                        <button
                            type="button"
                            onClick={() => setBranchFilter('all')}
                            className={`btn ${branchFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                        >
                            All Branches
                        </button>
                        {branches.map((b) => (
                            <button
                                key={b}
                                type="button"
                                onClick={() => setBranchFilter(b)}
                                className={`btn ${branchFilter === b ? 'btn-primary' : 'btn-secondary'}`}
                            >
                                {b}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {isLoading ? (
                <div className="text-center py-20 text-gray-400">
                    <div className="w-10 h-10 border-4 border-gray-200 border-t-[#0B7C56] rounded-full animate-spin mx-auto mb-4" />
                    <p>Loading installments...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
                    <p className="font-medium">
                        {searchQuery || statusFilter !== 'all'
                            ? 'No installment plans match your filters.'
                            : 'No outstanding installment plans.'}
                    </p>
                </div>
            ) : (
                <>
                    <div className="mobile-list-wrap space-y-3 mb-4">
                        {filtered.map((order) => {
                            const due = nextDue(order);
                            const remaining = remainingOf(order);
                            return (
                                <div key={order._id} className="mobile-card">
                                    <div className="flex justify-between items-start gap-3">
                                        <div className="min-w-0">
                                            <p className="font-semibold text-gray-900 truncate">{order.name}</p>
                                            <p className="text-sm text-gray-500">{order.phone}</p>
                                        </div>
                                        {statusBadge(order.paymentStatus)}
                                    </div>
                                    <dl className="mobile-card-meta">
                                        <dt>Remaining</dt>
                                        <dd className="text-[#0B7C56]">{fmt(remaining)}</dd>
                                        <dt>Paid</dt>
                                        <dd>{fmt(order.amountPaid)}</dd>
                                        <dt>Plan</dt>
                                        <dd className="capitalize">{order.installmentType || '—'}</dd>
                                        <dt>Next due</dt>
                                        <dd>{due ? fmtDate(due.dueDate) : '—'}</dd>
                                    </dl>
                                    <div className="mobile-card-actions">
                                        <button type="button" className="btn btn-secondary flex-1" onClick={() => setSelectedOrder(order)}>
                                            Invoice
                                        </button>
                                        <button type="button" className="btn btn-primary flex-1" onClick={() => openPayment(order)}>
                                            Record Payment
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="desktop-table-wrap dash-panel">
                        <div className="dash-panel-header">
                            <h2 className="dash-panel-title">
                                <span className="inline-block w-2 h-2 rounded-full bg-amber-500 mr-2" />
                                Outstanding Plans
                            </h2>
                            <span className="text-xs font-semibold text-gray-400">{fmt(totalOutstanding)} remaining</span>
                        </div>
                        <div className="data-table-wrap">
                            <table className="w-full text-left min-w-[900px]">
                                <thead className="bg-slate-50 border-b border-gray-200 text-gray-500">
                                    <tr>
                                        <th className="py-3 px-5 font-semibold text-xs uppercase tracking-wider">Customer</th>
                                        {isAdmin && <th className="py-3 px-5 font-semibold text-xs uppercase tracking-wider">Branch</th>}
                                        <th className="py-3 px-5 font-semibold text-xs uppercase tracking-wider">Plan</th>
                                        <th className="py-3 px-5 font-semibold text-xs uppercase tracking-wider text-right">Total</th>
                                        <th className="py-3 px-5 font-semibold text-xs uppercase tracking-wider text-right">Paid</th>
                                        <th className="py-3 px-5 font-semibold text-xs uppercase tracking-wider text-right">Remaining</th>
                                        <th className="py-3 px-5 font-semibold text-xs uppercase tracking-wider">Next Due</th>
                                        <th className="py-3 px-5 font-semibold text-xs uppercase tracking-wider">Status</th>
                                        <th className="py-3 px-5 font-semibold text-xs uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filtered.map((order) => {
                                        const due = nextDue(order);
                                        return (
                                            <tr key={order._id} className="hover:bg-slate-50 transition-colors">
                                                <td className="py-3 px-5">
                                                    <div className="font-semibold text-gray-800">{order.name}</div>
                                                    <div className="text-xs text-gray-500">{order.phone}</div>
                                                </td>
                                                {isAdmin && (
                                                    <td className="py-3 px-5">
                                                        <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full">
                                                            {order.branch}
                                                        </span>
                                                    </td>
                                                )}
                                                <td className="py-3 px-5 text-sm text-gray-700 capitalize">
                                                    {order.installmentType === 'fixed'
                                                        ? `Fixed · ${order.installmentCount} mo`
                                                        : 'Flexible'}
                                                </td>
                                                <td className="py-3 px-5 text-right text-sm whitespace-nowrap">{fmt(order.totalAmount)}</td>
                                                <td className="py-3 px-5 text-right text-sm whitespace-nowrap">{fmt(order.amountPaid)}</td>
                                                <td className="py-3 px-5 text-right font-bold text-[#0B7C56] whitespace-nowrap">
                                                    {fmt(remainingOf(order))}
                                                </td>
                                                <td className="py-3 px-5 text-sm text-gray-600 whitespace-nowrap">
                                                    {due ? (
                                                        <>
                                                            <div>{fmtDate(due.dueDate)}</div>
                                                            <div className="text-xs text-gray-400">{fmt(due.amountDue - (due.amountPaid || 0))}</div>
                                                        </>
                                                    ) : '—'}
                                                </td>
                                                <td className="py-3 px-5">{statusBadge(order.paymentStatus)}</td>
                                                <td className="py-3 px-5 text-right">
                                                    <div className="inline-flex gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedOrder(order)}
                                                            className="text-xs font-semibold text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-all"
                                                        >
                                                            Invoice
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => openPayment(order)}
                                                            className="text-xs font-semibold text-[#0B7C56] hover:text-[#095c40] bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-all"
                                                        >
                                                            Pay
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {selectedOrder && (
                <div className="fixed inset-0 z-[3000] overflow-y-auto">
                    <Invoice order={selectedOrder} onClose={() => setSelectedOrder(null)} />
                </div>
            )}

            {paymentOrder && (
                <div className="modal-overlay" onClick={closePayment}>
                    <div
                        className="modal-content"
                        style={{ maxWidth: 440 }}
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                    >
                        <div className="modal-header">
                            <h2 style={{ fontSize: '1.25rem' }}>Record Payment</h2>
                            <button type="button" className="action-icon" onClick={closePayment} disabled={recording} aria-label="Close">
                                ✕
                            </button>
                        </div>
                        <form onSubmit={submitPayment}>
                            <div className="modal-body space-y-4">
                                <div>
                                    <p className="font-semibold text-gray-900">{paymentOrder.name}</p>
                                    <p className="text-sm text-gray-500 mt-0.5">
                                        Remaining balance: <span className="font-semibold text-[#0B7C56]">{fmt(remainingOf(paymentOrder))}</span>
                                    </p>
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Amount (PKR)</label>
                                    <input
                                        required
                                        type="number"
                                        min="1"
                                        step="1"
                                        max={remainingOf(paymentOrder)}
                                        className="form-input"
                                        placeholder="Enter amount received"
                                        value={paymentAmount}
                                        onChange={(e) => setPaymentAmount(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Note (optional)</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="e.g. Cash / Bank transfer"
                                        value={paymentNote}
                                        onChange={(e) => setPaymentNote(e.target.value)}
                                    />
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setPaymentAmount(String(remainingOf(paymentOrder)))}
                                    >
                                        Pay remaining
                                    </button>
                                    {paymentOrder.installmentType === 'fixed' && nextDue(paymentOrder) && (
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => {
                                                const due = nextDue(paymentOrder);
                                                setPaymentAmount(String(Math.max(0, due.amountDue - (due.amountPaid || 0))));
                                            }}
                                        >
                                            Pay next installment
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closePayment} disabled={recording}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={recording}>
                                    {recording ? 'Saving...' : 'Record Payment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Installments;
