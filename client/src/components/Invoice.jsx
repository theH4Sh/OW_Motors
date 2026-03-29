import React from 'react';

const Invoice = ({ order, onClose }) => {
    if (!order) return null;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                
                {/* Header Actions - Hidden in Print Mode */}
                <div className="print:hidden flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
                    <h2 className="text-lg font-semibold text-gray-700">Order Successfully Processed</h2>
                    <div className="flex gap-3">
                        <button onClick={handlePrint} className="px-4 py-2 bg-[#0B7C56] text-white rounded-lg hover:bg-[#095c40] font-medium transition-colors">
                            Print Invoice
                        </button>
                        <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition-colors">
                            Close
                        </button>
                    </div>
                </div>

                {/* Printable Invoice Body */}
                <div className="p-8 overflow-y-auto print:p-0 print:overflow-visible text-gray-800 bg-white">
                    <div className="border-b-2 border-slate-200 pb-6 mb-6 flex justify-between items-end">
                        <div>
                            <h1 className="text-4xl font-black text-[#0B7C56]">OW<span className="text-gray-800">Motors</span></h1>
                            <p className="text-gray-500 mt-2 font-medium">Branch: {order.branch}</p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-2xl font-bold text-gray-300 uppercase tracking-widest">INVOICE</h2>
                            <p className="text-gray-600 mt-1 font-medium">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                            <p className="text-sm text-gray-500">Invoice #{order._id.slice(-6).toUpperCase()}</p>
                        </div>
                    </div>

                    <div className="mb-8 grid grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Billed To</h3>
                            <p className="font-semibold text-lg">{order.name}</p>
                            <p className="text-gray-600">{order.address}</p>
                            <p className="text-gray-600">Tel: {order.phone}</p>
                        </div>
                    </div>

                    <table className="w-full text-left mb-8">
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
                                <tr key={index} className="border-b border-gray-100 last:border-0 hover:bg-slate-50 transition-colors">
                                    <td className="py-4">
                                        <p className="font-semibold">{item.product.name}</p>
                                        <p className="text-sm text-gray-500 capitalize">{item.product.category?.replace('_', ' ')}</p>
                                    </td>
                                    <td className="py-4 text-center font-medium">{item.quantity}</td>
                                    <td className="py-4 text-right">${item.price.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                    <td className="py-4 text-right font-semibold">${(item.quantity * item.price).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="flex justify-end gap-x-12 pt-4 border-t-2 border-slate-200">
                        <div className="text-right space-y-2">
                            <p className="text-gray-500 font-medium">Subtotal</p>
                            <p className="text-gray-500 font-medium pt-4 border-t border-gray-100">Total Due</p>
                        </div>
                        <div className="text-right space-y-2">
                            <p className="font-semibold">${order.totalAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                            <p className="font-bold text-[#0B7C56] text-xl pt-4 border-t border-gray-100">${order.totalAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                        </div>
                    </div>
                    
                    <div className="mt-16 text-center text-sm text-gray-400 print:text-xs">
                        <p>Thank you for choosing OW Motors! We appreciate your business.</p>
                        <p className="mt-1">For support or returns, visit our website or contact your local branch.</p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Invoice;
