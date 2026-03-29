import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = 'http://localhost:8000/api';

export const createOrder = createAsyncThunk(
    'orders/createOrder',
    async (orderData, { getState, rejectWithValue }) => {
        try {
            const { token } = getState().auth;
            const response = await fetch(`${API_URL}/orders/create-order`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(orderData)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to create order');
            return data.order;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchOrdersByBranch = createAsyncThunk(
    'orders/fetchOrdersByBranch',
    async (branch, { getState, rejectWithValue }) => {
        try {
            const { token } = getState().auth;
            const response = await fetch(`${API_URL}/orders/get-all-orders-by-branch/${branch}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to fetch orders');
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchAllOrders = createAsyncThunk(
    'orders/fetchAllOrders',
    async (_, { getState, rejectWithValue }) => {
        try {
            const { token } = getState().auth;
            const response = await fetch(`${API_URL}/orders/get-all-orders`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to fetch orders');
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const orderSlice = createSlice({
    name: 'orders',
    initialState: {
        orders: [],
        status: 'idle',
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(createOrder.fulfilled, (state, action) => {
                state.orders.unshift(action.payload);
            })
            .addCase(fetchOrdersByBranch.pending, (state) => { state.status = 'loading'; })
            .addCase(fetchOrdersByBranch.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.orders = action.payload;
            })
            .addCase(fetchOrdersByBranch.rejected, (state, action) => {
                state.status = 'failed';
                state.orders = [];
                state.error = action.payload;
            })
            .addCase(fetchAllOrders.pending, (state) => { state.status = 'loading'; })
            .addCase(fetchAllOrders.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.orders = action.payload;
            })
            .addCase(fetchAllOrders.rejected, (state, action) => {
                state.status = 'failed';
                state.orders = [];
                state.error = action.payload;
            });
    }
});

export default orderSlice.reducer;
