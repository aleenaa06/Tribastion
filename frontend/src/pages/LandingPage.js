import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import {
    HiShieldCheck, HiLockClosed, HiDocumentSearch, HiEye,
    HiCloudUpload, HiDatabase, HiChartBar, HiCode,
    HiArrowRight, HiCheckCircle
} from 'react-icons/hi';

export default function LandingPage() {
    const { darkMode } = useTheme();
    const { user } = useAuth();

    const features = [
        { icon: HiDocumentSearch, title: 'Smart PII Detection', desc: 'Automatically detect names, emails, phone numbers, PAN, Aadhaar, IPs and more using Regex + NLP.', color: 'from-blue-500 to-blue-600' },
        { icon: HiShieldCheck, title: 'Data Sanitization', desc: 'Mask, redact, or tokenize sensitive information with multiple sanitization methods.', color: 'from-cyan-500 to-teal-500' },
        { icon: HiCloudUpload, title: 'Multi-Format Support', desc: 'Upload PDF, DOCX, CSV, JSON, SQL, TXT, JPG, PNG files for seamless processing.', color: 'from-purple-500 to-indigo-500' },
        { icon: HiLockClosed, title: 'Role-Based Access', desc: 'Admins manage uploads & view raw data. Standard users only see sanitized outputs.', color: 'from-rose-500 to-pink-500' },
        { icon: HiDatabase, title: 'Audit Logging', desc: 'Complete audit trail of all uploads, downloads, accesses, and PII detection events.', color: 'from-amber-500 to-orange-500' },
        { icon: HiChartBar, title: 'Analytics Dashboard', desc: 'Interactive charts showing files processed, PII detections, and sanitization statistics.', color: 'from-emerald-500 to-green-500' },
    ];

    const steps = [
        { step: '01', title: 'Upload File', desc: 'Admin uploads a file containing sensitive data through the drag-and-drop interface.' },
        { step: '02', title: 'PII Detection', desc: 'Our engine scans the file using Regex patterns and NLP Named Entity Recognition.' },
        { step: '03', title: 'Sanitization', desc: 'Detected PII is masked, redacted, or tokenized based on your chosen method.' },
        { step: '04', title: 'Secure Access', desc: 'Only sanitized versions are accessible to standard users. Originals stay protected.' },
    ];

    const demoInput = `My name is Rahul Sharma and my Aadhaar number is 1234-5678-9012. 
Contact me at rahul.sharma@email.com or +91-98765-43210.
My PAN is ABCPD1234E.`;

    const demoOutput = `My name is [REDACTED_NAME] and my Aadhaar number is [REDACTED_AADHAAR]. 
Contact me at [REDACTED_EMAIL] or [REDACTED_PHONE].
My PAN is [REDACTED_PAN].`;

    return (
        <div className={`min-h-screen ${darkMode ? 'bg-dark-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
            {/* Hero */}
            <section className="relative pt-32 pb-20 px-4 overflow-hidden">
                {/* Background effects */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
                    <div className="absolute top-1/3 -right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"></div>
                </div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center max-w-4xl mx-auto">
                        <div className={`inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border mb-8 ${darkMode ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400' : 'border-blue-200 bg-blue-50 text-blue-700'}`}>
                            <HiShieldCheck className="w-4 h-4" />
                            <span className="text-sm font-medium">Enterprise-Grade PII Protection</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6">
                            Detect & Sanitize{' '}
                            <span className="gradient-text">Personal Data</span>{' '}
                            Automatically
                        </h1>

                        <p className={`text-lg md:text-xl mb-10 max-w-2xl mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Upload any file — CSV, PDF, DOCX, images and more. Our AI-powered engine detects PII like names, Aadhaar numbers, PAN cards, emails, and sanitizes them instantly.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link to={user ? '/dashboard' : '/login'} className="px-8 py-4 text-lg font-bold text-white rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 transition-all shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 flex items-center space-x-2 group">
                                <span>{user ? 'Go to Dashboard' : 'Start Protecting Data'}</span>
                                <HiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <a href="#demo" className={`px-8 py-4 text-lg font-semibold rounded-2xl border-2 ${darkMode ? 'border-white/20 text-gray-300 hover:bg-white/5' : 'border-gray-300 text-gray-700 hover:bg-gray-100'} transition-all`}>
                                See Demo
                            </a>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 max-w-3xl mx-auto">
                        {[
                            { label: 'File Formats', value: '8+' },
                            { label: 'PII Types', value: '7+' },
                            { label: 'Detection Methods', value: '3' },
                            { label: 'Sanitization Modes', value: '3' },
                        ].map((stat, i) => (
                            <div key={i} className={`text-center p-4 rounded-2xl ${darkMode ? 'bg-white/5 border border-white/5' : 'bg-white border border-gray-100 shadow-sm'}`}>
                                <div className="text-3xl font-black gradient-text">{stat.value}</div>
                                <div className={`text-sm mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section id="features" className="py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-black mb-4">
                            Powerful <span className="gradient-text">Security Features</span>
                        </h2>
                        <p className={`text-lg max-w-2xl mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Everything you need to detect, sanitize, and manage sensitive personal data.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, i) => (
                            <div key={i} className={`group p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 ${darkMode ? 'bg-white/[0.03] border border-white/5 hover:border-white/10 hover:bg-white/[0.05]' : 'bg-white border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-md'}`}>
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                                    <feature.icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className={`text-lg font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{feature.title}</h3>
                                <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" className={`py-20 px-4 ${darkMode ? 'bg-white/[0.02]' : 'bg-white'}`}>
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-black mb-4">
                            How It <span className="gradient-text">Works</span>
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8">
                        {steps.map((s, i) => (
                            <div key={i} className="relative text-center">
                                <div className={`text-6xl font-black mb-4 ${darkMode ? 'text-white/5' : 'text-gray-100'}`}>{s.step}</div>
                                <h3 className={`text-lg font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{s.title}</h3>
                                <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{s.desc}</p>
                                {i < 3 && <div className={`hidden md:block absolute top-8 -right-4 w-8 text-2xl ${darkMode ? 'text-gray-700' : 'text-gray-300'}`}>→</div>}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Demo */}
            <section id="demo" className="py-20 px-4">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-5xl font-black mb-4">
                            Live <span className="gradient-text">Demo</span>
                        </h2>
                        <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            See how PII detection and sanitization works in real-time.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className={`p-6 rounded-2xl ${darkMode ? 'bg-red-500/5 border border-red-500/20' : 'bg-red-50 border border-red-200'}`}>
                            <div className="flex items-center space-x-2 mb-4">
                                <HiEye className="w-5 h-5 text-red-400" />
                                <h3 className="font-bold text-red-400">Original (Contains PII)</h3>
                            </div>
                            <pre className={`text-sm leading-relaxed whitespace-pre-wrap font-mono ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                {demoInput}
                            </pre>
                        </div>

                        <div className={`p-6 rounded-2xl ${darkMode ? 'bg-green-500/5 border border-green-500/20' : 'bg-green-50 border border-green-200'}`}>
                            <div className="flex items-center space-x-2 mb-4">
                                <HiCheckCircle className="w-5 h-5 text-green-400" />
                                <h3 className="font-bold text-green-400">Sanitized (PII Removed)</h3>
                            </div>
                            <pre className={`text-sm leading-relaxed whitespace-pre-wrap font-mono ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                {demoOutput}
                            </pre>
                        </div>
                    </div>

                    <div className="text-center mt-8">
                        <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                            Detected: <span className="text-cyan-400 font-semibold">5 PII items</span> — Name, Aadhaar, Email, Phone, PAN
                        </p>
                    </div>
                </div>
            </section>

            {/* Supported Formats */}
            <section className={`py-20 px-4 ${darkMode ? 'bg-white/[0.02]' : 'bg-white'}`}>
                <div className="max-w-5xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-black mb-8">
                        Supported <span className="gradient-text">File Formats</span>
                    </h2>
                    <div className="flex flex-wrap justify-center gap-3">
                        {['PDF', 'DOCX', 'CSV', 'JSON', 'SQL', 'TXT', 'JPG', 'PNG'].map(fmt => (
                            <div key={fmt} className={`px-5 py-3 rounded-xl font-mono font-bold text-sm ${darkMode ? 'bg-white/5 border border-white/10 text-cyan-400' : 'bg-gray-100 border border-gray-200 text-blue-600'}`}>
                                .{fmt.toLowerCase()}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <div className={`p-12 rounded-3xl ${darkMode ? 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-white/5' : 'bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100'}`}>
                        <h2 className="text-3xl md:text-4xl font-black mb-4">
                            Ready to Secure Your Data?
                        </h2>
                        <p className={`text-lg mb-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Start detecting and sanitizing PII from your files today.
                        </p>
                        <Link to={user ? '/dashboard' : '/login'} className="inline-flex items-center px-8 py-4 text-lg font-bold text-white rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 transition-all shadow-2xl shadow-blue-500/25 group">
                            <span>{user ? 'Open Dashboard' : 'Get Started Free'}</span>
                            <HiArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Link>

                        <div className="mt-8 flex flex-wrap justify-center gap-6">
                            <div className="flex items-center space-x-2">
                                <HiCheckCircle className="w-5 h-5 text-green-400" />
                                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>No credit card required</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <HiCheckCircle className="w-5 h-5 text-green-400" />
                                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>RBAC built-in</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <HiCheckCircle className="w-5 h-5 text-green-400" />
                                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Full audit logs</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className={`py-8 px-4 border-t ${darkMode ? 'border-white/5 text-gray-600' : 'border-gray-200 text-gray-400'}`}>
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-center space-x-2 mb-4 md:mb-0">
                        <HiShieldCheck className="w-5 h-5 text-cyan-500" />
                        <span className="font-bold">Tribastion</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                        <HiCode className="w-4 h-4" />
                        <span>Built for Hackathon 2026</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
