import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getErrorMessage } from '../utils/apiError';

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
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(orderData)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(getErrorMessage(data, 'Failed to create order'));
            return data.order;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error, 'Failed to create order'));
        }
    }
);

export const fetchOrdersByBranch = createAsyncThunk(
    'orders/fetchOrdersByBranch',
    async (branch, { getState, rejectWithValue }) => {
        try {
            const { token } = getState().auth;
            const response = await fetch(`${API_URL}/orders/get-all-orders-by-branch/${branch}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(getErrorMessage(data, 'Failed to fetch orders'));
            return Array.isArray(data) ? data : [];
        } catch (error) {
            return rejectWithValue(getErrorMessage(error, 'Failed to fetch orders'));
        }
    }
);

export const fetchAllOrders = createAsyncThunk(
    'orders/fetchAllOrders',
    async (_, { getState, rejectWithValue }) => {
        try {
            const { token } = getState().auth;
            const response = await fetch(`${API_URL}/orders/get-all-orders`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(getErrorMessage(data, 'Failed to fetch orders'));
            return Array.isArray(data) ? data : [];
        } catch (error) {
            return rejectWithValue(getErrorMessage(error, 'Failed to fetch orders'));
        }
    }
);

export const fetchInstallmentOrders = createAsyncThunk(
    'orders/fetchInstallmentOrders',
    async (branch, { getState, rejectWithValue }) => {
        try {
            const { token } = getState().auth;
            const query = branch && branch !== 'all' ? `?branch=${encodeURIComponent(branch)}` : '';
            const response = await fetch(`${API_URL}/orders/installments${query}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(getErrorMessage(data, 'Failed to fetch installments'));
            return Array.isArray(data) ? data : [];
        } catch (error) {
            return rejectWithValue(getErrorMessage(error, 'Failed to fetch installments'));
        }
    }
);

export const recordInstallmentPayment = createAsyncThunk(
    'orders/recordInstallmentPayment',
    async ({ id, amount, note }, { getState, rejectWithValue }) => {
        try {
            const { token } = getState().auth;
            const response = await fetch(`${API_URL}/orders/${id}/payments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ amount, note })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(getErrorMessage(data, 'Failed to record payment'));
            return data.order;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error, 'Failed to record payment'));
        }
    }
);

const orderSlice = createSlice({
    name: 'orders',
    initialState: {
        orders: [],
        installments: [],
        status: 'idle',
        installmentsStatus: 'idle',
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(createOrder.fulfilled, (state, action) => {
                state.orders.unshift(action.payload);
            })
            .addCase(fetchOrdersByBranch.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchOrdersByBranch.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.orders = action.payload;
                state.error = null;
            })
            .addCase(fetchOrdersByBranch.rejected, (state, action) => {
                state.status = 'failed';
                state.orders = [];
                state.error = action.payload;
            })
            .addCase(fetchAllOrders.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchAllOrders.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.orders = action.payload;
                state.error = null;
            })
            .addCase(fetchAllOrders.rejected, (state, action) => {
                state.status = 'failed';
                state.orders = [];
                state.error = action.payload;
            })
            .addCase(fetchInstallmentOrders.pending, (state) => {
                state.installmentsStatus = 'loading';
                state.error = null;
            })
            .addCase(fetchInstallmentOrders.fulfilled, (state, action) => {
                state.installmentsStatus = 'succeeded';
                state.installments = action.payload;
                state.error = null;
            })
            .addCase(fetchInstallmentOrders.rejected, (state, action) => {
                state.installmentsStatus = 'failed';
                state.installments = [];
                state.error = action.payload;
            })
            .addCase(recordInstallmentPayment.fulfilled, (state, action) => {
                const updated = action.payload;
                state.orders = state.orders.map((o) => (o._id === updated._id ? updated : o));
                if (updated.paymentStatus === 'paid') {
                    state.installments = state.installments.filter((o) => o._id !== updated._id);
                } else {
                    state.installments = state.installments.map((o) =>
                        o._id === updated._id ? updated : o
                    );
                }
            });
    }
});

export default orderSlice.reducer;
