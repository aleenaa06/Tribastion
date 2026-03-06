import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { HiShieldCheck, HiSun, HiMoon, HiMenu, HiX, HiLogout, HiUser } from 'react-icons/hi';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { darkMode, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const isLanding = location.pathname === '/';

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 ${darkMode ? 'glass' : 'glass-light'} ${isLanding ? '' : ''}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2 group">
                        <div className="relative">
                            <HiShieldCheck className={`w-8 h-8 ${darkMode ? 'text-cyan-400' : 'text-blue-600'} group-hover:scale-110 transition-transform`} />
                            <div className="absolute inset-0 bg-cyan-400 opacity-20 blur-lg rounded-full group-hover:opacity-40 transition-opacity"></div>
                        </div>
                        <span className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            Tri<span className="gradient-text">bastion</span>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center space-x-4">
                        {!user && isLanding && (
                            <>
                                <a href="#features" className={`px-3 py-2 text-sm font-medium ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>Features</a>
                                <a href="#how-it-works" className={`px-3 py-2 text-sm font-medium ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>How It Works</a>
                                <a href="#demo" className={`px-3 py-2 text-sm font-medium ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>Demo</a>
                            </>
                        )}

                        <button onClick={toggleTheme} className={`p-2 rounded-lg ${darkMode ? 'text-yellow-400 hover:bg-white/10' : 'text-gray-600 hover:bg-gray-100'} transition-all`} title="Toggle theme">
                            {darkMode ? <HiSun className="w-5 h-5" /> : <HiMoon className="w-5 h-5" />}
                        </button>

                        {user ? (
                            <div className="flex items-center space-x-3">
                                <Link to="/dashboard" className={`px-4 py-2 text-sm font-medium rounded-lg ${darkMode ? 'text-gray-300 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:bg-gray-100'} transition-all`}>
                                    Dashboard
                                </Link>
                                <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg ${darkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
                                    <HiUser className={`w-4 h-4 ${darkMode ? 'text-cyan-400' : 'text-blue-600'}`} />
                                    <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{user.username}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${user.role === 'admin' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                        {user.role}
                                    </span>
                                </div>
                                <button onClick={handleLogout} className={`p-2 rounded-lg ${darkMode ? 'text-red-400 hover:bg-red-500/10' : 'text-red-500 hover:bg-red-50'} transition-all`} title="Logout">
                                    <HiLogout className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Link to="/login" className={`px-4 py-2 text-sm font-medium rounded-lg ${darkMode ? 'text-gray-300 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:bg-gray-100'} transition-all`}>
                                    Sign In
                                </Link>
                                <Link to="/login" className="px-4 py-2 text-sm font-semibold text-white rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 transition-all shadow-lg shadow-blue-500/25">
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <button onClick={() => setMobileOpen(!mobileOpen)} className={`md:hidden p-2 rounded-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {mobileOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className={`md:hidden ${darkMode ? 'bg-dark-900/95' : 'bg-white/95'} backdrop-blur-xl border-t ${darkMode ? 'border-white/10' : 'border-gray-200'} px-4 pb-4`}>
                    {user ? (
                        <div className="space-y-2 pt-2">
                            <Link to="/dashboard" onClick={() => setMobileOpen(false)} className={`block px-3 py-2 rounded-lg ${darkMode ? 'text-gray-300 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'}`}>Dashboard</Link>
                            <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="block w-full text-left px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10">Logout</button>
                        </div>
                    ) : (
                        <div className="space-y-2 pt-2">
                            <Link to="/login" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-center bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold">Sign In</Link>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
}
