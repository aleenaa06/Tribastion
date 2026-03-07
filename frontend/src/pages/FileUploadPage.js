import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { fileAPI } from '../services/api';
import toast from 'react-hot-toast';
import { HiCloudUpload, HiDocumentText, HiX, HiArrowRight, HiCheckCircle } from 'react-icons/hi';
import SanitizationCards from '../components/SanitizationCards';
import ScanAnimation from '../components/ScanAnimation';
import { motion } from 'framer-motion';

const ACCEPTED_TYPES = {
    'text/csv': ['.csv'],
    'application/json': ['.json'],
    'text/plain': ['.txt', '.sql'],
    'application/pdf': ['.pdf'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
};

export default function FileUploadPage() {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [method, setMethod] = useState('redaction');
    const [uploading, setUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState(null);

    const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
        if (rejectedFiles.length > 0) {
            toast.error('File type not supported');
            return;
        }
        if (acceptedFiles.length > 0) {
            setFile(acceptedFiles[0]);
            setUploadResult(null);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: ACCEPTED_TYPES,
        maxFiles: 1,
        maxSize: 50 * 1024 * 1024,
    });

    const handleUpload = async () => {
        if (!file) { toast.error('Please select a file'); return; }
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('method', method);
            formData.append('sanitization_method', method);
            formData.append('file', file);

            const response = await fileAPI.upload(formData);

            // Artificial delay to let the cool animation play
            setTimeout(() => {
                setUploadResult(response.data);
                toast.success('File analyzed and secured!');
                setUploading(false);
            }, 1500);

        } catch (err) {
            console.error(err);
            if (err.message === 'Network Error') {
                toast.error('Connection failed. Is the backend API running at the correct REACT_APP_API_URL?');
            } else {
                toast.error(err.response?.data?.error || err.response?.data?.details || 'File processing failed. Please try again.');
            }
            setUploading(false);
        }
    };

    const formatSize = (bytes) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / 1048576).toFixed(1)} MB`;
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 relative">
            <ScanAnimation isProcessing={uploading} fileName={file?.name} />

            <div className="text-center">
                <h1 className="text-4xl font-bold text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)] tracking-wider">
                    SECURE DATALINK
                </h1>
                <p className="text-sm mt-2 text-cyan-200/60 font-mono tracking-widest uppercase">
                    Initialize Encrypted PII Sanitization
                </p>
            </div>

            {/* Glowing Upload Zone */}
            <div {...getRootProps()} className={`
                relative p-12 rounded-3xl border-2 text-center cursor-pointer transition-all duration-500 overflow-hidden
                ${isDragActive
                    ? 'border-cyan-400 bg-cyan-900/30 scale-[1.03] shadow-[0_0_30px_#00BFFF]'
                    : file
                        ? 'border-green-400/50 bg-[#0F172A] shadow-[0_0_20px_rgba(74,222,128,0.2)]'
                        : 'border-slate-700 bg-[#0F172A]/80 hover:border-cyan-500/50 hover:shadow-[0_0_25px_rgba(6,182,212,0.15)] shadow-xl'
                }
            `}>
                <input {...getInputProps()} />

                {file ? (
                    <div className="space-y-4 relative z-10">
                        <div className="w-20 h-20 mx-auto rounded-full bg-green-900/40 flex items-center justify-center border border-green-500/30 shadow-[0_0_15px_rgba(74,222,128,0.3)]">
                            <HiDocumentText className="w-10 h-10 text-green-400" />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-green-300">{file.name}</p>
                            <p className="text-sm text-green-400/60 font-mono">{formatSize(file.size)}</p>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); setFile(null); setUploadResult(null); }}
                            className="inline-flex items-center px-4 py-2 rounded-full bg-red-950/50 text-sm text-red-400 hover:text-red-300 border border-red-900/50 hover:border-red-500/50 transition-all font-mono">
                            <HiX className="w-4 h-4 mr-1" /> Abort Upload
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4 relative z-10">
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            className="w-24 h-24 mx-auto rounded-full bg-cyan-950/50 flex items-center justify-center border border-cyan-800"
                        >
                            <HiCloudUpload className={`w-12 h-12 ${isDragActive ? 'text-cyan-300 drop-shadow-[0_0_8px_#22d3ee]' : 'text-cyan-600'}`} />
                        </motion.div>
                        <div>
                            <p className="text-xl font-bold text-cyan-100">
                                {isDragActive ? 'UPLINK ESTABLISHED' : 'DRAG & DROP TO SECURE'}
                            </p>
                            <p className="text-sm mt-2 text-cyan-400/50 font-mono">
                                OR CLICK TO BROWSE LOCAL FILES
                            </p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-3 mt-6">
                            {['PDF', 'DOCX', 'CSV', 'JSON', 'SQL', 'TXT', 'JPG', 'PNG'].map(fmt => (
                                <span key={fmt} className="text-xs px-3 py-1 rounded-md font-mono bg-slate-800 text-cyan-500 border border-slate-700">
                                    .{fmt}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Sanitization Method Animated Cards */}
            <div className="mt-8">
                <h3 className="text-sm font-bold text-cyan-400/80 uppercase tracking-widest font-mono mb-2 pl-2 border-l-2 border-cyan-500">
                    Select Security Protocol
                </h3>
                <SanitizationCards selectedMethod={method} onSelect={setMethod} />
            </div>

            {/* Glowing Upload Button */}
            <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className={`
                    w-full py-5 text-lg font-bold text-white rounded-2xl transition-all font-mono tracking-widest uppercase
                    ${!file || uploading
                        ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                        : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 border border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)]'
                    }
                `}
            >
                {uploading ? 'Processing Data...' : 'Execute Protocol'}
            </button>

            {/* Hacker-themed Upload Result Alert */}
            {uploadResult && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-2xl bg-[#0F172A] border border-green-500/40 shadow-[0_0_20px_rgba(74,222,128,0.1)] relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-1 h-full bg-green-500 shadow-[0_0_10px_#4ade80]" />
                    <div className="flex items-start space-x-4">
                        <div className="p-2 bg-green-500/10 rounded-full border border-green-500/20">
                            <HiCheckCircle className="w-8 h-8 text-green-400 drop-shadow-[0_0_5px_#4ade80]" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-green-400 font-mono tracking-wider">THREAT MITIGATED</h3>
                            <p className="text-sm text-slate-300 mt-1">
                                File <strong className="text-cyan-300 font-mono">{uploadResult.filename}</strong> secured. PII has been contained via <span className="text-green-300 font-mono">{method.toUpperCase()}</span>.
                            </p>
                            <button onClick={() => navigate(`/dashboard/files/${uploadResult.id}`)}
                                className="mt-4 px-5 py-2 text-sm text-[#020617] bg-green-400 hover:bg-green-300 font-bold rounded-lg transition-colors flex items-center space-x-2 shadow-[0_0_10px_#4ade80]">
                                <span>Access Secure File</span>
                                <HiArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
