import React from 'react';
import { motion } from 'framer-motion';

const SanitizationCards = ({ selectedMethod, onSelect }) => {
    const methods = [
        {
            id: 'redaction',
            title: 'Redaction',
            description: 'Completely replaces sensitive data with a secure [REDACTED] tag.',
            icon: '⬛'
        },
        {
            id: 'masking',
            title: 'Data Masking',
            description: 'Partially obscures characters (e.g. XXXX XXXX 1234) while preserving length and shape.',
            icon: '👁️‍🗨️'
        },
        {
            id: 'tokenization',
            title: 'Tokenization',
            description: 'Substitutes formatted identifiers (e.g. <NAME_TOKEN_1>) for reversible analytics.',
            icon: '🔑'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
            {methods.map((method) => {
                const isSelected = selectedMethod === method.id;

                return (
                    <motion.div
                        key={method.id}
                        onClick={() => onSelect(method.id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`
                            relative cursor-pointer rounded-2xl p-6 overflow-hidden transition-all duration-300
                            ${isSelected
                                ? 'bg-[#0F172A] border-2 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                                : 'bg-[#0F172A]/50 border border-slate-700 hover:border-cyan-400/50'}
                        `}
                    >
                        {/* Selected overlay glow */}
                        {isSelected && (
                            <div className="absolute inset-0 bg-cyan-400/5 pointer-events-none" />
                        )}

                        <div className="text-3xl mb-4">{method.icon}</div>
                        <h3 className={`text-xl font-bold mb-2 ${isSelected ? 'text-cyan-300' : 'text-slate-300'}`}>
                            {method.title}
                        </h3>
                        <p className={`text-sm ${isSelected ? 'text-cyan-100/80' : 'text-slate-400'}`}>
                            {method.description}
                        </p>
                    </motion.div>
                );
            })}
        </div>
    );
};

export default SanitizationCards;
