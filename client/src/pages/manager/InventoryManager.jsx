import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, deleteProduct } from '../../slice/inventorySlice';
import ProductFormModal from '../../components/ProductFormModal';
import toast from 'react-hot-toast';

const InventoryManager = () => {
    const dispatch = useDispatch();
    const { products, status } = useSelector(state => state.inventory);
    const { role, branch } = useSelector(state => state.auth);
    
    const [filter, setFilter] = useState('all');
    const [showForm, setShowForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        dispatch(fetchProducts());
    }, [dispatch]);

    const handleFilterChange = (category) => {
        setFilter(category);
        if (category === 'all') dispatch(fetchProducts());
        else dispatch(fetchProducts({ category }));
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this item?")) return;
        try {
            await dispatch(deleteProduct(id)).unwrap();
            toast.success("Product deleted");
        } catch (error) {
            toast.error(error || "Delete failed");
        }
    };

    // Client-side search filter
    const filteredProducts = products.filter(p => {
        const q = searchQuery.toLowerCase();
        return p.name.toLowerCase().includes(q) || (p.category && p.category.toLowerCase().includes(q));
    });

    // Branch overview stats
    const totalItems = products.length;
    const totalUnits = products.reduce((sum, p) => sum + p.quantity, 0);
    const lowStockItems = products.filter(p => p.quantity <= 5).length;
    const totalStockValue = products.reduce((sum, p) => sum + (p.sellingPrice * p.quantity), 0);
    const totalCostValue = products.reduce((sum, p) => sum + (p.purchasePrice * p.quantity), 0);

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1 style={{ fontSize: '2rem', textAlign: 'left', margin: 0 }}>
                    Branch Inventory {branch && <span className="text-sm text-gray-500 font-normal">— {branch}</span>}
                </h1>
                {role === 'manager' && (
                    <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"></path></svg>
                        Add Item
                    </button>
                )}
            </div>

            {/* Branch Overview Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                    <p className="text-xs text-gray-500 font-medium mb-1">Product Types</p>
                    <p className="text-2xl font-bold text-gray-800">{status === 'loading' ? '...' : totalItems}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                    <p className="text-xs text-gray-500 font-medium mb-1">Total Units</p>
                    <p className="text-2xl font-bold text-gray-800">{status === 'loading' ? '...' : totalUnits}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                    <p className="text-xs text-gray-500 font-medium mb-1">Stock Value (Sell)</p>
                    <p className="text-2xl font-bold text-[#0B7C56]">{status === 'loading' ? '...' : `$${totalStockValue.toLocaleString()}`}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                    <p className="text-xs text-gray-500 font-medium mb-1">Stock Value (Cost)</p>
                    <p className="text-2xl font-bold text-gray-800">{status === 'loading' ? '...' : `$${totalCostValue.toLocaleString()}`}</p>
                </div>
                <div className={`rounded-xl border shadow-sm p-4 ${lowStockItems > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'}`}>
                    <p className="text-xs text-gray-500 font-medium mb-1">Low Stock</p>
                    <p className={`text-2xl font-bold ${lowStockItems > 0 ? 'text-red-500' : 'text-gray-800'}`}>{status === 'loading' ? '...' : lowStockItems}</p>
                </div>
            </div>

            {/* Filters + Search Row */}
            <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => handleFilterChange('all')}>All Items</button>
                    <button className={`btn ${filter === 'bike' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => handleFilterChange('bike')}>Bikes</button>
                    <button className={`btn ${filter === 'spare_part' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => handleFilterChange('spare_part')}>Spare Parts</button>
                </div>
                <div className="relative w-72">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    <input
                        type="text"
                        placeholder="Search inventory..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white shadow-sm text-sm focus:ring-2 focus:ring-[#0B7C56] focus:border-transparent outline-none transition-all"
                    />
                </div>
            </div>

            {status === 'loading' ? (
                <p>Loading inventory...</p>
            ) : (
                <div className="glass-card table-container">
                    <table className="glass-table">
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Item Name</th>
                                <th>Category</th>
                                <th>Quantity</th>
                                <th>Purchase Price</th>
                                <th>Selling Price</th>
                                {role === 'manager' && <th>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={role === 'manager' ? 7 : 6} style={{ textAlign: 'center', padding: '24px' }}>
                                        {searchQuery ? `No results for "${searchQuery}"` : 'No inventory found.'}
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map(item => (
                                    <tr key={item._id}>
                                        <td>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '8px', overflow: 'hidden', background: 'var(--input-bg)' }}>
                                                <img src={`http://localhost:8000/images/${item.image}`} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </div>
                                        </td>
                                        <td style={{ fontWeight: '500' }}>{item.name}</td>
                                        <td><span className="badge badge-warning">{item.category}</span></td>
                                        <td>
                                            <span style={{ color: item.quantity <= 3 ? 'var(--danger)' : 'inherit', fontWeight: item.quantity <= 3 ? 'bold' : 'normal' }}>
                                                {item.quantity} Units
                                            </span>
                                        </td>
                                        <td>${item.purchasePrice}</td>
                                        <td>${item.sellingPrice}</td>
                                        {role === 'manager' && (
                                            <td>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <div className="action-icon" onClick={() => handleDelete(item._id)}>
                                                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                    </div>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {showForm && (
                <ProductFormModal onClose={() => setShowForm(false)} />
            )}
        </div>
    );
};

export default InventoryManager;
