import React, { useState } from "react";
import { Outlet, Navigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import Sidebar from "../components/Sidebar";

const DashboardLayout = () => {
    const { isAuthenticated } = useSelector(state => state.auth);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="dashboard-layout">
            {/* Mobile Header */}
            <header className="mobile-header">
                <button onClick={toggleSidebar} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#0B7C56] text-white flex items-center justify-center rounded font-bold text-xs">OW</div>
                    <span className="font-bold text-slate-900">Motors</span>
                </div>
                <div className="w-10"></div> {/* Spacer for balance */}
            </header>

            {/* Sidebar Overlay (Backdrop) */}
            <div 
                className={`sidebar-overlay ${isSidebarOpen ? 'show' : ''}`} 
                onClick={() => setIsSidebarOpen(false)}
            ></div>

            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout;
