import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../../slice/inventorySlice';
import { createOrder } from '../../slice/orderSlice';
import toast from 'react-hot-toast';
import Invoice from '../../components/Invoice';

const PointOfSale = () => {
    const dispatch = useDispatch();
    const { products, status } = useSelector(state => state.inventory);
    
    const [cart, setCart] = useState([]);
    const [customer, setCustomer] = useState({ name: '', phone: '', address: '' });
    const [processing, setProcessing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Created fully formed order to pass to Invoice
    const [completedOrder, setCompletedOrder] = useState(null);

    useEffect(() => {
        dispatch(fetchProducts());
    }, [dispatch]);

    // Cart Logic
    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item._id === product._id);
            if (existing) {
                if (existing.qty + 1 > product.quantity) {
                    toast.error(`Not enough stock. Only ${product.quantity} available.`);
                    return prev;
                }
                return prev.map(item => item._id === product._id ? { ...item, qty: item.qty + 1 } : item);
            } else {
                if (product.quantity < 1) {
                    toast.error("Item is out of stock!");
                    return prev;
                }
                return [...prev, { ...product, qty: 1 }];
            }
        });
    };

    const removeFromCart = (productId) => {
        setCart(prev => prev.filter(item => item._id !== productId));
    };

    const handleCheckout = async (e) => {
        e.preventDefault();
        if (cart.length === 0) return toast.error("Cart is empty!");

        setProcessing(true);
        const orderPayload = {
            items: cart.map(item => ({ product: item._id, quantity: item.qty })),
            name: customer.name,
            phone: customer.phone,
            address: customer.address
        };

        try {
            const orderRes = await dispatch(createOrder(orderPayload)).unwrap();
            
            // To pass complete product details to the invoice, we reconstruct the items with full objects
            const enrichedOrder = {
                ...orderRes,
                items: orderRes.items.map(orderItem => {
                    const fullProd = products.find(p => p._id === orderItem.product);
                    return { ...orderItem, product: fullProd };
                })
            };

            setCompletedOrder(enrichedOrder);
            toast.success("Order processed successfully!");
            
            // Reset POS state
            setCart([]);
            setCustomer({ name: '', phone: '', address: '' });
            
            // Refetch inventory to update stock counts
            dispatch(fetchProducts());
        } catch (error) {
            toast.error(error || "Checkout failed");
        } finally {
            setProcessing(false);
        }
    };

    const cartTotal = cart.reduce((sum, item) => sum + (item.sellingPrice * item.qty), 0);

    const filteredProducts = products.filter(p => {
        const q = searchQuery.toLowerCase();
        return p.name.toLowerCase().includes(q) || (p.category && p.category.toLowerCase().includes(q));
    });

    return (
        <div className="h-full flex gap-6 mt-4">
            
            {/* Inventory Grid (Left Side) */}
            <div className="flex-1 overflow-y-auto pr-2 pb-10">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Point of Sale</h1>
                    <div className="relative w-72">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white shadow-sm text-sm focus:ring-2 focus:ring-[#0B7C56] focus:border-transparent outline-none transition-all"
                        />
                    </div>
                </div>
                
                {status === 'loading' ? (
                    <p>Loading inventory...</p>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <svg className="w-16 h-16 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        <p className="font-medium">No products match "{searchQuery}"</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredProducts.map(prod => (
                            <div 
                                key={prod._id} 
                                onClick={() => addToCart(prod)}
                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${prod.quantity > 0 ? 'bg-white border-white hover:border-[#0B7C56] shadow-sm hover:shadow-md' : 'bg-gray-100 border-gray-200 opacity-60 cursor-not-allowed'}`}
                            >
                                <div className="h-32 bg-gray-50 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                                     {prod.image ? (
                                        <img src={`http://localhost:8000/images/${prod.image}`} alt={prod.name} className="h-full w-full object-cover" />
                                     ) : (
                                        <div className="text-gray-400 font-medium">No Image</div>
                                     )}
                                </div>
                                <h3 className="font-semibold text-gray-800 truncate">{prod.name}</h3>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-[#0B7C56] font-bold">${prod.sellingPrice}</span>
                                    <span className="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-1 rounded-full">{prod.quantity} in stock</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Cart & Checkout (Right Side) */}
            <div className="w-[400px] bg-white shadow-xl rounded-2xl flex flex-col overflow-hidden h-full sticky top-4 border border-gray-100">
                <div className="p-4 border-b border-gray-100 bg-slate-50">
                    <h2 className="text-xl font-bold text-gray-800">Current Order</h2>
                </div>
                
                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
                    {cart.length === 0 ? (
                        <div className="text-center text-gray-400 mt-10">
                            <svg className="w-16 h-16 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                            <p>Cart is empty. Click items to add.</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item._id} className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                                <div>
                                    <h4 className="font-semibold text-sm text-gray-800">{item.name}</h4>
                                    <p className="text-xs text-gray-500">${item.sellingPrice} x {item.qty}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-gray-800">${(item.sellingPrice * item.qty).toLocaleString()}</span>
                                    <button onClick={() => removeFromCart(item._id)} className="text-red-400 hover:text-red-600 transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Checkout Section */}
                <div className="p-5 border-t border-gray-200 bg-white">
                    <form onSubmit={handleCheckout} className="space-y-3 mb-4">
                        <input required type="text" placeholder="Customer Name" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0B7C56] outline-none" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} />
                        <input required type="text" placeholder="Phone Number" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0B7C56] outline-none" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} />
                        <input required type="text" placeholder="Delivery/Billing Address" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0B7C56] outline-none" value={customer.address} onChange={e => setCustomer({...customer, address: e.target.value})} />
                        
                        <div className="pt-4 pb-2 flex justify-between items-center border-b border-gray-100">
                            <span className="text-gray-500 font-medium">Subtotal</span>
                            <span className="text-xl font-bold text-gray-800">${cartTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                        </div>
                        
                        <button type="submit" disabled={processing || cart.length === 0} className="w-full py-3 bg-[#0B7C56] hover:bg-[#095c40] disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-all active:scale-[0.98] flex justify-center items-center gap-2 mt-2">
                            {processing ? (
                                <span>Processing...</span>
                            ) : (
                                <>
                                    <span>Process Payment</span>
                                    <span>→</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            {/* Invoice Print Popup */}
            {completedOrder && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <Invoice order={completedOrder} onClose={() => setCompletedOrder(null)} />
                </div>
            )}
            
        </div>
    );
};

export default PointOfSale;
