import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    isAuthenticated: false,
    token: null,
    username: null,
    role: null,
};

export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        login: (state, action) => {
            state.isAuthenticated = true;
            state.token = action.payload.token
            state.username = action.payload.username;
            state.role = action.payload.role;
        },
        logout: (state) => {
            state.isAuthenticated = false;
            state.token = null;
            state.username = null;
            state.role = null;
        },
    },
});

export const { login, logout } = authSlice.actions;

export default authSlice.reducer;