
import React from 'react';

const EmphasisAudit = ({ audit }) => {
    if (!audit) return null;

    const { is_aligned, insight, stated_intent, actual_obsession } = audit;

    if (is_aligned) {
        return (
            <div className="mb-8 border border-green-500/20 bg-green-500/5 rounded-lg p-6 flex items-start space-x-4 animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-green-500 text-lg">✓</span>
                </div>
                <div>
                    <h4 className="font-sans font-bold uppercase tracking-widest text-xs text-green-500 mb-2">
                        Focus Aligned with Strategy
                    </h4>
                    <p className="font-serif text-white/80 text-sm leading-relaxed">
                        {insight || "Your verbal emphasis perfectly matches your stated goals. No subconscious drift detected."}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="mb-10 border border-yellow-500 bg-yellow-500/10 rounded-lg p-6 relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-700">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <svg className="w-24 h-24 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-3.25L12 10.5l-2.5-2.75L12 11zm0 2.5l-5-2.5 5 2.5 5-2.5-5 2.5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
            </div>

            <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-4">
                    <span className="text-2xl">⚠️</span>
                    <h4 className="font-sans font-bold uppercase tracking-widest text-sm text-yellow-500">
                        Subconscious Focus Detected
                    </h4>
                </div>

                <div className="pl-2 border-l-2 border-yellow-500/30 mb-6">
                    <p className="font-serif text-white/90 text-base md:text-lg leading-relaxed italic">
                        "{insight}"
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                    <div className="bg-gray-900/50 p-3 rounded border border-white/5">
                        <span className="block text-white/40 uppercase tracking-wider mb-1">Stated Goal</span>
                        <span className="text-white font-bold">{stated_intent}</span>
                    </div>
                    <div className="bg-yellow-500/10 p-3 rounded border border-yellow-500/20">
                        <span className="block text-yellow-500/60 uppercase tracking-wider mb-1">Actual Obsession</span>
                        <span className="text-yellow-500 font-bold">{actual_obsession}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmphasisAudit;
