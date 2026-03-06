import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { auditAPI } from '../services/api';
import { HiClipboardList, HiSearch, HiRefresh } from 'react-icons/hi';

export default function AuditLogsPage() {
    const { darkMode } = useTheme();
    const [logs, setLogs] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [actionFilter, setActionFilter] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadLogs(); }, [page, actionFilter]);

    const loadLogs = async () => {
        try {
            const params = { page, limit: 20 };
            if (search) params.search = search;
            if (actionFilter) params.action = actionFilter;
            const res = await auditAPI.list(params);
            setLogs(res.data.logs);
            setTotal(res.data.total);
        } catch (err) {
            console.error('Load audit logs error:', err);
        }
        setLoading(false);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        loadLogs();
    };

    const getActionBadge = (action) => {
        const colors = {
            FILE_UPLOAD: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            FILE_VIEW: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
            FILE_DOWNLOAD: 'bg-green-500/10 text-green-400 border-green-500/20',
            FILE_DELETE: 'bg-red-500/10 text-red-400 border-red-500/20',
            PII_DETECTION: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
            USER_LOGIN: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
            USER_REGISTER: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
            USER_CREATE: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
            USER_UPDATE: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
            USER_DELETE: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
        };
        return `px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colors[action] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`;
    };

    const actions = ['FILE_UPLOAD', 'FILE_VIEW', 'FILE_DOWNLOAD', 'FILE_DELETE', 'PII_DETECTION', 'USER_LOGIN', 'USER_REGISTER', 'USER_CREATE'];
    const totalPages = Math.ceil(total / 20);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Audit Logs</h1>
                    <p className={`text-sm mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{total} entries</p>
                </div>
                <button onClick={() => { setLoading(true); loadLogs(); }}
                    className={`p-2 rounded-lg ${darkMode ? 'text-gray-400 hover:bg-white/5' : 'text-gray-500 hover:bg-gray-100'} transition-all`}>
                    <HiRefresh className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <form onSubmit={handleSearch} className="flex-1">
                    <div className="relative">
                        <HiSearch className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search logs..."
                            className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border ${darkMode ? 'bg-white/5 border-white/10 text-white placeholder-gray-600' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'}`} />
                    </div>
                </form>
                <select value={actionFilter} onChange={e => { setActionFilter(e.target.value); setPage(1); }}
                    className={`px-4 py-2.5 rounded-xl text-sm border ${darkMode ? 'bg-white/5 border-white/10 text-gray-300' : 'bg-white border-gray-200 text-gray-700'}`}>
                    <option value="">All Actions</option>
                    {actions.map(a => <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>)}
                </select>
            </div>

            {/* Logs Table */}
            <div className={`rounded-2xl overflow-hidden ${darkMode ? 'bg-white/[0.03] border border-white/5' : 'bg-white border border-gray-100 shadow-sm'}`}>
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full"></div>
                    </div>
                ) : logs.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className={`text-xs uppercase border-b ${darkMode ? 'text-gray-500 border-white/5 bg-white/[0.02]' : 'text-gray-400 border-gray-100 bg-gray-50'}`}>
                                    <th className="text-left py-3 px-4">Timestamp</th>
                                    <th className="text-left py-3 px-4">User</th>
                                    <th className="text-left py-3 px-4">Action</th>
                                    <th className="text-left py-3 px-4">Resource</th>
                                    <th className="text-left py-3 px-4">IP Address</th>
                                    <th className="text-left py-3 px-4">Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log, i) => (
                                    <tr key={i} className={`border-t ${darkMode ? 'border-white/5 hover:bg-white/[0.02]' : 'border-gray-50 hover:bg-gray-50'} transition-colors`}>
                                        <td className={`py-3 px-4 text-xs font-mono ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                            {new Date(log.created_at).toLocaleString()}
                                        </td>
                                        <td className={`py-3 px-4 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            {log.username || '—'}
                                        </td>
                                        <td className="py-3 px-4"><span className={getActionBadge(log.action)}>{log.action}</span></td>
                                        <td className={`py-3 px-4 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                            {log.resource_type ? `${log.resource_type}` : '—'}
                                        </td>
                                        <td className={`py-3 px-4 text-xs font-mono ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                            {log.ip_address || '—'}
                                        </td>
                                        <td className={`py-3 px-4 text-xs max-w-xs truncate ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                                            {log.details || '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className={`text-center py-16 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                        <HiClipboardList className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">No audit logs found.</p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center space-x-2">
                    {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => (
                        <button key={i} onClick={() => setPage(i + 1)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${page === i + 1
                                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg'
                                : darkMode ? 'text-gray-400 hover:bg-white/5' : 'text-gray-600 hover:bg-gray-100'
                                }`}>{i + 1}</button>
                    ))}
                </div>
            )}
        </div>
    );
}
