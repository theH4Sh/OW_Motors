import React from 'react';

const Invoice = ({ order, onClose }) => {
    if (!order) return null;

    const handlePrint = () => {
        window.print();
    };

    const formatMoney = (amount) =>
        `PKR ${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

    return (
        <div className="invoice-overlay fixed inset-0 bg-black/50 backdrop-blur-sm z-[3000] flex items-center justify-center p-4">
            <div className="invoice-sheet bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

                {/* Header Actions - Hidden in Print Mode */}
                <div className="print:hidden flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-4 border-b border-gray-100 bg-gray-50">
                    <h2 className="text-lg font-semibold text-gray-700">Order Successfully Processed</h2>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <button onClick={handlePrint} className="px-4 py-2 bg-[#0B7C56] text-white rounded-lg hover:bg-[#095c40] font-medium transition-colors w-full sm:w-auto">
                            Print Invoice
                        </button>
                        <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition-colors w-full sm:w-auto">
                            Close
                        </button>
                    </div>
                </div>

                {/* Printable Invoice Body */}
                <div className="invoice-body p-4 sm:p-8 overflow-y-auto text-gray-800 bg-white">
                    <div className="invoice-header border-b-2 border-slate-200 pb-6 mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
                        <div>
                            <h1 className="invoice-brand text-4xl font-black text-[#0B7C56]">
                                OW<span className="text-gray-800">Motors</span>
                            </h1>
                            <p className="text-gray-500 mt-2 font-medium">Branch: {order.branch}</p>
                        </div>
                        <div className="invoice-meta text-left sm:text-right">
                            <h2 className="text-2xl font-bold text-gray-300 uppercase tracking-widest">INVOICE</h2>
                            <p className="text-gray-600 mt-1 font-medium">
                                Date: {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-500">
                                Invoice #{order._id.slice(-6).toUpperCase()}
                            </p>
                        </div>
                    </div>

                    <div className="invoice-customer mb-8 grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                        <div>
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
                                Billed To
                            </h3>
                            <p className="font-semibold text-lg leading-snug">{order.name}</p>
                            {order.fatherName && (
                                <p className="text-gray-600 mt-1">S/O {order.fatherName}</p>
                            )}
                            {order.cnic && (
                                <p className="text-gray-600 mt-1">CNIC: {order.cnic}</p>
                            )}
                            <p className="text-gray-600 mt-3">{order.address}</p>
                            <p className="text-gray-600 mt-1">Tel: {order.phone}</p>
                        </div>
                        {order.processedBy && (
                            <div>
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
                                    Processed By
                                </h3>
                                <p className="font-semibold text-lg leading-snug">{order.processedBy}</p>
                            </div>
                        )}
                    </div>

                    <div className="invoice-table-wrap mb-8">
                        <table className="invoice-table w-full text-left">
                            <thead>
                                <tr className="border-b-2 border-slate-200">
                                    <th className="py-3 font-semibold text-gray-600 w-1/2">Item Description</th>
                                    <th className="py-3 font-semibold text-gray-600 text-center">Qty</th>
                                    <th className="py-3 font-semibold text-gray-600 text-right">Price</th>
                                    <th className="py-3 font-semibold text-gray-600 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items.map((item, index) => (
                                    <tr key={index} className="border-b border-gray-100 last:border-0">
                                        <td className="py-4 pr-4">
                                            <p className="font-semibold">{item.product.name}</p>
                                            <p className="text-sm text-gray-500 capitalize mt-0.5">
                                                {item.product.category?.replace('_', ' ')}
                                            </p>
                                        </td>
                                        <td className="py-4 text-center font-medium">{item.quantity}</td>
                                        <td className="py-4 text-right whitespace-nowrap">{formatMoney(item.price)}</td>
                                        <td className="py-4 text-right font-semibold whitespace-nowrap">
                                            {formatMoney(item.quantity * item.price)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="invoice-totals flex justify-end">
                        <div className="w-full max-w-xs space-y-3">
                            <div className="flex justify-between gap-8 text-gray-500 font-medium">
                                <span>Subtotal</span>
                                <span className="text-gray-800 font-semibold whitespace-nowrap">
                                    {formatMoney(order.totalAmount)}
                                </span>
                            </div>
                            <div className="flex justify-between gap-8 pt-3 border-t border-gray-200">
                                <span className="text-gray-500 font-medium">Total Due</span>
                                <span className="font-bold text-[#0B7C56] text-xl whitespace-nowrap">
                                    {formatMoney(order.totalAmount)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="invoice-footer mt-16 pt-6 border-t border-gray-100 text-center text-sm text-gray-400">
                        <p>Thank you for choosing OW Motors! We appreciate your business.</p>
                        <p className="mt-1">
                            For support or returns, visit our website or contact your local branch.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Invoice;
