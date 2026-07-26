import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../../slice/inventorySlice';
import { createOrder } from '../../slice/orderSlice';
import toast from 'react-hot-toast';
import Invoice from '../../components/Invoice';

const CATEGORIES = [
    { key: 'all', label: 'All' },
    { key: 'bike', label: 'Bikes' },
    { key: 'spare_part', label: 'Spare Parts' },
];

const PointOfSale = () => {
    const dispatch = useDispatch();
    const { products, status } = useSelector(state => state.inventory);
    const { branch } = useSelector(state => state.auth);

    const [cart, setCart] = useState([]);
    const [customer, setCustomer] = useState({ name: '', fatherName: '', cnic: '', phone: '', address: '' });
    const [processing, setProcessing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [completedOrder, setCompletedOrder] = useState(null);

    useEffect(() => {
        dispatch(fetchProducts());
    }, [dispatch]);

    const getCartQty = (productId) => cart.find(item => item._id === productId)?.qty || 0;

    const addToCart = (product) => {
        if (product.quantity < 1) {
            toast.error('Item is out of stock!');
            return;
        }
        setCart(prev => {
            const existing = prev.find(item => item._id === product._id);
            if (existing) {
                if (existing.qty + 1 > product.quantity) {
                    toast.error(`Not enough stock. Only ${product.quantity} available.`);
                    return prev;
                }
                return prev.map(item => item._id === product._id ? { ...item, qty: item.qty + 1 } : item);
            }
            return [...prev, { ...product, qty: 1 }];
        });
    };

    const updateQty = (productId, delta) => {
        const product = products.find(p => p._id === productId);
        setCart(prev => prev.map(item => {
            if (item._id !== productId) return item;
            const newQty = item.qty + delta;
            if (newQty <= 0) return null;
            if (product && newQty > product.quantity) {
                toast.error(`Not enough stock. Only ${product.quantity} available.`);
                return item;
            }
            return { ...item, qty: newQty };
        }).filter(Boolean));
    };

    const removeFromCart = (productId) => {
        setCart(prev => prev.filter(item => item._id !== productId));
    };

    const clearCart = () => {
        if (cart.length === 0) return;
        setCart([]);
        toast.success('Cart cleared');
    };

    const handleCheckout = async (e) => {
        e.preventDefault();
        if (cart.length === 0) return toast.error('Cart is empty!');

        const cnicDigits = customer.cnic.replace(/\D/g, '');
        if (cnicDigits.length !== 13) {
            return toast.error('Enter a valid 13-digit CNIC');
        }

        setProcessing(true);
        const orderPayload = {
            items: cart.map(item => ({ product: item._id, quantity: item.qty })),
            name: customer.name,
            fatherName: customer.fatherName,
            cnic: customer.cnic,
            phone: customer.phone,
            address: customer.address,
        };

        try {
            const orderRes = await dispatch(createOrder(orderPayload)).unwrap();
            const enrichedOrder = {
                ...orderRes,
                items: orderRes.items.map(orderItem => {
                    const fullProd = products.find(p => p._id === orderItem.product);
                    return { ...orderItem, product: fullProd };
                }),
            };

            setCompletedOrder(enrichedOrder);
            toast.success('Order processed successfully!');
            setCart([]);
            setCustomer({ name: '', fatherName: '', cnic: '', phone: '', address: '' });
            dispatch(fetchProducts());
        } catch (error) {
            toast.error(error || 'Checkout failed');
        } finally {
            setProcessing(false);
        }
    };

    const cartTotal = cart.reduce((sum, item) => sum + item.sellingPrice * item.qty, 0);
    const cartItemCount = cart.reduce((sum, item) => sum + item.qty, 0);

    const filteredProducts = products.filter(p => {
        const q = searchQuery.toLowerCase();
        const matchesSearch = p.name.toLowerCase().includes(q) || (p.category && p.category.toLowerCase().includes(q));
        const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const inStockCount = products.filter(p => p.quantity > 0).length;

    return (
        <div className="pb-6">
            {/* Page header */}
            <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Point of Sale</h1>
                        <p className="text-gray-500 mt-1">
                            {branch ? (
                                <>Selling at <span className="font-semibold text-[#0B7C56]">{branch}</span> branch</>
                            ) : (
                                'Select products and process customer orders'
                            )}
                        </p>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                        <span className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 font-medium border border-emerald-100">
                            {inStockCount} in stock
                        </span>
                        {cart.length > 0 && (
                            <span className="px-3 py-1.5 rounded-full bg-[#0B7C56] text-white font-semibold">
                                {cartItemCount} in cart
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Product catalog */}
                <div className="flex-1 flex flex-col min-h-0">
                    {/* Search & filters */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-4">
                        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                            <div className="relative flex-1 w-full">
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Search by name or category..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:ring-2 focus:ring-[#0B7C56] focus:border-transparent focus:bg-white outline-none transition-all"
                                />
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                {CATEGORIES.map(cat => (
                                    <button
                                        key={cat.key}
                                        type="button"
                                        onClick={() => setCategoryFilter(cat.key)}
                                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                                            categoryFilter === cat.key
                                                ? 'bg-[#0B7C56] text-white shadow-md shadow-emerald-200'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        {cat.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Product grid */}
                    <div className="flex-1 overflow-y-auto pr-1">
                        {status === 'loading' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-5">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                                        <div className="aspect-[4/3] bg-gray-100 rounded-xl mb-4" />
                                        <div className="h-5 bg-gray-100 rounded w-3/4 mb-2" />
                                        <div className="h-4 bg-gray-100 rounded w-1/2" />
                                    </div>
                                ))}
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
                                <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                                <p className="font-semibold text-gray-500 text-lg">No products found</p>
                                <p className="text-sm mt-1">
                                    {searchQuery || categoryFilter !== 'all'
                                        ? 'Try adjusting your search or filters'
                                        : 'Add inventory items to start selling'}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-5 pb-4 mt-1">
                                {filteredProducts.map(prod => {
                                    const inCart = getCartQty(prod._id);
                                    const outOfStock = prod.quantity < 1;
                                    const lowStock = !outOfStock && prod.quantity <= 5;

                                    return (
                                        <button
                                            key={prod._id}
                                            type="button"
                                            disabled={outOfStock}
                                            onClick={() => addToCart(prod)}
                                            className={`group relative text-left p-5 rounded-2xl border-2 transition-all duration-200 ${
                                                outOfStock
                                                    ? 'bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed'
                                                    : 'bg-white border-gray-100 hover:border-[#0B7C56] hover:shadow-lg hover:shadow-emerald-100/50 hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer'
                                            }`}
                                        >
                                            {inCart > 0 && (
                                                <span className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-[#0B7C56] text-white text-sm font-bold flex items-center justify-center shadow-md ring-2 ring-white">
                                                    {inCart}
                                                </span>
                                            )}

                                            <div className="relative aspect-[4/3] bg-gray-50 rounded-xl mb-4 overflow-hidden">
                                                {prod.image ? (
                                                    <img
                                                        src={`${import.meta.env.VITE_IMG_URL}${prod.image}`}
                                                        alt={prod.name}
                                                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                ) : (
                                                    <div className="h-full flex items-center justify-center text-gray-300">
                                                        <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                )}
                                                {outOfStock && (
                                                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                                                        <span className="px-3 py-1.5 bg-gray-800 text-white text-xs font-bold rounded-full uppercase tracking-wide">Out of stock</span>
                                                    </div>
                                                )}
                                                {!outOfStock && (
                                                    <div className="absolute inset-0 bg-[#0B7C56]/0 group-hover:bg-[#0B7C56]/10 transition-colors flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100">
                                                        <span className="px-4 py-1.5 bg-[#0B7C56] text-white text-sm font-semibold rounded-full shadow">+ Add to cart</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-3">
                                                <span className="inline-block text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">
                                                    {prod.category?.replace('_', ' ')}
                                                </span>
                                                <h3 className="font-semibold text-gray-800 text-base leading-snug line-clamp-2 min-h-[2.5rem]">{prod.name}</h3>
                                                <div className="flex justify-between items-center pt-1">
                                                    <span className="text-[#0B7C56] font-bold text-lg">PKR {prod.sellingPrice.toLocaleString()}</span>
                                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                                        lowStock
                                                            ? 'bg-red-50 text-red-600'
                                                            : 'bg-gray-100 text-gray-500'
                                                    }`}>
                                                        {prod.quantity} in stock
                                                    </span>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Cart panel */}
                <div className="w-full lg:w-[420px] shrink-0">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-xl flex flex-col lg:sticky lg:top-4">
                        {/* Cart header */}
                        <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-emerald-50/30 shrink-0">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-[#0B7C56] text-white flex items-center justify-center shadow-md shadow-emerald-200">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900">Current Order</h2>
                                        <p className="text-xs text-gray-500">{cartItemCount} item{cartItemCount !== 1 ? 's' : ''}</p>
                                    </div>
                                </div>
                                {cart.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={clearCart}
                                        className="text-xs font-semibold text-red-500 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                                    >
                                        Clear all
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Cart items — scrollable only this section */}
                        <div className="overflow-y-auto p-4 space-y-2 max-h-[220px] bg-gray-50/50 shrink-0">
                            {cart.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full py-12 text-gray-400">
                                    <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                                        <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                        </svg>
                                    </div>
                                    <p className="font-medium text-gray-500">Cart is empty</p>
                                    <p className="text-sm mt-1 text-center px-4">Tap a product on the left to add it here</p>
                                </div>
                            ) : (
                                cart.map(item => (
                                    <div key={item._id} className="flex gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                                        <div className="w-12 h-12 rounded-lg bg-gray-50 overflow-hidden shrink-0">
                                            {item.image ? (
                                                <img src={`${import.meta.env.VITE_IMG_URL}${item.image}`} alt={item.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">—</div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-sm text-gray-800 truncate">{item.name}</h4>
                                            <p className="text-xs text-gray-500 mt-0.5">PKR {item.sellingPrice.toLocaleString()} each</p>
                                            <div className="flex items-center justify-between mt-2">
                                                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => updateQty(item._id, -1)}
                                                        className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white text-gray-600 font-bold transition-colors"
                                                    >
                                                        −
                                                    </button>
                                                    <span className="w-8 text-center text-sm font-bold text-gray-800">{item.qty}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => updateQty(item._id, 1)}
                                                        className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white text-gray-600 font-bold transition-colors"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                <span className="font-bold text-gray-900 text-sm">
                                                    PKR {(item.sellingPrice * item.qty).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeFromCart(item._id)}
                                            className="self-start p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Remove item"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Checkout — always visible at bottom */}
                        <div className="p-5 border-t border-gray-200 bg-white shrink-0">
                            <form onSubmit={handleCheckout} className="space-y-4">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Customer Details</p>
                                    <div className="space-y-2.5">
                                        <input
                                            required
                                            type="text"
                                            placeholder="Customer name"
                                            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#0B7C56] focus:border-transparent outline-none transition-all"
                                            value={customer.name}
                                            onChange={e => setCustomer({ ...customer, name: e.target.value })}
                                        />
                                        <input
                                            required
                                            type="text"
                                            placeholder="Father's name"
                                            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#0B7C56] focus:border-transparent outline-none transition-all"
                                            value={customer.fatherName}
                                            onChange={e => setCustomer({ ...customer, fatherName: e.target.value })}
                                        />
                                        <input
                                            required
                                            type="text"
                                            inputMode="numeric"
                                            placeholder="CNIC (xxxxx-xxxxxxx-x)"
                                            maxLength={15}
                                            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#0B7C56] focus:border-transparent outline-none transition-all"
                                            value={customer.cnic}
                                            onChange={e => {
                                                const digits = e.target.value.replace(/\D/g, '').slice(0, 13);
                                                let formatted = digits;
                                                if (digits.length > 5) {
                                                    formatted = `${digits.slice(0, 5)}-${digits.slice(5)}`;
                                                }
                                                if (digits.length > 12) {
                                                    formatted = `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
                                                }
                                                setCustomer({ ...customer, cnic: formatted });
                                            }}
                                        />
                                        <input
                                            required
                                            type="tel"
                                            placeholder="Phone number"
                                            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#0B7C56] focus:border-transparent outline-none transition-all"
                                            value={customer.phone}
                                            onChange={e => setCustomer({ ...customer, phone: e.target.value })}
                                        />
                                        <input
                                            required
                                            type="text"
                                            placeholder="Delivery / billing address"
                                            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#0B7C56] focus:border-transparent outline-none transition-all"
                                            value={customer.address}
                                            onChange={e => setCustomer({ ...customer, address: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 space-y-2">
                                    <div className="flex justify-between text-sm text-gray-500">
                                        <span>Items ({cartItemCount})</span>
                                        <span>PKR {cartTotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                                        <span className="font-semibold text-gray-700">Total</span>
                                        <span className="text-2xl font-bold text-[#0B7C56]">
                                            PKR {cartTotal.toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing || cart.length === 0}
                                    className="w-full py-3.5 bg-[#0B7C56] hover:bg-[#095c40] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-emerald-200/50 transition-all active:scale-[0.98] flex justify-center items-center gap-2"
                                >
                                    {processing ? (
                                        <>
                                            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Checkout
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {completedOrder && (
                <div className="fixed inset-0 z-[3000] overflow-y-auto">
                    <Invoice order={completedOrder} onClose={() => setCompletedOrder(null)} />
                </div>
            )}
        </div>
    );
};

export default PointOfSale;
