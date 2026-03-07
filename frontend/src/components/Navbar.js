import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiShieldCheck, HiMenu, HiX, HiLogout, HiUser } from 'react-icons/hi';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const isLanding = location.pathname === '/';

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 bg-[#020617]/80 backdrop-blur-md border-b border-cyan-500/30 shadow-[0_4px_30px_rgba(6,182,212,0.1)] transition-all`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2 group">
                        <div className="relative">
                            <HiShieldCheck className={`w-8 h-8 text-cyan-400 group-hover:scale-110 transition-transform`} />
                            <div className="absolute inset-0 bg-cyan-400 opacity-20 blur-lg rounded-full group-hover:opacity-40 transition-opacity"></div>
                        </div>
                        <span className="text-xl font-black font-mono tracking-widest text-cyan-50">
                            TRI<span className="text-cyan-400">BASTION</span>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center space-x-6">
                        {!user && isLanding && (
                            <>
                                <a href="#features" className="text-sm font-mono uppercase tracking-widest text-cyan-300/70 hover:text-cyan-300 hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] transition-all">Features</a>
                                <a href="#how-it-works" className="text-sm font-mono uppercase tracking-widest text-cyan-300/70 hover:text-cyan-300 hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] transition-all">How It Works</a>
                                <a href="#demo" className="text-sm font-mono uppercase tracking-widest text-cyan-300/70 hover:text-cyan-300 hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] transition-all">Demo</a>
                            </>
                        )}

                        {user ? (
                            <div className="flex items-center space-x-4">
                                <Link to="/dashboard" className="px-4 py-2 text-sm font-mono uppercase tracking-widest rounded-lg text-cyan-300 hover:text-cyan-100 hover:bg-cyan-900/30 border border-transparent hover:border-cyan-500/50 transition-all">
                                    Dashboard
                                </Link>
                                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-cyan-950/50 border border-cyan-800/50">
                                    <HiUser className="w-4 h-4 text-cyan-400" />
                                    <span className="text-sm font-mono text-cyan-100">{user.username}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-mono uppercase tracking-widest ${user.role === 'admin' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
                                        {user.role}
                                    </span>
                                </div>
                                <button onClick={handleLogout} className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 transition-all" title="Logout">
                                    <HiLogout className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link to="/login" className="px-4 py-2 text-sm font-mono uppercase tracking-widest rounded-lg text-cyan-300 hover:text-cyan-100 hover:bg-cyan-900/30 border border-transparent hover:border-cyan-500/50 transition-all">
                                    System Access
                                </Link>
                                <Link to="/login" className="px-5 py-2 text-sm font-mono font-bold uppercase tracking-widest text-slate-900 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)]">
                                    Initialize
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg text-cyan-400 hover:bg-cyan-900/50 transition-colors">
                        {mobileOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="md:hidden bg-[#0F172A]/95 backdrop-blur-xl border-t border-cyan-500/30 px-4 pb-4 shadow-[0_10px_30px_rgba(6,182,212,0.1)]">
                    {user ? (
                        <div className="space-y-2 pt-4">
                            <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="block px-3 py-3 rounded-lg text-cyan-300 hover:bg-cyan-900/40 border border-transparent hover:border-cyan-500/30 font-mono uppercase tracking-widest text-sm">Dashboard</Link>
                            <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="block w-full text-left px-3 py-3 rounded-lg text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 font-mono uppercase tracking-widest text-sm">Logout</button>
                        </div>
                    ) : (
                        <div className="space-y-3 pt-4">
                            {!user && isLanding && (
                                <>
                                    <a href="#features" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm font-mono uppercase tracking-widest text-cyan-300/70 hover:text-cyan-300">Features</a>
                                    <a href="#how-it-works" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm font-mono uppercase tracking-widest text-cyan-300/70 hover:text-cyan-300">How It Works</a>
                                </>
                            )}
                            <Link to="/login" onClick={() => setMobileOpen(false)} className="block px-3 py-3 rounded-lg text-center bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 font-mono font-bold uppercase tracking-widest shadow-[0_0_10px_rgba(6,182,212,0.2)]">System Access</Link>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
}
