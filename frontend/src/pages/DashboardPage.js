import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { statsAPI, fileAPI } from '../services/api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { HiDocumentText, HiShieldCheck, HiUsers, HiClock, HiUpload, HiEye, HiArrowRight, HiExclamationCircle } from 'react-icons/hi';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement);

export default function DashboardPage() {
    const { user, isAdmin } = useAuth();
    const { darkMode } = useTheme();
    const [stats, setStats] = useState(null);
    const [recentFiles, setRecentFiles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [statsRes, filesRes] = await Promise.all([
                statsAPI.get(),
                fileAPI.list({ limit: 5 })
            ]);
            setStats(statsRes.data);
            setRecentFiles(filesRes.data.files);
        } catch (err) {
            console.error('Dashboard load error:', err);
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    const overview = stats?.overview || {};

    const statCards = [
        { label: 'Total Files', value: overview.totalFiles || 0, icon: HiDocumentText, color: 'from-blue-500 to-blue-600', change: '+12%' },
        { label: 'PII Detected', value: overview.totalPii || 0, icon: HiShieldCheck, color: 'from-cyan-500 to-teal-500', change: 'Protected' },
        { label: 'Completed', value: overview.completedFiles || 0, icon: HiEye, color: 'from-emerald-500 to-green-500', change: 'Sanitized' },
        ...(isAdmin ? [{ label: 'Users', value: overview.totalUsers || 0, icon: HiUsers, color: 'from-purple-500 to-indigo-500', change: 'Active' }] : []),
        { label: 'Avg Time', value: `${overview.avgProcessingTime || 0}ms`, icon: HiClock, color: 'from-amber-500 to-orange-500', change: 'Per file' },
    ];

    const piiChartData = {
        labels: (stats?.piiByType || []).map(p => p.pii_type?.toUpperCase()),
        datasets: [{
            data: (stats?.piiByType || []).map(p => p.count),
            backgroundColor: ['#3b82f6', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'],
            borderWidth: 0,
        }]
    };

    const fileTypeData = {
        labels: (stats?.filesByType || []).map(f => `.${f.file_type}`),
        datasets: [{
            label: 'Files',
            data: (stats?.filesByType || []).map(f => f.count),
            backgroundColor: darkMode ? 'rgba(59, 130, 246, 0.6)' : 'rgba(59, 130, 246, 0.8)',
            borderRadius: 8,
            borderSkipped: false,
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { labels: { color: darkMode ? '#94a3b8' : '#64748b', font: { size: 11 } } }
        }
    };

    const barOptions = {
        ...chartOptions,
        scales: {
            x: { ticks: { color: darkMode ? '#64748b' : '#94a3b8' }, grid: { display: false } },
            y: { ticks: { color: darkMode ? '#64748b' : '#94a3b8' }, grid: { color: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' } }
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            completed: 'bg-green-500/10 text-green-400 border-green-500/20',
            processing: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
            failed: 'bg-red-500/10 text-red-400 border-red-500/20',
            pending: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
        };
        return `px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[status] || styles.pending}`;
    };

    return (
        <div className="space-y-6">
            {/* Welcome */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Welcome back, <span className="gradient-text">{user?.full_name || user?.username}</span>
                    </h1>
                    <p className={`text-sm mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        {isAdmin ? 'Admin Dashboard — Full access to all features' : 'User Dashboard — View sanitized files'}
                    </p>
                </div>
                {isAdmin && (
                    <Link to="/dashboard/upload" className="px-5 py-2.5 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 transition-all shadow-lg shadow-blue-500/20 flex items-center space-x-2">
                        <HiUpload className="w-4 h-4" />
                        <span>Upload File</span>
                    </Link>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {statCards.map((card, i) => (
                    <div key={i} className={`p-5 rounded-2xl transition-all hover:-translate-y-0.5 ${darkMode ? 'bg-white/[0.03] border border-white/5 hover:border-white/10' : 'bg-white border border-gray-100 shadow-sm hover:shadow-md'}`}>
                        <div className="flex items-center justify-between mb-3">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${card.color} flex items-center justify-center shadow-lg`}>
                                <card.icon className="w-5 h-5 text-white" />
                            </div>
                            <span className={`text-xs font-medium ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>{card.change}</span>
                        </div>
                        <div className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>{card.value}</div>
                        <div className={`text-xs mt-0.5 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{card.label}</div>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* PII Detection Breakdown */}
                <div className={`p-6 rounded-2xl ${darkMode ? 'bg-white/[0.03] border border-white/5' : 'bg-white border border-gray-100 shadow-sm'}`}>
                    <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>PII Detection Breakdown</h3>
                    <div className="h-64">
                        {(stats?.piiByType || []).length > 0 ? (
                            <Doughnut data={piiChartData} options={{ ...chartOptions, cutout: '65%' }} />
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <p className={`text-sm ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>No PII data yet. Upload files to see stats.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* File Types */}
                <div className={`p-6 rounded-2xl ${darkMode ? 'bg-white/[0.03] border border-white/5' : 'bg-white border border-gray-100 shadow-sm'}`}>
                    <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Files by Type</h3>
                    <div className="h-64">
                        {(stats?.filesByType || []).length > 0 ? (
                            <Bar data={fileTypeData} options={barOptions} />
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <p className={`text-sm ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>No files uploaded yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Files */}
            <div className={`p-6 rounded-2xl ${darkMode ? 'bg-white/[0.03] border border-white/5' : 'bg-white border border-gray-100 shadow-sm'}`}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Recent Files</h3>
                    <Link to="/dashboard/files" className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center space-x-1">
                        <span>View All</span><HiArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {recentFiles.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className={`text-xs uppercase ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                    <th className="text-left py-3 px-4">File Name</th>
                                    <th className="text-left py-3 px-4">Type</th>
                                    <th className="text-left py-3 px-4">PII Found</th>
                                    <th className="text-left py-3 px-4">Status</th>
                                    <th className="text-left py-3 px-4">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentFiles.map(file => (
                                    <tr key={file.id} className={`border-t ${darkMode ? 'border-white/5 hover:bg-white/[0.02]' : 'border-gray-50 hover:bg-gray-50'} transition-colors`}>
                                        <td className="py-3 px-4">
                                            <Link to={`/dashboard/files/${file.id}`} className={`text-sm font-medium hover:text-cyan-400 transition-colors ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                {file.original_name}
                                            </Link>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`text-xs font-mono px-2 py-1 rounded ${darkMode ? 'bg-white/5 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>.{file.file_type}</span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`text-sm font-semibold ${file.pii_count > 0 ? 'text-cyan-400' : darkMode ? 'text-gray-600' : 'text-gray-400'}`}>{file.pii_count}</span>
                                        </td>
                                        <td className="py-3 px-4"><span className={getStatusBadge(file.status)}>{file.status}</span></td>
                                        <td className={`py-3 px-4 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                            {new Date(file.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className={`text-center py-12 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                        <HiExclamationCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">No files uploaded yet.</p>
                        {isAdmin && (
                            <Link to="/dashboard/upload" className="inline-flex items-center mt-3 text-sm text-cyan-400 hover:text-cyan-300">
                                <HiUpload className="w-4 h-4 mr-1" /> Upload your first file
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
