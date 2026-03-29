import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../slice/authSlice.js";
import inventoryReducer from "../slice/inventorySlice.js";
import orderReducer from "../slice/orderSlice.js";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        inventory: inventoryReducer,
        orders: orderReducer
    }
});