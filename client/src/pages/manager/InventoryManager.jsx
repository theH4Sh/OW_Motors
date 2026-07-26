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
    const [editingProduct, setEditingProduct] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const canManage = role === 'manager' || role === 'admin';
    const isAdmin = role === 'admin';

    useEffect(() => {
        dispatch(fetchProducts());
    }, [dispatch]);

    const handleFilterChange = (category) => {
        setFilter(category);
        if (category === 'all') dispatch(fetchProducts());
        else dispatch(fetchProducts({ category }));
    };

    const openAddForm = () => {
        setEditingProduct(null);
        setShowForm(true);
    };

    const openEditForm = (item) => {
        setEditingProduct(item);
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingProduct(null);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;
        try {
            await dispatch(deleteProduct(id)).unwrap();
            toast.success('Product deleted');
        } catch (error) {
            toast.error(error || 'Delete failed');
        }
    };

    const filteredProducts = products.filter(p => {
        const q = searchQuery.toLowerCase();
        return p.name.toLowerCase().includes(q) || (p.category && p.category.toLowerCase().includes(q));
    });

    const totalItems = products.length;
    const totalUnits = products.reduce((sum, p) => sum + p.quantity, 0);
    const lowStockItems = products.filter(p => p.quantity <= 5).length;
    const totalStockValue = products.reduce((sum, p) => sum + (p.sellingPrice * p.quantity), 0);
    const totalCostValue = products.reduce((sum, p) => sum + (p.purchasePrice * p.quantity), 0);


    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">
                    {isAdmin ? 'Global Inventory' : (
                        <>Branch Inventory {branch && <span className="text-sm text-gray-500 font-normal block sm:inline mt-1 sm:mt-0">— {branch}</span>}</>
                    )}
                </h1>
                {role === 'manager' && (
                    <button className="btn btn-primary" onClick={openAddForm}>
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"></path></svg>
                        Add Item
                    </button>
                )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
                <div className="stat-card bg-white rounded-xl border border-gray-100 shadow-sm p-3 sm:p-4">
                    <p className="text-xs text-gray-500 font-medium mb-1">Product Types</p>
                    <p className="stat-value text-gray-800">{status === 'loading' ? '...' : totalItems}</p>
                </div>
                <div className="stat-card bg-white rounded-xl border border-gray-100 shadow-sm p-3 sm:p-4">
                    <p className="text-xs text-gray-500 font-medium mb-1">Total Units</p>
                    <p className="stat-value text-gray-800">{status === 'loading' ? '...' : totalUnits}</p>
                </div>
                <div className="stat-card bg-white rounded-xl border border-gray-100 shadow-sm p-3 sm:p-4 col-span-2 sm:col-span-1">
                    <p className="text-xs text-gray-500 font-medium mb-1">Stock Value (Sell)</p>
                    <p className="stat-value text-[#0B7C56]">{status === 'loading' ? '...' : `PKR ${totalStockValue.toLocaleString()}`}</p>
                </div>
                <div className="stat-card bg-white rounded-xl border border-gray-100 shadow-sm p-3 sm:p-4 col-span-2 sm:col-span-1">
                    <p className="text-xs text-gray-500 font-medium mb-1">Stock Value (Cost)</p>
                    <p className="stat-value text-gray-800">{status === 'loading' ? '...' : `PKR ${totalCostValue.toLocaleString()}`}</p>
                </div>
                <div className={`stat-card rounded-xl border shadow-sm p-3 sm:p-4 col-span-2 sm:col-span-1 ${lowStockItems > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'}`}>
                    <p className="text-xs text-gray-500 font-medium mb-1">Low Stock</p>
                    <p className={`stat-value ${lowStockItems > 0 ? 'text-red-500' : 'text-gray-800'}`}>{status === 'loading' ? '...' : lowStockItems}</p>
                </div>
            </div>

            <div className="filter-toolbar">
                <div className="filter-buttons">
                    <button className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => handleFilterChange('all')}>All Items</button>
                    <button className={`btn ${filter === 'bike' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => handleFilterChange('bike')}>Bikes</button>
                    <button className={`btn ${filter === 'spare_part' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => handleFilterChange('spare_part')}>Spare Parts</button>
                </div>
                <div className="search-field">
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
            ) : filteredProducts.length === 0 ? (
                <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
                    {searchQuery ? `No results for "${searchQuery}"` : 'No inventory found.'}
                </div>
            ) : (
                <>
                    {/* Mobile card list */}
                    <div className="mobile-list-wrap">
                        {filteredProducts.map(item => (
                            <div key={item._id} className="mobile-card">
                                <div className="mobile-card-top">
                                    <div className="mobile-card-thumb">
                                        <img src={`${import.meta.env.VITE_IMG_URL}${item.image}`} alt={item.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="mobile-card-body">
                                        <p className="font-semibold text-gray-900 leading-snug">{item.name}</p>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            <span className="badge badge-warning">{item.category}</span>
                                            {isAdmin && (
                                                <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">{item.branch}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <dl className="mobile-card-meta">
                                    <dt>Quantity</dt>
                                    <dd className={item.quantity <= 3 ? 'text-red-500' : ''}>{item.quantity} units</dd>
                                    <dt>Purchase</dt>
                                    <dd>PKR {item.purchasePrice.toLocaleString()}</dd>
                                    <dt>Selling</dt>
                                    <dd className="text-[#0B7C56]">PKR {item.sellingPrice.toLocaleString()}</dd>
                                </dl>
                                {canManage && (
                                    <div className="mobile-card-actions">
                                        <button type="button" className="btn btn-secondary flex-1" onClick={() => openEditForm(item)}>Edit</button>
                                        <button type="button" className="btn btn-danger flex-1" onClick={() => handleDelete(item._id)}>Delete</button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Desktop table */}
                    <div className="desktop-table-wrap glass-card table-container">
                        <table className="glass-table">
                            <thead>
                                <tr>
                                    <th>Image</th>
                                    <th>Item Name</th>
                                    {isAdmin && <th>Branch</th>}
                                    <th>Category</th>
                                    <th>Quantity</th>
                                    <th>Purchase Price</th>
                                    <th>Selling Price</th>
                                    {canManage && <th>Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map(item => (
                                    <tr key={item._id}>
                                        <td>
                                            <div className="mobile-card-thumb">
                                                <img src={`${import.meta.env.VITE_IMG_URL}${item.image}`} alt={item.name} className="w-full h-full object-cover" />
                                            </div>
                                        </td>
                                        <td style={{ fontWeight: '500' }}>{item.name}</td>
                                        {isAdmin && (
                                            <td>
                                                <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full">{item.branch}</span>
                                            </td>
                                        )}
                                        <td><span className="badge badge-warning">{item.category}</span></td>
                                        <td>
                                            <span style={{ color: item.quantity <= 3 ? 'var(--danger)' : 'inherit', fontWeight: item.quantity <= 3 ? 'bold' : 'normal' }}>
                                                {item.quantity} Units
                                            </span>
                                        </td>
                                        <td>PKR {item.purchasePrice.toLocaleString()}</td>
                                        <td>PKR {item.sellingPrice.toLocaleString()}</td>
                                        {canManage && (
                                            <td>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <div className="action-icon" onClick={() => openEditForm(item)} title="Edit product" style={{ color: 'var(--primary)' }}>
                                                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </div>
                                                    <div className="action-icon" onClick={() => handleDelete(item._id)} title="Delete product">
                                                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {showForm && (
                <ProductFormModal
                    product={editingProduct}
                    onClose={closeForm}
                    onProductAdded={() => dispatch(fetchProducts())}
                />
            )}
        </div>
    );
};

export default InventoryManager;
