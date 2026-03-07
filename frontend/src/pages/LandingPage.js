import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
    HiShieldCheck, HiLockClosed, HiDocumentSearch,
    HiCloudUpload, HiDatabase, HiCode,
    HiArrowRight, HiOutlineShieldExclamation,
    HiOutlineClipboardCheck, HiOutlineDownload,
    HiOutlineColorSwatch, HiOutlineTag
} from 'react-icons/hi';
import CyberGlobe from '../components/CyberGlobe';

export default function LandingPage() {
    const { user } = useAuth();

    const features = [
        { icon: HiDocumentSearch, title: 'PII Detection', desc: 'Enterprise-grade NLP and Regex to instantly identify names, emails, IPs, cards, and more.' },
        { icon: HiOutlineColorSwatch, title: 'Redaction Engine', desc: 'Draw persistent black bars over sensitive data across PDF layers and document text.' },
        { icon: HiOutlineShieldExclamation, title: 'Masking Engine', desc: 'Intelligently obfuscate partial strings (e.g. XXXX-XXXX-1234) while preserving format.' },
        { icon: HiOutlineTag, title: 'Tokenization System', desc: 'Replace real data with mathematically consistent tokens (<NAME_1>) for analytics.' },
        { icon: HiCloudUpload, title: 'Multi Format Support', desc: 'Securely process CSV, JSON, PDF, DOCX, TXT, and Images in a single seamless pipeline.' },
        { icon: HiDatabase, title: 'Audit Logging', desc: 'Immutable trail of exact sanitization events, maintaining rigid compliance standards.' },
    ];

    const benefits = [
        { title: 'Protect Sensitive Data', desc: 'Prevent catastrophic data exposures before they leave your internal network.', icon: HiShieldCheck },
        { title: 'Automate Compliance', desc: 'Meet GDPR, HIPAA, and CCPA standards automatically upon file ingestion.', icon: HiOutlineClipboardCheck },
        { title: 'Prevent Data Leaks', desc: 'Lock down unstructured text assets seamlessly with AI-driven blinders.', icon: HiLockClosed },
        { title: 'Secure Document Sharing', desc: 'Safely distribute sanitized datasets to third parties and analysts.', icon: HiOutlineDownload },
    ];

    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    return (
        <div className="min-h-screen bg-transparent text-cyan-50 font-mono pb-0 relative overflow-x-hidden">
            {/* 1. HERO SECTION */}
            <section className="relative pt-32 pb-20 px-4 min-h-[90vh] flex items-center justify-center">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
                    <motion.div
                        initial="hidden" animate="visible" variants={staggerContainer}
                        className="text-left"
                    >
                        <motion.div variants={fadeInUp} className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-900/20 text-cyan-400 mb-6 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                            <HiShieldCheck className="w-5 h-5 animate-pulse" />
                            <span className="text-sm font-bold tracking-widest uppercase">System Initialization Complete</span>
                        </motion.div>

                        <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-black leading-tight mb-6 drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                            AI Powered <br />
                            <span className="text-cyan-400">PII Protection</span> <br />
                            Platform
                        </motion.h1>

                        <motion.p variants={fadeInUp} className="text-lg md:text-xl mb-10 text-cyan-100/70 max-w-xl leading-relaxed">
                            Automatically detect, mask, and tokenize sensitive information from documents. Secure your enterprise data pipeline with military-grade precision.
                        </motion.p>

                        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center gap-6">
                            <Link to={user ? '/dashboard/upload' : '/login'} className="w-full sm:w-auto px-8 py-4 text-center font-black uppercase tracking-widest text-[#020617] bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.6)] hover:shadow-[0_0_35px_rgba(6,182,212,0.8)] hover:-translate-y-1 relative group overflow-hidden">
                                <span className="relative z-10">Upload Document</span>
                                <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                            </Link>
                            <a href="#features" className="w-full sm:w-auto px-8 py-4 text-center font-bold uppercase tracking-widest rounded-xl border-2 border-cyan-500/50 text-cyan-300 hover:bg-cyan-900/30 hover:border-cyan-400 transition-all shadow-[0_0_15px_rgba(6,182,212,0.1)] hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                                View Features
                            </a>
                        </motion.div>
                    </motion.div>

                    {/* Cyber Security Visual */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="relative h-[400px] lg:h-[600px] w-full flex items-center justify-center -mr-10"
                    >
                        <div className="absolute inset-0 bg-cyan-500/5 rounded-full blur-[100px] animate-pulse"></div>
                        <CyberGlobe />
                    </motion.div>
                </div>
            </section>

            {/* 2. FEATURES SECTION */}
            <section id="features" className="py-24 px-4 bg-[#060c21]/80 backdrop-blur-md relative border-t border-cyan-900/50 shadow-[0_-10px_30px_rgba(6,182,212,0.05)]">
                <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #06b6d4 1px, transparent 1px), linear-gradient(to bottom, #06b6d4 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

                <div className="max-w-7xl mx-auto relative z-10">
                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-5xl font-black mb-4 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
                            Core <span className="text-cyan-400">Architecture</span>
                        </h2>
                        <p className="text-lg max-w-2xl mx-auto text-cyan-200/60 uppercase tracking-widest">
                            Advanced modules for comprehensive data sanitization.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, i) => (
                            <motion.div
                                key={i}
                                initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
                                variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1, transition: { delay: i * 0.1 } } }}
                                className="group p-8 rounded-2xl bg-[#0F172A]/80 backdrop-blur-sm border border-cyan-500/10 hover:border-cyan-400/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(6,182,212,0.15)] relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-bl-[100px] transition-all group-hover:bg-cyan-500/20 group-hover:scale-110"></div>
                                <div className="w-14 h-14 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(6,182,212,0.2)] group-hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-shadow">
                                    <feature.icon className="w-7 h-7 text-cyan-400" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-cyan-100 tracking-wide">{feature.title}</h3>
                                <p className="text-sm leading-relaxed text-cyan-300/60">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 3. HOW IT WORKS SECTION */}
            <section id="how-it-works" className="py-24 px-4 relative">
                <div className="max-w-7xl mx-auto relative z-10">
                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
                        className="text-center mb-20"
                    >
                        <h2 className="text-3xl md:text-5xl font-black mb-4 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
                            Execution <span className="text-cyan-400">Flow</span>
                        </h2>
                    </motion.div>

                    <div className="grid md:grid-cols-4 gap-8 relative">
                        {/* Connecting line for desktop */}
                        <div className="hidden md:block absolute top-[60px] left-[10%] right-[10%] h-0.5 bg-cyan-900/50">
                            <div className="absolute top-0 left-0 h-full bg-cyan-400 w-1/4 animate-[slideRight_3s_ease-in-out_infinite]"></div>
                        </div>

                        {[
                            { step: '01', title: 'Upload Document', desc: 'Securely transfer raw files via encrypted drag-and-drop protocols.', icon: HiCloudUpload },
                            { step: '02', title: 'Detect Sensitive Data', desc: 'Neural engines scan and isolate personal identifiers natively.', icon: HiDocumentSearch },
                            { step: '03', title: 'Choose Method', desc: 'Specify Redaction, Masking, or Tokenization logic for the payload.', icon: HiOutlineColorSwatch },
                            { step: '04', title: 'Download Secure File', desc: 'Retrieve the mathematically sanitized, format-preserved output.', icon: HiOutlineDownload },
                        ].map((s, i) => (
                            <motion.div
                                key={i}
                                initial="hidden" whileInView="visible" viewport={{ once: true }}
                                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { delay: i * 0.2 } } }}
                                className="relative text-center group"
                            >
                                <div className="w-32 h-32 mx-auto rounded-full bg-[#0F172A] border-2 border-cyan-800 flex items-center justify-center mb-8 relative group-hover:border-cyan-400 transition-colors shadow-[0_0_20px_rgba(6,182,212,0.05)] group-hover:shadow-[0_0_30px_rgba(6,182,212,0.2)]">
                                    <h1 className="absolute -top-4 -right-2 text-6xl font-black text-cyan-900/30 group-hover:text-cyan-800/50 transition-colors pointer-events-none">{s.step}</h1>
                                    <s.icon className="w-12 h-12 text-cyan-500 group-hover:text-cyan-300 transition-colors" />
                                </div>
                                <h3 className="text-lg font-bold mb-3 text-cyan-100 uppercase tracking-widest">{s.title}</h3>
                                <p className="text-sm text-cyan-300/60 leading-relaxed max-w-[250px] mx-auto">{s.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. PLATFORM BENEFITS SECTION */}
            <section className="py-24 px-4 bg-[#060c21]/80 backdrop-blur-md relative border-t border-cyan-900/50">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-5xl font-black mb-4 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
                            System <span className="text-cyan-400">Benefits</span>
                        </h2>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {benefits.map((b, i) => (
                            <motion.div
                                key={i}
                                initial="hidden" whileInView="visible" viewport={{ once: true }}
                                variants={fadeInUp}
                                className="flex items-start space-x-6 p-8 rounded-2xl bg-gradient-to-br from-[#0F172A] to-[#020617] border border-cyan-500/20 hover:border-cyan-400/60 transition-all shadow-[0_0_15px_rgba(6,182,212,0.05)] hover:shadow-[0_0_25px_rgba(6,182,212,0.15)] group"
                            >
                                <div className="p-4 rounded-xl bg-cyan-950 border border-cyan-800 group-hover:bg-cyan-900/80 transition-colors shrink-0">
                                    <b.icon className="w-8 h-8 text-cyan-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-cyan-50 mb-2 uppercase tracking-wide">{b.title}</h3>
                                    <p className="text-cyan-200/60 leading-relaxed text-sm">{b.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. FOOTER */}
            <footer className="relative pt-16 pb-8 px-4 bg-[#020617] border-t border-cyan-500/30 overflow-hidden">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent shadow-[0_0_20px_#22d3ee]"></div>

                <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-10 mb-12 relative z-10">
                    <div className="md:col-span-2">
                        <Link to="/" className="flex items-center space-x-2 group mb-6">
                            <HiShieldCheck className="w-8 h-8 text-cyan-400 group-hover:scale-110 transition-transform drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                            <span className="text-2xl font-black tracking-widest text-cyan-50">
                                TRI<span className="text-cyan-400">BASTION</span>
                            </span>
                        </Link>
                        <p className="text-sm text-cyan-400/50 max-w-sm leading-relaxed">
                            Fortifying digital perimeters with automated, AI-driven PII redaction and format-preserving sanitization algorithms.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold text-cyan-200 mb-6 uppercase tracking-widest text-sm">Navigation</h4>
                        <ul className="space-y-4 text-sm text-cyan-400/60">
                            <li><a href="#features" className="hover:text-cyan-300 transition-colors">Core Architecture</a></li>
                            <li><a href="#how-it-works" className="hover:text-cyan-300 transition-colors">Execution Flow</a></li>
                            <li><Link to="/login" className="hover:text-cyan-300 transition-colors">System Access</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-cyan-200 mb-6 uppercase tracking-widest text-sm">System Links</h4>
                        <ul className="space-y-4 text-sm text-cyan-400/60">
                            <li><a href="https://github.com/aleenaa06/Tribastion" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-300 transition-colors flex items-center space-x-2"><HiCode className="w-4 h-4" /> <span>Source Code</span></a></li>
                            <li><span className="hover:text-cyan-300 transition-colors cursor-pointer border-b border-cyan-800 border-dashed">Contact Dispatch</span></li>
                        </ul>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto text-center border-t border-cyan-900/50 pt-8 relative z-10">
                    <p className="text-xs text-cyan-500/40 uppercase tracking-widest">
                        © 2026 Tribastion Security Systems. All strict protocols enforced.
                    </p>
                </div>
            </footer>
        </div>
    );
}
