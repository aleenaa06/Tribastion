import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { statsAPI } from '../services/api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement } from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import { HiChartBar, HiShieldCheck, HiDocumentText, HiClock } from 'react-icons/hi';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement);

export default function StatsPage() {
    const { darkMode } = useTheme();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        statsAPI.get().then(res => { setStats(res.data); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    const overview = stats?.overview || {};
    const textColor = darkMode ? '#94a3b8' : '#64748b';
    const gridColor = darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

    const chartDefaults = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: textColor, font: { family: 'Inter', size: 11 } } } },
    };

    const scaleDefaults = {
        ...chartDefaults,
        scales: {
            x: { ticks: { color: textColor }, grid: { display: false } },
            y: { ticks: { color: textColor }, grid: { color: gridColor } },
        },
    };

    const piiChart = {
        labels: (stats?.piiByType || []).map(p => p.pii_type?.toUpperCase()),
        datasets: [{
            data: (stats?.piiByType || []).map(p => p.count),
            backgroundColor: ['#3b82f6', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'],
            borderWidth: 0,
        }],
    };

    const fileChart = {
        labels: (stats?.filesByType || []).map(f => `.${f.file_type}`),
        datasets: [{
            label: 'Files Processed',
            data: (stats?.filesByType || []).map(f => f.count),
            backgroundColor: darkMode ? 'rgba(59,130,246,0.6)' : 'rgba(59,130,246,0.8)',
            borderRadius: 8,
        }],
    };

    const methodChart = {
        labels: (stats?.byMethod || []).map(m => m.sanitization_method?.charAt(0).toUpperCase() + m.sanitization_method?.slice(1)),
        datasets: [{
            data: (stats?.byMethod || []).map(m => m.count),
            backgroundColor: ['#14b8a6', '#3b82f6', '#8b5cf6'],
            borderWidth: 0,
        }],
    };

    const trendChart = {
        labels: (stats?.recentFiles || []).map(r => r.date),
        datasets: [{
            label: 'Files Uploaded',
            data: (stats?.recentFiles || []).map(r => r.count),
            borderColor: '#14b8a6',
            backgroundColor: 'rgba(20,184,166,0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#14b8a6',
            pointBorderWidth: 0,
        }],
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Analytics</h1>
                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Platform performance and detection statistics</p>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Files Processed', value: overview.completedFiles, icon: HiDocumentText, color: 'from-blue-500 to-blue-600' },
                    { label: 'PII Instances', value: overview.totalPii, icon: HiShieldCheck, color: 'from-cyan-500 to-teal-500' },
                    { label: 'Failed Files', value: overview.failedFiles, icon: HiChartBar, color: 'from-red-500 to-rose-500' },
                    { label: 'Avg Processing', value: `${overview.avgProcessingTime}ms`, icon: HiClock, color: 'from-amber-500 to-orange-500' },
                ].map((card, i) => (
                    <div key={i} className={`p-5 rounded-2xl ${darkMode ? 'bg-white/[0.03] border border-white/5' : 'bg-white border border-gray-100 shadow-sm'}`}>
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${card.color} flex items-center justify-center mb-3 shadow-lg`}>
                            <card.icon className="w-5 h-5 text-white" />
                        </div>
                        <div className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>{card.value || 0}</div>
                        <div className={`text-xs mt-0.5 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{card.label}</div>
                    </div>
                ))}
            </div>

            {/* Charts Grid */}
            <div className="grid lg:grid-cols-2 gap-6">
                <div className={`p-6 rounded-2xl ${darkMode ? 'bg-white/[0.03] border border-white/5' : 'bg-white border border-gray-100 shadow-sm'}`}>
                    <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>PII Detection by Type</h3>
                    <div className="h-72">
                        {(stats?.piiByType || []).length > 0 ? <Doughnut data={piiChart} options={{ ...chartDefaults, cutout: '60%' }} /> :
                            <div className="flex items-center justify-center h-full"><p className={`text-sm ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>No data yet</p></div>}
                    </div>
                </div>

                <div className={`p-6 rounded-2xl ${darkMode ? 'bg-white/[0.03] border border-white/5' : 'bg-white border border-gray-100 shadow-sm'}`}>
                    <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Files by Format</h3>
                    <div className="h-72">
                        {(stats?.filesByType || []).length > 0 ? <Bar data={fileChart} options={scaleDefaults} /> :
                            <div className="flex items-center justify-center h-full"><p className={`text-sm ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>No data yet</p></div>}
                    </div>
                </div>

                <div className={`p-6 rounded-2xl ${darkMode ? 'bg-white/[0.03] border border-white/5' : 'bg-white border border-gray-100 shadow-sm'}`}>
                    <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Sanitization Methods</h3>
                    <div className="h-72">
                        {(stats?.byMethod || []).length > 0 ? <Doughnut data={methodChart} options={{ ...chartDefaults, cutout: '60%' }} /> :
                            <div className="flex items-center justify-center h-full"><p className={`text-sm ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>No data yet</p></div>}
                    </div>
                </div>

                <div className={`p-6 rounded-2xl ${darkMode ? 'bg-white/[0.03] border border-white/5' : 'bg-white border border-gray-100 shadow-sm'}`}>
                    <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Upload Trend (7 Days)</h3>
                    <div className="h-72">
                        {(stats?.recentFiles || []).length > 0 ? <Line data={trendChart} options={scaleDefaults} /> :
                            <div className="flex items-center justify-center h-full"><p className={`text-sm ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>No data yet</p></div>}
                    </div>
                </div>
            </div>
        </div>
    );
}
