import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { statsAPI, fileAPI } from '../services/api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { HiDocumentText, HiShieldCheck, HiUsers, HiClock, HiUpload, HiEye, HiArrowRight, HiExclamationCircle } from 'react-icons/hi';
import CyberGlobe from '../components/CyberGlobe';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement);

export default function DashboardPage() {
    const { user, isAdmin } = useAuth();
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
                <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_#22d3ee]"></div>
            </div>
        );
    }

    const overview = stats?.overview || {};

    const statCards = [
        { label: 'Total Files', value: overview.totalFiles || 0, icon: HiDocumentText, color: 'text-blue-400 drop-shadow-[0_0_5px_#60a5fa]', change: '+12%' },
        { label: 'PII Detected', value: overview.totalPii || 0, icon: HiShieldCheck, color: 'text-cyan-400 drop-shadow-[0_0_5px_#22d3ee]', change: 'Protected' },
        { label: 'Completed', value: overview.completedFiles || 0, icon: HiEye, color: 'text-emerald-400 drop-shadow-[0_0_5px_#34d399]', change: 'Sanitized' },
        ...(isAdmin ? [{ label: 'Users', value: overview.totalUsers || 0, icon: HiUsers, color: 'text-purple-400 drop-shadow-[0_0_5px_#c084fc]', change: 'Active' }] : []),
        { label: 'Avg Time', value: `${overview.avgProcessingTime || 0}ms`, icon: HiClock, color: 'text-amber-400 drop-shadow-[0_0_5px_#fbbf24]', change: 'Per file' },
    ];

    const piiChartData = {
        labels: (stats?.piiByType || []).map(p => p.pii_type?.toUpperCase()),
        datasets: [{
            data: (stats?.piiByType || []).map(p => p.count),
            backgroundColor: ['#22d3ee', '#34d399', '#fbbf24', '#f87171', '#c084fc', '#f472b6', '#38bdf8'],
            borderColor: '#020617',
            borderWidth: 2,
        }]
    };

    const fileTypeData = {
        labels: (stats?.filesByType || []).map(f => `.${f.file_type}`),
        datasets: [{
            label: 'Files',
            data: (stats?.filesByType || []).map(f => f.count),
            backgroundColor: 'rgba(34, 211, 238, 0.8)', // cyan-400
            borderRadius: 4,
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { labels: { color: '#67e8f9', font: { family: 'monospace', size: 11 } } } // cyan-200
        }
    };

    const barOptions = {
        ...chartOptions,
        scales: {
            x: { ticks: { color: '#22d3ee', font: { family: 'monospace' } }, grid: { display: false } }, // cyan-400
            y: { ticks: { color: '#22d3ee', font: { family: 'monospace' } }, grid: { color: 'rgba(34, 211, 238, 0.1)' } }
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            completed: 'bg-green-500/10 text-green-400 border-green-500/50 shadow-[0_0_10px_rgba(74,222,128,0.2)]',
            processing: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/50 shadow-[0_0_10px_rgba(234,179,8,0.2)] animate-pulse',
            failed: 'bg-red-500/10 text-red-400 border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]',
            pending: 'bg-slate-500/10 text-slate-400 border-slate-500/50',
        };
        return `px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase tracking-widest border ${styles[status] || styles.pending}`;
    };

    return (
        <div className="space-y-8 relative z-10">
            {/* Header with Globe Background */}
            <div className="relative overflow-hidden rounded-3xl bg-[#0F172A] border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)] flex flex-col md:flex-row items-center min-h-[250px]">
                {/* 3D Cyber Globe */}
                <div className="w-full md:w-1/2 h-[250px] md:absolute md:right-0 md:top-0 -mr-20">
                    <CyberGlobe />
                    {/* Fade out edge */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A] via-transparent to-transparent hidden md:block" />
                </div>

                <div className="relative z-10 p-8 w-full md:w-2/3">
                    <h1 className="text-4xl font-black font-mono text-cyan-100 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)] tracking-wide">
                        SYSTEM TERMINAL, <span className="text-cyan-400">{user?.full_name || user?.username}</span>_
                    </h1>
                    <p className="text-sm mt-3 text-cyan-200/60 font-mono uppercase tracking-widest">
                        {isAdmin ? 'Root Access Granted // Global Overview Active' : 'User Access Granted // Personal Secure Sector'}
                    </p>

                    {isAdmin && (
                        <Link to="/dashboard/upload" className="mt-6 inline-flex px-6 py-3 text-sm font-bold text-slate-900 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.5)] items-center space-x-2 uppercase font-mono tracking-wider">
                            <HiUpload className="w-5 h-5" />
                            <span>Initiate File Upload</span>
                        </Link>
                    )}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {statCards.map((card, i) => (
                    <div key={i} className="p-5 rounded-2xl bg-[#0F172A] border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)] hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] hover:-translate-y-1 transition-all relative overflow-hidden group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-0 group-hover:opacity-10 blur transition duration-500"></div>
                        <div className="relative bg-[#0F172A] h-full rounded-xl flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2 bg-cyan-900/40 rounded-lg border border-cyan-500/20 shadow-inner">
                                    <card.icon className={`w-6 h-6 ${card.color}`} />
                                </div>
                                <span className="text-xs font-mono uppercase text-cyan-600 font-bold">{card.change}</span>
                            </div>
                            <div className="text-3xl font-black font-mono text-cyan-100">{card.value}</div>
                            <div className="text-xs mt-1 text-cyan-400/60 font-mono uppercase tracking-widest">{card.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* PII Detection Breakdown */}
                <div className="p-6 rounded-2xl bg-[#0F172A] border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.1)] relative">
                    <h3 className="text-lg font-bold mb-4 font-mono text-cyan-300 uppercase tracking-widest border-b border-cyan-900/50 pb-2">PII Detection Topology</h3>
                    <div className="h-64 relative z-10">
                        {(stats?.piiByType || []).length > 0 ? (
                            <Doughnut data={piiChartData} options={{ ...chartOptions, cutout: '70%' }} />
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-sm text-cyan-500/50 font-mono">No target data acquired yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* File Types */}
                <div className="p-6 rounded-2xl bg-[#0F172A] border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
                    <h3 className="text-lg font-bold mb-4 font-mono text-cyan-300 uppercase tracking-widest border-b border-cyan-900/50 pb-2">Encrypted Data Formats</h3>
                    <div className="h-64">
                        {(stats?.filesByType || []).length > 0 ? (
                            <Bar data={fileTypeData} options={barOptions} />
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-sm text-cyan-500/50 font-mono">No telemetry found.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Files Table */}
            <div className="p-6 rounded-2xl bg-[#0F172A] border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)] relative overflow-hidden">
                <div className="flex justify-between items-center mb-6 border-b border-cyan-900/50 pb-3 relative z-10">
                    <h3 className="text-lg font-bold text-cyan-300 font-mono uppercase tracking-widest drop-shadow-[0_0_5px_#22d3ee]">Active Intercepts</h3>
                    <Link to="/dashboard/files" className="text-sm text-cyan-400 hover:text-cyan-200 flex items-center space-x-2 font-mono uppercase tracking-wider transition-colors">
                        <span>View All Logs</span><HiArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #06b6d4 1px, transparent 1px), linear-gradient(to bottom, #06b6d4 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

                {recentFiles && recentFiles.length > 0 ? (
                    <div className="overflow-x-auto relative z-10">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-xs font-mono uppercase tracking-widest bg-cyan-950/40 text-cyan-500 border-b border-cyan-900">
                                    <th className="py-4 px-4 font-semibold">File Signature</th>
                                    <th className="py-4 px-4 font-semibold">Format</th>
                                    <th className="py-4 px-4 font-semibold">Targets Found</th>
                                    <th className="py-4 px-4 font-semibold">Net Status</th>
                                    <th className="py-4 px-4 font-semibold">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody className="font-mono text-sm">
                                {(recentFiles || []).map(file => (
                                    <tr key={file.id} className="border-b border-cyan-900/30 hover:bg-cyan-900/20 transition-colors">
                                        <td className="py-4 px-4">
                                            <Link to={`/dashboard/files/${file.id}`} className="text-cyan-100 font-bold hover:text-cyan-400 drop-shadow flex items-center space-x-2 transition-colors">
                                                <HiDocumentText className="text-cyan-500" />
                                                <span>{file.original_name}</span>
                                            </Link>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="text-xs px-2 py-1 rounded bg-slate-900 text-cyan-500 border border-slate-700">.{file.file_type}</span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className={`font-black ${file.pii_count > 0 ? 'text-red-400 drop-shadow-[0_0_5px_#f87171]' : 'text-slate-500'}`}>{file.pii_count}</span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className={getStatusBadge(file.status)}>{file.status}</span>
                                        </td>
                                        <td className="py-4 px-4 text-xs text-slate-500">
                                            {new Date(file.created_at).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12 text-cyan-500/50 font-mono relative z-10">
                        <HiExclamationCircle className="w-16 h-16 mx-auto mb-4 opacity-30 animate-pulse" />
                        <p className="text-base uppercase tracking-widest">Awaiting First Upload Sequence</p>
                        {isAdmin && (
                            <Link to="/dashboard/upload" className="inline-flex items-center mt-6 px-6 py-2 text-sm text-cyan-950 bg-cyan-500/80 hover:bg-cyan-400 font-bold rounded-lg transition-colors border border-cyan-300">
                                <HiUpload className="w-4 h-4 mr-2" /> Initialize System
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
