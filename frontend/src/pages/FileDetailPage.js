import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fileAPI } from '../services/api';
import toast from 'react-hot-toast';
import { HiArrowLeft, HiDownload, HiEye, HiShieldCheck, HiClock, HiDocumentText, HiRefresh } from 'react-icons/hi';
import PIIStats from '../components/PIIStats';

export default function FileDetailPage() {
    const { id } = useParams();
    const { isAdmin } = useAuth();
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
            const nameWithoutExt = file.original_name.replace(/\.[^/.]+$/, "");
            link.download = `sanitized_${nameWithoutExt}.txt`;
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
                <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_#22d3ee]"></div>
            </div>
        );
    }

    if (!file) return null;

    const getStatusBadge = (status) => {
        const styles = {
            completed: 'bg-green-500/10 text-green-400 border-green-500/50 shadow-[0_0_10px_rgba(74,222,128,0.3)]',
            processing: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/50 shadow-[0_0_10px_rgba(234,179,8,0.3)] animate-pulse',
            failed: 'bg-red-500/10 text-red-400 border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.3)]',
        };
        return `px-3 py-1 rounded-full text-xs font-mono font-bold border uppercase tracking-widest ${styles[status] || 'bg-gray-500/10 text-gray-400 border-gray-500'}`;
    };

    // Group detections by type
    const piiSummary = detections.reduce((acc, d) => {
        const type = d.pii_type.toLowerCase();
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {});

    return (
        <div className="space-y-6 relative z-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex items-start space-x-4">
                    <button onClick={() => navigate('/dashboard/files')} className="p-2 rounded-lg mt-1 text-cyan-400 hover:bg-cyan-900/30 border border-transparent hover:border-cyan-500/50 transition-all">
                        <HiArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold font-mono text-cyan-100 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] tracking-wide">{file.original_name}</h1>
                        <div className="flex items-center space-x-4 mt-3">
                            <span className={getStatusBadge(file.status)}>{file.status}</span>
                            <span className="text-xs font-mono px-2 py-1 rounded border border-cyan-800 bg-[#0F172A] text-cyan-400 shadow-[0_0_5px_#0891b2]">.{file.file_type}</span>
                            <span className="text-xs font-mono text-cyan-500/70">
                                {new Date(file.created_at).toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex space-x-3">
                    {file.status === 'processing' && (
                        <button onClick={() => { setLoading(true); loadFile(); }}
                            className="px-4 py-2 rounded-xl text-sm font-bold flex items-center space-x-2 bg-[#0F172A] text-cyan-400 border border-cyan-500 hover:bg-cyan-900/30 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all font-mono">
                            <HiRefresh className="w-4 h-4 animate-spin" /> <span>Sync Status</span>
                        </button>
                    )}
                    {file.status === 'completed' && (
                        <button onClick={handleDownload}
                            className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-900 bg-cyan-400 hover:bg-cyan-300 border border-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.5)] flex items-center space-x-2 transition-all font-mono uppercase tracking-wider">
                            <HiDownload className="w-5 h-5" /> <span>Download Clean File</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Glowing Top Level Stats Panel */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="p-5 rounded-2xl bg-[#0F172A] border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)] hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-all">
                    <div className="flex items-center space-x-2 mb-2">
                        <HiShieldCheck className="w-5 h-5 text-cyan-400 drop-shadow-[0_0_5px_#22d3ee]" />
                        <span className="text-xs font-mono uppercase text-cyan-500 tracking-widest">Total PII</span>
                    </div>
                    <div className="text-3xl font-black font-mono text-cyan-100">{file.pii_count}</div>
                </div>
                <div className="p-5 rounded-2xl bg-[#0F172A] border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)] hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-all">
                    <div className="flex items-center space-x-2 mb-2">
                        <HiClock className="w-5 h-5 text-amber-400 drop-shadow-[0_0_5px_#fbbf24]" />
                        <span className="text-xs font-mono uppercase text-amber-500/70 tracking-widest">Process Time</span>
                    </div>
                    <div className="text-3xl font-black font-mono text-amber-100">{file.processing_time_ms || '—'}ms</div>
                </div>
                <div className="p-5 rounded-2xl bg-[#0F172A] border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)] hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-all">
                    <div className="flex items-center space-x-2 mb-2">
                        <HiDocumentText className="w-5 h-5 text-purple-400 drop-shadow-[0_0_5px_#c084fc]" />
                        <span className="text-xs font-mono uppercase text-purple-500/70 tracking-widest">File Size</span>
                    </div>
                    <div className="text-3xl font-black font-mono text-purple-100">{(file.file_size / 1024).toFixed(1)} <span className="text-lg">KB</span></div>
                </div>
                <div className="p-5 rounded-2xl bg-[#0F172A] border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)] hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-all">
                    <div className="flex items-center space-x-2 mb-2">
                        <HiEye className="w-5 h-5 text-green-400 drop-shadow-[0_0_5px_#4ade80]" />
                        <span className="text-xs font-mono uppercase text-green-500/70 tracking-widest">Security Protocol</span>
                    </div>
                    <div className="text-xl mt-2 font-black font-mono text-green-300 uppercase tracking-widest">{file.sanitization_method}</div>
                </div>
            </div>

            {/* Live Detected Counter - Replaces simple summary if detections exist */}
            <PIIStats stats={piiSummary} />

            {/* File Content View */}
            {file.status === 'completed' && (
                <div className="rounded-2xl overflow-hidden bg-[#0F172A] border border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.15)] mt-8">
                    {/* View Toggle */}
                    {isAdmin && (
                        <div className="flex border-b border-cyan-900/50 bg-[#020617]/50">
                            <button onClick={() => setViewMode('sanitized')}
                                className={`px-6 py-4 text-sm font-mono tracking-widest font-bold transition-all ${viewMode === 'sanitized'
                                    ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-900/20'
                                    : 'text-slate-500 hover:text-cyan-200 hover:bg-slate-800/50'
                                    }`}>🛡️ SECURE OUTPUT_</button>
                            <button onClick={() => setViewMode('original')}
                                className={`px-6 py-4 text-sm font-mono tracking-widest font-bold transition-all ${viewMode === 'original'
                                    ? 'text-red-400 border-b-2 border-red-400 bg-red-900/20'
                                    : 'text-slate-500 hover:text-red-300 hover:bg-slate-800/50'
                                    }`}>⚠️ RAW DATASTREAM_ (ADMIN)</button>
                        </div>
                    )}

                    <div className="p-6 relative">
                        {/* Terminal code background effect */}
                        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #06b6d4 2px, #06b6d4 4px)' }}></div>

                        <pre className="text-sm leading-relaxed whitespace-pre-wrap font-mono max-h-[600px] overflow-y-auto text-cyan-100/90 relative z-10 p-4 bg-[#020617] rounded-lg border border-cyan-900/50 shadow-inner">
                            {viewMode === 'original' && isAdmin ? (file.original_text || 'Original text not available') : (file.sanitized_text || 'Sanitized text not available')}
                        </pre>
                    </div>
                </div>
            )}

            {/* Detections Table - Cyber Style */}
            {detections.length > 0 && (
                <div className="rounded-2xl overflow-hidden bg-[#0F172A] border border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.15)] mt-8">
                    <div className="p-6 border-b border-cyan-900/50 bg-[#020617]/50 bg-opacity-80">
                        <h3 className="text-lg font-bold text-cyan-300 font-mono tracking-widest uppercase">Detection Matrix</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-xs font-mono uppercase tracking-widest bg-cyan-950/40 text-cyan-500 border-b border-cyan-900">
                                    <th className="py-4 px-6 font-semibold">Entity Type</th>
                                    {isAdmin && <th className="py-4 px-6 font-semibold">Raw Data (Classified)</th>}
                                    <th className="py-4 px-6 font-semibold">Masked Hash</th>
                                    <th className="py-4 px-6 font-semibold">Algorithm</th>
                                </tr>
                            </thead>
                            <tbody className="font-mono text-sm">
                                {detections.map((d, i) => (
                                    <tr key={i} className="border-b border-cyan-900/30 hover:bg-cyan-900/20 transition-colors">
                                        <td className="py-4 px-6">
                                            <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-1 rounded bg-cyan-900/50 text-cyan-300 border border-cyan-700/50">
                                                {d.pii_type}
                                            </span>
                                        </td>
                                        {isAdmin && <td className="py-4 px-6 text-red-400 font-black tracking-wider drop-shadow-[0_0_3px_rgba(248,113,113,0.5)]">{d.original_value || '—'}</td>}
                                        <td className="py-4 px-6 text-green-400 font-black tracking-wider drop-shadow-[0_0_3px_rgba(74,222,128,0.5)]">{d.masked_value}</td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-slate-400 uppercase text-xs">{d.detection_method}</span>
                                                {/* Visual confidence bar */}
                                                <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-cyan-500" style={{ width: `${(d.confidence || 0) * 100}%` }} />
                                                </div>
                                            </div>
                                        </td>
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
