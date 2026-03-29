import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

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
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to fetch');
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
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
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData // sending FormData directly
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to add');
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
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
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to delete');
            return id;
        } catch (error) {
            return rejectWithValue(error.message);
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
            .addCase(fetchProducts.pending, (state) => { state.status = 'loading'; })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.products = action.payload;
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(addProduct.fulfilled, (state, action) => {
                state.products.push(action.payload);
            })
            .addCase(deleteProduct.fulfilled, (state, action) => {
                state.products = state.products.filter(p => p._id !== action.payload);
            });
    }
});

export default inventorySlice.reducer;
