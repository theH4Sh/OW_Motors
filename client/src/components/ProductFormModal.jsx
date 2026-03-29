import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addProduct } from '../slice/inventorySlice';
import toast from 'react-hot-toast';

const ProductFormModal = ({ onClose, onProductAdded }) => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        category: 'bike', // bike or spare_part
        purchasePrice: '',
        sellingPrice: '',
        quantity: '',
        description: '',
        image: null
    });

    const [preview, setPreview] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, image: file }));
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const form = new FormData();
        form.append('name', formData.name);
        form.append('category', formData.category);
        form.append('purchasePrice', formData.purchasePrice);
        form.append('sellingPrice', formData.sellingPrice);
        form.append('quantity', formData.quantity);
        form.append('description', formData.description);
        if (formData.image) {
            form.append('image', formData.image);
        }

        try {
            await dispatch(addProduct(form)).unwrap();
            toast.success("Product added successfully");
            onProductAdded();
            onClose();
        } catch (error) {
            toast.error(error || "Failed to add product");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 style={{ fontSize: '1.25rem' }}>Add Inventory Item</h2>
                    <div className="action-icon" onClick={onClose} style={{ cursor: 'pointer', fontWeight: 'bold' }}>✕</div>
                </div>
                
                <div className="modal-body">
                    <form id="productForm" onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        
                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label className="form-label">Product Name</label>
                            <input required name="name" type="text" className="form-input" value={formData.name} onChange={handleChange} />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Category</label>
                            <select name="category" className="form-input" value={formData.category} onChange={handleChange}>
                                <option value="bike">Bike</option>
                                <option value="spare_part">Spare Part</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Quantity in Stock</label>
                            <input required name="quantity" type="number" min="0" className="form-input" value={formData.quantity} onChange={handleChange} />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Purchase Price ($)</label>
                            <input required name="purchasePrice" type="number" min="0" step="0.01" className="form-input" value={formData.purchasePrice} onChange={handleChange} />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Selling Price ($)</label>
                            <input required name="sellingPrice" type="number" min="0" step="0.01" className="form-input" value={formData.sellingPrice} onChange={handleChange} />
                        </div>

                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label className="form-label">Description</label>
                            <textarea name="description" className="form-input" value={formData.description} onChange={handleChange} rows="3" />
                        </div>

                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label className="form-label">Product Image</label>
                            <input required type="file" onChange={handleImageChange} className="form-input" accept="image/*" />
                            {preview && (
                                <div style={{ marginTop: '12px' }}>
                                    <img src={preview} alt="preview" style={{ maxWidth: '100%', borderRadius: '8px', height: '150px', objectFit: 'cover' }} />
                                </div>
                            )}
                        </div>

                    </form>
                </div>
                
                <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                    <button type="submit" form="productForm" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Adding...' : 'Add Product'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductFormModal;
