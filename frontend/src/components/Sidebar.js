import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
    HiViewGrid, HiUpload, HiDocumentText, HiUsers,
    HiClipboardList, HiChartBar, HiShieldCheck
} from 'react-icons/hi';

export default function Sidebar() {
    const { isAdmin } = useAuth();
    const { darkMode } = useTheme();

    const adminLinks = [
        { to: '/dashboard', icon: HiViewGrid, label: 'Dashboard', end: true },
        { to: '/dashboard/upload', icon: HiUpload, label: 'Upload Files' },
        { to: '/dashboard/files', icon: HiDocumentText, label: 'All Files' },
        { to: '/dashboard/users', icon: HiUsers, label: 'Manage Users' },
        { to: '/dashboard/audit', icon: HiClipboardList, label: 'Audit Logs' },
        { to: '/dashboard/stats', icon: HiChartBar, label: 'Analytics' },
    ];

    const userLinks = [
        { to: '/dashboard', icon: HiViewGrid, label: 'Dashboard', end: true },
        { to: '/dashboard/files', icon: HiDocumentText, label: 'Sanitized Files' },
        { to: '/dashboard/stats', icon: HiChartBar, label: 'Analytics' },
    ];

    const links = isAdmin ? adminLinks : userLinks;

    return (
        <aside className={`w-64 min-h-screen pt-20 px-4 pb-6 ${darkMode ? 'bg-dark-950/80 border-r border-white/5' : 'bg-white border-r border-gray-200'} fixed left-0 top-0 overflow-y-auto hidden lg:block`}>
            {/* Role Badge */}
            <div className={`mb-6 p-3 rounded-xl ${darkMode ? 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-white/5' : 'bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100'}`}>
                <div className="flex items-center space-x-2">
                    <HiShieldCheck className={`w-5 h-5 ${isAdmin ? 'text-cyan-400' : 'text-blue-400'}`} />
                    <span className={`text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                        {isAdmin ? 'Admin Panel' : 'User Panel'}
                    </span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-1">
                {links.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        end={link.end}
                        className={({ isActive }) =>
                            `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${isActive
                                ? darkMode
                                    ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-cyan-400 border border-cyan-500/20 shadow-lg shadow-cyan-500/5'
                                    : 'bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 border border-blue-200'
                                : darkMode
                                    ? 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`
                        }
                    >
                        <link.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span>{link.label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Footer */}
            <div className={`mt-auto pt-6 mt-8 border-t ${darkMode ? 'border-white/5' : 'border-gray-100'}`}>
                <div className={`text-xs ${darkMode ? 'text-gray-600' : 'text-gray-400'} text-center`}>
                    Tribastion v1.0
                    <br />
                    Secure PII Platform
                </div>
            </div>
        </aside>
    );
}
