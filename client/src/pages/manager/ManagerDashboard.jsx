import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProducts } from '../../slice/inventorySlice';

const ManagerDashboard = () => {
    const dispatch = useDispatch();
    const { products, status } = useSelector(state => state.inventory);
    const { branch, username } = useSelector(state => state.auth);

    useEffect(() => {
        dispatch(fetchProducts());
    }, [dispatch]);

    const totalInventory = products.length;
    const lowStockItems = products.filter(p => p.quantity <= 5).length;
    const totalValue = products.reduce((acc, curr) => acc + (curr.sellingPrice * curr.quantity), 0);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 style={{ fontSize: '2rem', textAlign: 'left', margin: 0 }}>
                    Branch: {branch} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>(Manager: {username})</span>
                </h1>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                <div className="glass-card">
                    <h3 className="form-label" style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Total Items</h3>
                    <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                        {status === 'loading' ? '...' : totalInventory}
                    </div>
                </div>

                <div className="glass-card" style={{ background: lowStockItems > 0 ? 'rgba(239, 68, 68, 0.05)' : '' }}>
                    <h3 className="form-label" style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Low Stock Alerts</h3>
                    <div style={{ fontSize: '3rem', fontWeight: 'bold', color: lowStockItems > 0 ? 'var(--danger)' : 'var(--secondary)' }}>
                        {status === 'loading' ? '...' : lowStockItems}
                    </div>
                </div>

                <div className="glass-card">
                    <h3 className="form-label" style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Total Stock Value</h3>
                    <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--secondary)' }}>
                        {status === 'loading' ? '...' : `$${totalValue.toLocaleString()}`}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagerDashboard;
