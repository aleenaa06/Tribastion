import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { HiShieldCheck, HiEye, HiEyeOff, HiMail, HiUser, HiLockClosed } from 'react-icons/hi';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [form, setForm] = useState({ username: '', email: '', password: '', full_name: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login, register } = useAuth();
    const { darkMode } = useTheme();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isLogin) {
                const user = await login(form.username, form.password);
                toast.success(`Welcome back, ${user.username}!`);
            } else {
                if (!form.email) { toast.error('Email is required'); setLoading(false); return; }
                const user = await register(form);
                toast.success(`Account created! Welcome, ${user.username}!`);
            }
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Authentication failed');
        }
        setLoading(false);
    };

    return (
        <div className={`min-h-screen flex items-center justify-center px-4 pt-16 ${darkMode ? 'bg-dark-950' : 'bg-gray-50'}`}>
            {/* Background effect */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center space-x-2">
                        <HiShieldCheck className="w-10 h-10 text-cyan-400" />
                        <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            Tri<span className="gradient-text">bastion</span>
                        </span>
                    </Link>
                    <p className={`mt-2 text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        Secure PII Detection Platform
                    </p>
                </div>

                {/* Card */}
                <div className={`p-8 rounded-3xl ${darkMode ? 'bg-white/[0.03] border border-white/10' : 'bg-white border border-gray-200 shadow-xl'}`}>
                    {/* Tabs */}
                    <div className={`flex rounded-xl p-1 mb-8 ${darkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
                        <button onClick={() => setIsLogin(true)}
                            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${isLogin
                                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg'
                                : darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                                }`}>Sign In</button>
                        <button onClick={() => setIsLogin(false)}
                            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${!isLogin
                                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg'
                                : darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                                }`}>Sign Up</button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Username */}
                        <div>
                            <label className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Username</label>
                            <div className="relative">
                                <HiUser className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                                <input type="text" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required placeholder="Enter username"
                                    className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-all focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 ${darkMode ? 'bg-white/5 border-white/10 text-white placeholder-gray-600' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'}`} />
                            </div>
                        </div>

                        {/* Email (register only) */}
                        {!isLogin && (
                            <>
                                <div>
                                    <label className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
                                    <div className="relative">
                                        <HiMail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                                        <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required placeholder="Enter email"
                                            className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-all focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 ${darkMode ? 'bg-white/5 border-white/10 text-white placeholder-gray-600' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'}`} />
                                    </div>
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Full Name</label>
                                    <input type="text" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} placeholder="Enter full name"
                                        className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 ${darkMode ? 'bg-white/5 border-white/10 text-white placeholder-gray-600' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'}`} />
                                </div>
                            </>
                        )}

                        {/* Password */}
                        <div>
                            <label className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Password</label>
                            <div className="relative">
                                <HiLockClosed className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                                <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required placeholder="Enter password"
                                    className={`w-full pl-10 pr-12 py-3 rounded-xl border text-sm transition-all focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 ${darkMode ? 'bg-white/5 border-white/10 text-white placeholder-gray-600' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'}`} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className={`absolute right-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}>
                                    {showPassword ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button type="submit" disabled={loading}
                            className="w-full py-3.5 text-sm font-bold text-white rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed">
                            {loading ? (
                                <span className="flex items-center justify-center space-x-2">
                                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                                    <span>{isLogin ? 'Signing in...' : 'Creating account...'}</span>
                                </span>
                            ) : (isLogin ? 'Sign In' : 'Create Account')}
                        </button>
                    </form>

                    {/* Demo credentials */}
                    {isLogin && (
                        <div className={`mt-6 p-4 rounded-xl ${darkMode ? 'bg-cyan-500/5 border border-cyan-500/20' : 'bg-blue-50 border border-blue-100'}`}>
                            <p className={`text-xs font-semibold mb-2 ${darkMode ? 'text-cyan-400' : 'text-blue-700'}`}>Demo Credentials</p>
                            <div className={`space-y-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                <p><strong>Admin:</strong> admin / admin123</p>
                                <p><strong>User:</strong> user / user123</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
