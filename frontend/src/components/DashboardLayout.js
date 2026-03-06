import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Sidebar from './Sidebar';

export default function DashboardLayout() {
    const { user, loading } = useAuth();
    const { darkMode } = useTheme();

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-dark-950' : 'bg-gray-50'}`}>
                <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className={`min-h-screen ${darkMode ? 'bg-dark-950' : 'bg-gray-50'}`}>
            <Sidebar />
            <main className="lg:ml-64 pt-20 px-4 sm:px-6 lg:px-8 pb-8">
                <Outlet />
            </main>
        </div>
    );
}
