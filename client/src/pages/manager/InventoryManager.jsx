import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, deleteProduct } from '../../slice/inventorySlice';
import ProductFormModal from '../../components/ProductFormModal';
import toast from 'react-hot-toast';

const InventoryManager = () => {
    const dispatch = useDispatch();
    const { products, status } = useSelector(state => state.inventory);
    const { role } = useSelector(state => state.auth);
    
    const [filter, setFilter] = useState('all');
    const [showForm, setShowForm] = useState(false);

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

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 style={{ fontSize: '2rem', textAlign: 'left', margin: 0 }}>Branch Inventory</h1>
                {role === 'manager' && (
                    <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"></path></svg>
                        Add Item
                    </button>
                )}
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                <button className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => handleFilterChange('all')}>All Items</button>
                <button className={`btn ${filter === 'bike' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => handleFilterChange('bike')}>Bikes</button>
                <button className={`btn ${filter === 'spare_part' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => handleFilterChange('spare_part')}>Spare Parts</button>
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
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan={role === 'manager' ? 7 : 6} style={{ textAlign: 'center', padding: '24px' }}>No inventory found.</td>
                                </tr>
                            ) : (
                                products.map(item => (
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
