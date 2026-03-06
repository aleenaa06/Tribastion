import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { fileAPI } from '../services/api';
import toast from 'react-hot-toast';
import { HiSearch, HiDownload, HiEye, HiTrash, HiDocumentText, HiRefresh } from 'react-icons/hi';

export default function FilesListPage() {
    const { isAdmin } = useAuth();
    const { darkMode } = useTheme();
    const [files, setFiles] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [loading, setLoading] = useState(true);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { loadFiles(); }, [page, statusFilter]);

    const loadFiles = async () => {
        try {
            const params = { page, limit: 10 };
            if (search) params.search = search;
            if (statusFilter) params.status = statusFilter;
            const res = await fileAPI.list(params);
            setFiles(res.data.files);
            setTotal(res.data.total);
        } catch (err) {
            console.error('Load files error:', err);
        }
        setLoading(false);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        loadFiles();
    };

    const handleDownload = async (id, name) => {
        try {
            const res = await fileAPI.download(id);
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.download = `sanitized_${name.replace(/\.[^.]+$/, '.txt')}`;
            link.click();
            window.URL.revokeObjectURL(url);
            toast.success('Download started!');
        } catch (err) {
            toast.error('Download failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this file?')) return;
        try {
            await fileAPI.delete(id);
            toast.success('File deleted');
            loadFiles();
        } catch (err) {
            toast.error('Delete failed');
        }
    };

    const formatSize = (bytes) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / 1048576).toFixed(1)} MB`;
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

    const totalPages = Math.ceil(total / 10);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {isAdmin ? 'All Files' : 'Sanitized Files'}
                    </h1>
                    <p className={`text-sm mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        {total} files found
                    </p>
                </div>

                <button onClick={() => { setLoading(true); loadFiles(); }}
                    className={`p-2 rounded-lg ${darkMode ? 'text-gray-400 hover:bg-white/5' : 'text-gray-500 hover:bg-gray-100'} transition-all`}>
                    <HiRefresh className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
                <form onSubmit={handleSearch} className="flex-1">
                    <div className="relative">
                        <HiSearch className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search files..."
                            className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border transition-all focus:ring-2 focus:ring-cyan-500/50 ${darkMode ? 'bg-white/5 border-white/10 text-white placeholder-gray-600' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'}`} />
                    </div>
                </form>
                <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                    className={`px-4 py-2.5 rounded-xl text-sm border ${darkMode ? 'bg-white/5 border-white/10 text-gray-300' : 'bg-white border-gray-200 text-gray-700'}`}>
                    <option value="">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="processing">Processing</option>
                    <option value="failed">Failed</option>
                </select>
            </div>

            {/* Table */}
            <div className={`rounded-2xl overflow-hidden ${darkMode ? 'bg-white/[0.03] border border-white/5' : 'bg-white border border-gray-100 shadow-sm'}`}>
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full"></div>
                    </div>
                ) : files.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className={`text-xs uppercase border-b ${darkMode ? 'text-gray-500 border-white/5 bg-white/[0.02]' : 'text-gray-400 border-gray-100 bg-gray-50'}`}>
                                    <th className="text-left py-3 px-4">File Name</th>
                                    <th className="text-left py-3 px-4">Type</th>
                                    <th className="text-left py-3 px-4">Size</th>
                                    <th className="text-left py-3 px-4">PII</th>
                                    <th className="text-left py-3 px-4">Method</th>
                                    <th className="text-left py-3 px-4">Status</th>
                                    <th className="text-left py-3 px-4">Date</th>
                                    <th className="text-right py-3 px-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {files.map(file => (
                                    <tr key={file.id} className={`border-t ${darkMode ? 'border-white/5 hover:bg-white/[0.02]' : 'border-gray-50 hover:bg-gray-50'} transition-colors`}>
                                        <td className="py-3 px-4">
                                            <Link to={`/dashboard/files/${file.id}`} className={`text-sm font-medium hover:text-cyan-400 transition-colors ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                {file.original_name}
                                            </Link>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`text-xs font-mono px-2 py-1 rounded ${darkMode ? 'bg-white/5 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>.{file.file_type}</span>
                                        </td>
                                        <td className={`py-3 px-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{formatSize(file.file_size)}</td>
                                        <td className="py-3 px-4">
                                            <span className={`text-sm font-bold ${file.pii_count > 0 ? 'text-cyan-400' : darkMode ? 'text-gray-600' : 'text-gray-400'}`}>{file.pii_count}</span>
                                        </td>
                                        <td className={`py-3 px-4 text-xs capitalize ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{file.sanitization_method}</td>
                                        <td className="py-3 px-4"><span className={getStatusBadge(file.status)}>{file.status}</span></td>
                                        <td className={`py-3 px-4 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                            {new Date(file.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center justify-end space-x-1">
                                                <Link to={`/dashboard/files/${file.id}`}
                                                    className={`p-1.5 rounded-lg ${darkMode ? 'text-gray-400 hover:text-cyan-400 hover:bg-white/5' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'} transition-all`}>
                                                    <HiEye className="w-4 h-4" />
                                                </Link>
                                                {file.status === 'completed' && (
                                                    <button onClick={() => handleDownload(file.id, file.original_name)}
                                                        className={`p-1.5 rounded-lg ${darkMode ? 'text-gray-400 hover:text-green-400 hover:bg-white/5' : 'text-gray-400 hover:text-green-600 hover:bg-green-50'} transition-all`}>
                                                        <HiDownload className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {isAdmin && (
                                                    <button onClick={() => handleDelete(file.id)}
                                                        className={`p-1.5 rounded-lg ${darkMode ? 'text-gray-400 hover:text-red-400 hover:bg-white/5' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'} transition-all`}>
                                                        <HiTrash className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className={`text-center py-16 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                        <HiDocumentText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">No files found.</p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center space-x-2">
                    {Array.from({ length: totalPages }, (_, i) => (
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
