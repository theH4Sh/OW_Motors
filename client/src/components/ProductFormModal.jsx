import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addProduct, updateProduct } from '../slice/inventorySlice';
import toast from 'react-hot-toast';

const IMG_BASE = import.meta.env.VITE_API?.replace('/api', '') || 'http://localhost:8000';

const getInitialFormData = (product) => ({
    name: product?.name || '',
    category: product?.category || 'bike',
    purchasePrice: product?.purchasePrice != null ? String(product.purchasePrice) : '',
    sellingPrice: product?.sellingPrice != null ? String(product.sellingPrice) : '',
    quantity: product?.quantity != null ? String(product.quantity) : '',
    description: product?.description || '',
    branch: product?.branch || '',
    image: null,
});

const ProductFormModal = ({ onClose, onProductAdded, product = null }) => {
    const dispatch = useDispatch();
    const { role } = useSelector(state => state.auth);
    const isEditing = Boolean(product);

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState(() => getInitialFormData(product));
    const [preview, setPreview] = useState(
        product?.image ? `${IMG_BASE}/images/${product.image}` : null
    );

    useEffect(() => {
        setFormData(getInitialFormData(product));
        setPreview(product?.image ? `${IMG_BASE}/images/${product.image}` : null);
    }, [product]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'purchasePrice' || name === 'sellingPrice') {
            const wholeNumber = value === '' ? '' : String(Math.max(0, Math.floor(Number(value))));
            setFormData(prev => ({ ...prev, [name]: wholeNumber }));
            return;
        }
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
        if (role === 'admin' && formData.branch) {
            form.append('branch', formData.branch);
        }
        if (formData.image) {
            form.append('image', formData.image);
        }

        try {
            if (isEditing) {
                await dispatch(updateProduct({ id: product._id, formData: form })).unwrap();
                toast.success('Product updated successfully');
            } else {
                await dispatch(addProduct(form)).unwrap();
                toast.success('Product added successfully');
            }
            onProductAdded?.();
            onClose();
        } catch (error) {
            toast.error(error || `Failed to ${isEditing ? 'update' : 'add'} product`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 style={{ fontSize: '1.25rem' }}>
                        {isEditing ? 'Edit Inventory Item' : 'Add Inventory Item'}
                    </h2>
                    <div className="action-icon" onClick={onClose} style={{ cursor: 'pointer', fontWeight: 'bold' }}>✕</div>
                </div>

                <div className="modal-body">
                    <form id="productForm" onSubmit={handleSubmit} className="product-form-grid">
                        <div className="form-group form-span-2">
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
                            <input required name="quantity" type="number" min="0" step="1" className="form-input" value={formData.quantity} onChange={handleChange} />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Purchase Price (PKR)</label>
                            <input required name="purchasePrice" type="number" min="0" step="1" className="form-input" value={formData.purchasePrice} onChange={handleChange} />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Selling Price (PKR)</label>
                            <input required name="sellingPrice" type="number" min="0" step="1" className="form-input" value={formData.sellingPrice} onChange={handleChange} />
                        </div>

                        {role === 'admin' && (
                            <div className="form-group form-span-2">
                                <label className="form-label">Branch</label>
                                <input
                                    required
                                    name="branch"
                                    type="text"
                                    className="form-input"
                                    value={formData.branch}
                                    onChange={handleChange}
                                    placeholder="e.g. Lahore, Karachi"
                                />
                            </div>
                        )}

                        <div className="form-group form-span-2">
                            <label className="form-label">Description</label>
                            <textarea name="description" className="form-input" value={formData.description} onChange={handleChange} rows="3" />
                        </div>

                        <div className="form-group form-span-2">
                            <label className="form-label">
                                Product Image{isEditing ? ' (leave empty to keep current)' : ''}
                            </label>
                            <input
                                required={!isEditing}
                                type="file"
                                onChange={handleImageChange}
                                className="form-input"
                                accept="image/*"
                            />
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
                        {loading ? (isEditing ? 'Saving...' : 'Adding...') : (isEditing ? 'Save Changes' : 'Add Product')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductFormModal;
