import React, { useState } from 'react';
import ShareActions from './ShareActions';
import PaywallModal from './PaywallModal';
import { generateExecutiveSuite } from '../services/gemini';

const ResultCard = ({ text, analysis, languageName, onReset, isPro }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('scribe');
    const [showPaywall, setShowPaywall] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await generateExecutiveSuite(text, analysis, languageName);
            setData(result);
        } catch (err) {
            console.error(err);
            setError("The transmuter encountered an error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!data) {
        return (
            <div className="space-y-12 transition-opacity duration-500 fade-in">
                {/* Transcription */}
                <div className="text-center">
                    <p className="text-[#999] text-xs uppercase tracking-widest mb-4">Transcription</p>
                    <p className="text-[#F9F7F5] leading-relaxed max-w-lg mx-auto whitespace-pre-wrap">{text}</p>
                </div>

                {/* Analysis */}
                {analysis && (
                    <div className="flex justify-center space-x-16">
                        <div className="text-center">
                            <p className="text-[#999] text-xs uppercase tracking-widest mb-2">Tone</p>
                            <p className="font-serif text-xl text-[#F9F7F5]">{analysis.tone}</p>
                        </div>
                    </div>
                )}

                {/* Generate Button */}
                <div className="flex flex-col items-center">
                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="btn-transmute"
                    >
                        {loading ? 'TRANSMUTING...' : 'GENERATE EXECUTIVE SUITE'}
                    </button>
                    {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}
                </div>
            </div>
        );
    }

    // Results View
    const tabs = [
        { id: 'scribe', label: 'The Scribe (Free)' },
        { id: 'strategist', label: 'The Strategist (Pro)' }
    ];

    const getTabContent = (id) => {
        if (!data) return "Initializing...";

        if (id === 'scribe') {
            const { free_tier } = data;
            return (
                <div className="space-y-12 animate-in fade-in duration-700">
                    <div>
                        <h4 className="text-[#A88E65] text-[10px] uppercase tracking-[0.3em] font-bold mb-6 opacity-60">Core Thesis</h4>
                        <div className="prose prose-lg max-w-none font-serif text-[#1A1A1A] leading-relaxed italic text-xl">
                            "{free_tier.core_thesis}"
                        </div>
                    </div>

                    {free_tier.strategic_pillars && free_tier.strategic_pillars.length > 0 && (
                        <div>
                            <h4 className="text-[#A88E65] text-[10px] uppercase tracking-[0.3em] font-bold mb-6 opacity-60">Strategic Pillars</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {free_tier.strategic_pillars.map((pillar, idx) => (
                                    <div key={idx} className="border-l border-[#A88E65]/20 pl-6 py-2">
                                        <h5 className="font-sans font-bold text-[#1A1A1A] text-sm uppercase tracking-wider mb-2">{pillar.title}</h5>
                                        <p className="text-gray-600 text-sm leading-relaxed">{pillar.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {free_tier.tactical_steps && free_tier.tactical_steps.length > 0 && (
                        <div>
                            <h4 className="text-[#A88E65] text-[10px] uppercase tracking-[0.3em] font-bold mb-6 opacity-60">Tactical Steps</h4>
                            <ul className="space-y-4">
                                {free_tier.tactical_steps.map((step, idx) => (
                                    <li key={idx} className="flex items-start text-[#1A1A1A] text-sm font-sans group">
                                        <span className="mr-4 w-6 h-6 rounded-full bg-[#A88E65]/5 flex items-center justify-center text-[#A88E65] text-[10px] font-bold border border-[#A88E65]/10 group-hover:bg-[#A88E65] group-hover:text-white transition-all">
                                            {idx + 1}
                                        </span>
                                        <span className="flex-1 pt-0.5">{step}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            );
        }

        if (id === 'strategist') {
            const { pro_tier } = data;

            return (
                <div className="relative">
                    {/* Locked State for Free Users */}
                    {!isPro && (
                        <div className="absolute inset-x-0 -top-4 -bottom-4 z-20 flex flex-col items-center justify-center bg-white/40 backdrop-blur-md rounded-xl p-8 text-center border border-[#A88E65]/10 shadow-2xl">
                            <div className="w-16 h-16 rounded-full bg-[#1A1A1A] flex items-center justify-center mb-6 shadow-xl">
                                <span className="text-2xl">🔒</span>
                            </div>
                            <h3 className="font-serif text-2xl text-[#1A1A1A] mb-4">Unlock The Strategist</h3>
                            <p className="text-gray-600 text-sm max-w-xs mb-8 leading-relaxed">
                                Get executive-grade judgment, recursive risk audits, and ready-to-send execution assets.
                            </p>
                            <button
                                onClick={() => setShowPaywall(true)}
                                className="bg-[#A88E65] text-[#1A1A1A] px-8 py-3 rounded-full text-xs font-bold tracking-widest uppercase hover:bg-[#8F7650] transition-all transform hover:scale-105"
                            >
                                Upgrade to Pro
                            </button>
                        </div>
                    )}

                    <div className={`space-y-12 transition-all duration-700 ${!isPro ? 'blur-md select-none opacity-40 grayscale-[0.5]' : 'animate-in fade-in'}`}>
                        <div className="bg-[#1A1A1A] text-white p-8 md:p-12 rounded-sm border border-[#A88E65]/30 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 opacity-10">
                                <svg className="w-24 h-24 text-[#A88E65]" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
                                </svg>
                            </div>
                            <h4 className="text-[#A88E65] text-[10px] uppercase tracking-[0.3em] font-bold mb-8">Executive Judgement</h4>
                            <div className="font-serif text-2xl md:text-3xl leading-snug text-white/95 mb-4">
                                {pro_tier.executive_judgement}
                            </div>
                        </div>

                        <div>
                            <h4 className="text-red-900/40 text-[10px] uppercase tracking-[0.3em] font-bold mb-6">Risk Audit (The Blind Spot)</h4>
                            <div className="bg-red-50/50 border border-red-100 p-8 rounded-sm text-red-900 text-base font-serif italic leading-relaxed">
                                {pro_tier.risk_audit}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div>
                                <h4 className="text-[#A88E65] text-[10px] uppercase tracking-[0.3em] font-bold mb-6">Execution Asset: Email</h4>
                                <div className="border border-gray-100 p-6 rounded-sm bg-gray-50/50">
                                    <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">Subject</p>
                                    <p className="font-sans font-bold text-[#1A1A1A] text-sm mb-4">{pro_tier.email_draft.subject}</p>
                                    <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">Body</p>
                                    <p className="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed">{pro_tier.email_draft.body}</p>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-[#A88E65] text-[10px] uppercase tracking-[0.3em] font-bold mb-6">30-Day Action Plan</h4>
                                <div className="space-y-4">
                                    {pro_tier.action_plan.map((item, idx) => (
                                        <div key={idx} className="flex items-center space-x-3 text-sm text-[#1A1A1A] border-b border-gray-50 pb-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#A88E65]"></div>
                                            <span>{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
        return "No content available.";
    };

    const getTextToShare = () => {
        if (!data) return "";
        if (activeTab === 'scribe') {
            const { free_tier } = data;
            return `TRANSCRIPT SYNTHESIS: ${free_tier.core_thesis}\n\nNEXT STEPS:\n${(free_tier.tactical_steps || []).map(s => `- ${s}`).join('\n')}`;
        }
        if (activeTab === 'strategist' && isPro) {
            const { pro_tier } = data;
            return `EXECUTIVE JUDGEMENT: ${pro_tier.executive_judgement}\n\nRISK AUDIT: ${pro_tier.risk_audit}`;
        }
        return "";
    };

    return (
        <div className="card-container fade-in">
            {/* New Session Button */}
            <div className="mb-8 flex justify-between items-center px-4">
                <button
                    onClick={onReset}
                    className="flex items-center space-x-2 text-[#999] hover:text-[#A88E65] transition-all text-[11px] uppercase tracking-[0.2em]"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span>New Session</span>
                </button>

                <div className="text-[11px] uppercase tracking-[0.2em] text-[#A88E65] font-bold">
                    {isPro ? "Executive Status: Pro" : "Executive Status: Standard"}
                </div>
            </div>

            {/* The Main Card */}
            <div className="bg-white w-full max-w-4xl mx-auto rounded-sm shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] overflow-hidden border border-gray-100">

                {/* Tab Bar */}
                <div className="flex border-b border-gray-50 bg-gray-50/30">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 py-6 text-[11px] font-bold uppercase tracking-[0.3em] transition-all relative ${activeTab === tab.id
                                ? 'text-[#1A1A1A] bg-white'
                                : 'text-gray-400 hover:text-gray-600 bg-transparent'
                                }`}
                        >
                            {tab.label}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#A88E65]"></div>
                            )}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="p-10 md:p-20 min-h-[500px] bg-white">
                    {getTabContent(activeTab)}
                </div>
            </div>

            {/* Share Actions */}
            <ShareActions
                textToShare={getTextToShare()}
                analysisResult={data}
                url={window.location.href}
                isPro={isPro}
                onPaywallTrigger={() => setShowPaywall(true)}
            />

            {/* Paywall Modal */}
            {showPaywall && (
                <PaywallModal
                    onClose={() => setShowPaywall(false)}
                    scenario="upsell"
                />
            )}
        </div>
    );
};

export default ResultCard;
