import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getErrorMessage } from '../utils/apiError';

const API_URL = 'http://localhost:8000/api';

export const fetchProducts = createAsyncThunk(
    'inventory/fetchProducts',
    async ({ category, branch } = {}, { getState, rejectWithValue }) => {
        try {
            const { token } = getState().auth;
            let query = '?';
            if (category) query += `category=${category}&`;
            if (branch) query += `branch=${branch}`;

            const response = await fetch(`${API_URL}/product${query}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(getErrorMessage(data, 'Failed to fetch products'));
            return data;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error, 'Failed to fetch products'));
        }
    }
);

export const addProduct = createAsyncThunk(
    'inventory/addProduct',
    async (formData, { getState, rejectWithValue }) => {
        try {
            const { token } = getState().auth;
            const response = await fetch(`${API_URL}/product`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });
            const data = await response.json();
            if (!response.ok) throw new Error(getErrorMessage(data, 'Failed to add product'));
            return data;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error, 'Failed to add product'));
        }
    }
);

export const updateProduct = createAsyncThunk(
    'inventory/updateProduct',
    async ({ id, formData }, { getState, rejectWithValue }) => {
        try {
            const { token } = getState().auth;
            const response = await fetch(`${API_URL}/product/${id}`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            const data = await response.json();
            if (!response.ok) throw new Error(getErrorMessage(data, 'Failed to update product'));
            return data;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error, 'Failed to update product'));
        }
    }
);

export const deleteProduct = createAsyncThunk(
    'inventory/deleteProduct',
    async (id, { getState, rejectWithValue }) => {
        try {
            const { token } = getState().auth;
            const response = await fetch(`${API_URL}/product/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(getErrorMessage(data, 'Failed to delete product'));
            return id;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error, 'Failed to delete product'));
        }
    }
);

const inventorySlice = createSlice({
    name: 'inventory',
    initialState: {
        products: [],
        status: 'idle',
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchProducts.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.products = action.payload;
                state.error = null;
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(addProduct.fulfilled, (state, action) => {
                state.products.push(action.payload);
            })
            .addCase(updateProduct.fulfilled, (state, action) => {
                const index = state.products.findIndex(p => p._id === action.payload._id);
                if (index !== -1) state.products[index] = action.payload;
            })
            .addCase(deleteProduct.fulfilled, (state, action) => {
                state.products = state.products.filter(p => p._id !== action.payload);
            });
    }
});

export default inventorySlice.reducer;
