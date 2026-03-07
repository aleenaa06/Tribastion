import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { HiShieldCheck, HiMail } from 'react-icons/hi';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const { darkMode } = useTheme();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        if (!email) {
            toast.error('Email is required');
            setLoading(false);
            return;
        }

        // Simulate API call for forgot password
        setTimeout(() => {
            setLoading(false);
            setSubmitted(true);
            toast.success('Password reset link sent to your email.');
        }, 1500);
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
                    <h2 className={`text-2xl font-bold mb-6 text-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>Reset Password</h2>
                    
                    {submitted ? (
                        <div className="text-center space-y-4">
                            <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                                If an account exists for {email}, you will receive a password reset link shortly.
                            </p>
                            <Link to="/login" className={`inline-block w-full py-3.5 text-sm font-bold text-white rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 transition-all shadow-lg shadow-blue-500/25`}>
                                Return to Login
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Enter your email address and we'll send you a link to reset your password.
                            </p>
                            
                            <div>
                                <label className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
                                <div className="relative">
                                    <HiMail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Enter your email"
                                        className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-all focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 ${darkMode ? 'bg-white/5 border-white/10 text-white placeholder-gray-600' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'}`} />
                                </div>
                            </div>

                            <button type="submit" disabled={loading}
                                className="w-full py-3.5 text-sm font-bold text-white rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed">
                                {loading ? (
                                    <span className="flex items-center justify-center space-x-2">
                                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                                        <span>Sending reset link...</span>
                                    </span>
                                ) : 'Send Reset Link'}
                            </button>
                            
                            <div className="text-center">
                                <Link to="/login" className={`text-sm font-medium hover:underline ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}>
                                    Back to Login
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
