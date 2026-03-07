import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { useTheme } from '../context/ThemeContext';
import { fileAPI } from '../services/api';
import toast from 'react-hot-toast';
import { HiCloudUpload, HiDocumentText, HiX, HiArrowRight, HiCheckCircle } from 'react-icons/hi';

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
    const { darkMode } = useTheme();
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
            setUploadResult(response.data);
            toast.success('File uploaded and processing started!');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Upload failed');
        }
        setUploading(false);
    };

    const formatSize = (bytes) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / 1048576).toFixed(1)} MB`;
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Upload File</h1>
                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    Upload files containing PII for automatic detection and sanitization.
                </p>
            </div>

            {/* Upload Zone */}
            <div {...getRootProps()} className={`p-12 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all duration-300
        ${isDragActive
                    ? 'border-cyan-500 bg-cyan-500/5 scale-[1.02]'
                    : file
                        ? darkMode ? 'border-green-500/30 bg-green-500/5' : 'border-green-300 bg-green-50'
                        : darkMode ? 'border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.04]' : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
                }`}>
                <input {...getInputProps()} />

                {file ? (
                    <div className="space-y-3">
                        <HiDocumentText className={`w-16 h-16 mx-auto ${darkMode ? 'text-green-400' : 'text-green-500'}`} />
                        <div>
                            <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{file.name}</p>
                            <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{formatSize(file.size)}</p>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); setFile(null); setUploadResult(null); }}
                            className="inline-flex items-center text-sm text-red-400 hover:text-red-300 transition-colors">
                            <HiX className="w-4 h-4 mr-1" /> Remove
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <HiCloudUpload className={`w-16 h-16 mx-auto ${isDragActive ? 'text-cyan-400 animate-bounce' : darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                        <div>
                            <p className={`text-lg font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                {isDragActive ? 'Drop your file here' : 'Drag & drop a file here'}
                            </p>
                            <p className={`text-sm mt-1 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                                or click to browse your files
                            </p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-2 mt-4">
                            {['PDF', 'DOCX', 'CSV', 'JSON', 'SQL', 'TXT', 'JPG', 'PNG'].map(fmt => (
                                <span key={fmt} className={`text-xs px-2.5 py-1 rounded-lg font-mono ${darkMode ? 'bg-white/5 text-gray-500' : 'bg-gray-100 text-gray-500'}`}>.{fmt.toLowerCase()}</span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Sanitization Method */}
            <div className={`p-6 rounded-2xl ${darkMode ? 'bg-white/[0.03] border border-white/5' : 'bg-white border border-gray-100 shadow-sm'}`}>
                <h3 className={`text-sm font-semibold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Sanitization Method</h3>
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { value: 'redaction', label: 'Redaction', desc: 'Replace with [REDACTED]' },
                        { value: 'masking', label: 'Masking', desc: 'Partially hide values' },
                        { value: 'tokenization', label: 'Tokenization', desc: 'Replace with tokens' },
                    ].map(opt => (
                        <button key={opt.value} onClick={() => setMethod(opt.value)}
                            className={`p-4 rounded-xl text-left transition-all ${method === opt.value
                                ? darkMode
                                    ? 'bg-cyan-500/10 border-2 border-cyan-500/30 shadow-lg shadow-cyan-500/5'
                                    : 'bg-blue-50 border-2 border-blue-300'
                                : darkMode
                                    ? 'bg-white/[0.02] border-2 border-transparent hover:border-white/10'
                                    : 'bg-gray-50 border-2 border-transparent hover:border-gray-200'
                                }`}>
                            <div className={`text-sm font-bold ${method === opt.value ? 'text-cyan-400' : darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{opt.label}</div>
                            <div className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{opt.desc}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Upload Button */}
            <button onClick={handleUpload} disabled={!file || uploading}
                className="w-full py-4 text-sm font-bold text-white rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2">
                {uploading ? (
                    <>
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                        <span>Uploading & Processing...</span>
                    </>
                ) : (
                    <>
                        <HiCloudUpload className="w-5 h-5" />
                        <span>Upload & Detect PII</span>
                    </>
                )}
            </button>

            {/* Upload Result */}
            {uploadResult && (
                <div className={`p-6 rounded-2xl ${darkMode ? 'bg-green-500/5 border border-green-500/20' : 'bg-green-50 border border-green-200'}`}>
                    <div className="flex items-start space-x-3">
                        <HiCheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-bold text-green-400 mb-1">Upload Successful!</h3>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                File <strong>{uploadResult.filename}</strong> has been uploaded and is being processed. PII detection is running.
                            </p>
                            <button onClick={() => navigate(`/dashboard/files/${uploadResult.id}`)}
                                className="mt-3 text-sm text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 transition-colors">
                                <span>View File Details</span>
                                <HiArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
