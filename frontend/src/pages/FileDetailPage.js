import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { fileAPI } from '../services/api';
import toast from 'react-hot-toast';
import { HiArrowLeft, HiDownload, HiEye, HiShieldCheck, HiClock, HiDocumentText, HiRefresh } from 'react-icons/hi';

export default function FileDetailPage() {
    const { id } = useParams();
    const { isAdmin } = useAuth();
    const { darkMode } = useTheme();
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [detections, setDetections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('sanitized');

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { loadFile(); }, [id]);

    const loadFile = async () => {
        try {
            const res = await fileAPI.get(id);
            setFile(res.data.file);
            setDetections(res.data.detections);
        } catch (err) {
            toast.error('Failed to load file');
            navigate('/dashboard/files');
        }
        setLoading(false);
    };

    const handleDownload = async () => {
        try {
            const res = await fileAPI.download(id);
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.download = `sanitized_${file.original_name}`;
            link.click();
            window.URL.revokeObjectURL(url);
            toast.success('Download started!');
        } catch (err) {
            toast.error('Download failed');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (!file) return null;

    const getStatusBadge = (status) => {
        const styles = {
            completed: 'bg-green-500/10 text-green-400 border-green-500/20',
            processing: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
            failed: 'bg-red-500/10 text-red-400 border-red-500/20',
        };
        return `px-3 py-1 rounded-full text-sm font-semibold border ${styles[status] || 'bg-gray-500/10 text-gray-400'}`;
    };

    // Group detections by type
    const piiSummary = detections.reduce((acc, d) => {
        acc[d.pii_type] = (acc[d.pii_type] || 0) + 1;
        return acc;
    }, {});

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex items-start space-x-4">
                    <button onClick={() => navigate('/dashboard/files')} className={`p-2 rounded-lg mt-1 ${darkMode ? 'text-gray-400 hover:bg-white/5' : 'text-gray-500 hover:bg-gray-100'} transition-all`}>
                        <HiArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{file.original_name}</h1>
                        <div className="flex items-center space-x-3 mt-2">
                            <span className={getStatusBadge(file.status)}>{file.status}</span>
                            <span className={`text-xs font-mono px-2 py-1 rounded ${darkMode ? 'bg-white/5 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>.{file.file_type}</span>
                            <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                {new Date(file.created_at).toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex space-x-2">
                    {file.status === 'processing' && (
                        <button onClick={() => { setLoading(true); loadFile(); }}
                            className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center space-x-2 ${darkMode ? 'bg-white/5 text-gray-300 hover:bg-white/10' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} transition-all`}>
                            <HiRefresh className="w-4 h-4 animate-spin" /> <span>Refresh</span>
                        </button>
                    )}
                    {file.status === 'completed' && (
                        <button onClick={handleDownload}
                            className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 transition-all shadow-lg shadow-blue-500/20 flex items-center space-x-2">
                            <HiDownload className="w-4 h-4" /> <span>Download Sanitized</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/[0.03] border border-white/5' : 'bg-white border border-gray-100 shadow-sm'}`}>
                    <div className="flex items-center space-x-2 mb-1">
                        <HiShieldCheck className="w-4 h-4 text-cyan-400" />
                        <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>PII Found</span>
                    </div>
                    <div className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>{file.pii_count}</div>
                </div>
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/[0.03] border border-white/5' : 'bg-white border border-gray-100 shadow-sm'}`}>
                    <div className="flex items-center space-x-2 mb-1">
                        <HiClock className="w-4 h-4 text-amber-400" />
                        <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Processing Time</span>
                    </div>
                    <div className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>{file.processing_time_ms || '—'}ms</div>
                </div>
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/[0.03] border border-white/5' : 'bg-white border border-gray-100 shadow-sm'}`}>
                    <div className="flex items-center space-x-2 mb-1">
                        <HiDocumentText className="w-4 h-4 text-blue-400" />
                        <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>File Size</span>
                    </div>
                    <div className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>{(file.file_size / 1024).toFixed(1)}KB</div>
                </div>
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/[0.03] border border-white/5' : 'bg-white border border-gray-100 shadow-sm'}`}>
                    <div className="flex items-center space-x-2 mb-1">
                        <HiEye className="w-4 h-4 text-purple-400" />
                        <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Method</span>
                    </div>
                    <div className={`text-lg font-black capitalize ${darkMode ? 'text-white' : 'text-gray-900'}`}>{file.sanitization_method}</div>
                </div>
            </div>

            {/* PII Summary */}
            {Object.keys(piiSummary).length > 0 && (
                <div className={`p-6 rounded-2xl ${darkMode ? 'bg-white/[0.03] border border-white/5' : 'bg-white border border-gray-100 shadow-sm'}`}>
                    <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>PII Detection Summary</h3>
                    <div className="flex flex-wrap gap-3">
                        {Object.entries(piiSummary).map(([type, count]) => (
                            <div key={type} className={`px-4 py-2 rounded-xl ${darkMode ? 'bg-cyan-500/10 border border-cyan-500/20' : 'bg-blue-50 border border-blue-200'}`}>
                                <span className={`text-xs uppercase font-bold ${darkMode ? 'text-cyan-400' : 'text-blue-700'}`}>{type}</span>
                                <span className={`ml-2 text-sm font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* File Content View */}
            {file.status === 'completed' && (
                <div className={`rounded-2xl overflow-hidden ${darkMode ? 'bg-white/[0.03] border border-white/5' : 'bg-white border border-gray-100 shadow-sm'}`}>
                    {/* View Toggle */}
                    {isAdmin && (
                        <div className={`flex border-b ${darkMode ? 'border-white/5' : 'border-gray-100'}`}>
                            <button onClick={() => setViewMode('sanitized')}
                                className={`px-6 py-3 text-sm font-semibold transition-all ${viewMode === 'sanitized'
                                    ? darkMode ? 'text-cyan-400 border-b-2 border-cyan-400 bg-white/[0.02]' : 'text-blue-700 border-b-2 border-blue-600 bg-blue-50/50'
                                    : darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-700'
                                    }`}>🛡️ Sanitized Output</button>
                            <button onClick={() => setViewMode('original')}
                                className={`px-6 py-3 text-sm font-semibold transition-all ${viewMode === 'original'
                                    ? darkMode ? 'text-red-400 border-b-2 border-red-400 bg-white/[0.02]' : 'text-red-700 border-b-2 border-red-600 bg-red-50/50'
                                    : darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-700'
                                    }`}>⚠️ Original (Admin)</button>
                        </div>
                    )}

                    <div className="p-6">
                        <pre className={`text-sm leading-relaxed whitespace-pre-wrap font-mono max-h-[600px] overflow-y-auto ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {viewMode === 'original' && isAdmin ? (file.original_text || 'Original text not available') : (file.sanitized_text || 'Sanitized text not available')}
                        </pre>
                    </div>
                </div>
            )}

            {/* Detections Table */}
            {detections.length > 0 && (
                <div className={`rounded-2xl overflow-hidden ${darkMode ? 'bg-white/[0.03] border border-white/5' : 'bg-white border border-gray-100 shadow-sm'}`}>
                    <div className="p-6 pb-3">
                        <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Detection Details</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className={`text-xs uppercase border-b ${darkMode ? 'text-gray-500 border-white/5 bg-white/[0.02]' : 'text-gray-400 border-gray-100 bg-gray-50'}`}>
                                    <th className="text-left py-3 px-6">Type</th>
                                    {isAdmin && <th className="text-left py-3 px-6">Original Value</th>}
                                    <th className="text-left py-3 px-6">Masked Value</th>
                                    <th className="text-left py-3 px-6">Confidence</th>
                                    <th className="text-left py-3 px-6">Method</th>
                                </tr>
                            </thead>
                            <tbody>
                                {detections.map((d, i) => (
                                    <tr key={i} className={`border-t ${darkMode ? 'border-white/5' : 'border-gray-50'}`}>
                                        <td className="py-3 px-6">
                                            <span className={`text-xs uppercase font-bold px-2 py-1 rounded ${darkMode ? 'bg-cyan-500/10 text-cyan-400' : 'bg-blue-50 text-blue-700'}`}>{d.pii_type}</span>
                                        </td>
                                        {isAdmin && <td className={`py-3 px-6 text-sm font-mono ${darkMode ? 'text-red-400' : 'text-red-600'}`}>{d.original_value || '—'}</td>}
                                        <td className={`py-3 px-6 text-sm font-mono ${darkMode ? 'text-green-400' : 'text-green-600'}`}>{d.masked_value}</td>
                                        <td className={`py-3 px-6 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{((d.confidence || 0) * 100).toFixed(0)}%</td>
                                        <td className={`py-3 px-6 text-xs capitalize ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{d.detection_method}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
