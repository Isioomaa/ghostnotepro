import React, { useState } from 'react';
import ShareActions from './ShareActions';
import { generateExecutiveSuite } from '../services/gemini';
import { isPro } from '../utils/usageTracker';

const ResultCard = ({ text, analysis, languageName, onReset }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('strategy');

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
        { id: 'strategy', label: 'Strategy' },
        { id: 'email_draft', label: 'Team Email' },
        { id: 'action_plan', label: 'Action Plan' }
    ];

    const currentContent = data[activeTab] || "No content available.";

    // Helper to get text for sharing
    const getTextToShare = () => {
        return currentContent;
    };

    return (
        <div className="card-container fade-in">
            {/* New Session Button and Confidence Badge */}
            <div className="mb-6 flex justify-between items-center">
                <button
                    onClick={onReset}
                    className="flex items-center space-x-2 text-[#999] hover:text-[#F9F7F5] transition-colors text-sm"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span>New Session</span>
                </button>

                {/* Confidence Badge */}
                {data.confidence_analysis && (
                    <div className="relative group">
                        {isPro() ? (
                            // Pro users see actual confidence badge
                            data.confidence_analysis.level === 'High' ? (
                                <div className="flex items-center space-x-2 bg-green-50 border border-green-200 text-green-700 px-3 py-1.5 rounded-full text-xs font-medium">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span>High Confidence</span>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center space-x-2 bg-yellow-50 border border-yellow-300 text-yellow-800 px-3 py-1.5 rounded-full text-xs font-medium cursor-help">
                                        <span>⚠️</span>
                                        <span>Potential Ambiguity</span>
                                    </div>
                                    {data.confidence_analysis.clarification_question && (
                                        <div className="absolute right-0 top-full mt-2 w-64 bg-gray-900 text-white text-xs p-3 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                            <p className="font-semibold mb-1">Clarification Needed:</p>
                                            <p>{data.confidence_analysis.clarification_question}</p>
                                            {data.confidence_analysis.reason && (
                                                <p className="mt-2 text-gray-300 italic text-[10px]">Reason: {data.confidence_analysis.reason}</p>
                                            )}
                                        </div>
                                    )}
                                </>
                            )
                        ) : (
                            // Free users see locked badge
                            <div className="flex items-center space-x-2 bg-gray-100 border border-gray-300 text-gray-500 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer hover:bg-gray-200 transition-colors">
                                <span>🔒</span>
                                <span>Confidence Analysis</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* The Main Card */}
            <div className="bg-white w-full max-w-3xl mx-auto rounded-sm shadow-[0_20px_40px_-15px_rgba(168,142,101,0.1)] overflow-hidden">


                {/* Confidence Signal - AI Interpretation */}
                {data.interpreted_context && (
                    <div className="relative overflow-hidden">
                        <div className={`bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100 px-8 py-4 transition-all duration-500 ${!isPro() ? 'blur-sm select-none grayscale-[0.5]' : ''}`}>
                            <div className="flex items-start space-x-3">
                                <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <div className="flex-1">
                                    <p className="text-green-800 text-xs uppercase tracking-widest font-semibold mb-1">Context Detected</p>
                                    <p className="text-green-900 text-sm font-sans leading-relaxed">{data.interpreted_context}</p>

                                    {/* Transparency - Collapsible Thought Trace */}
                                    {data.thought_trace && data.thought_trace.length > 0 && (
                                        <details className="mt-3 group">
                                            <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-700 transition-colors list-none flex items-center space-x-1">
                                                <span className="group-open:rotate-90 transition-transform inline-block">▸</span>
                                                <span>✨ View detected key concepts</span>
                                            </summary>
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {data.thought_trace.map((concept, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="inline-block bg-white border border-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full"
                                                    >
                                                        {concept}
                                                    </span>
                                                ))}
                                            </div>
                                        </details>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Lock Overlay for Free Users */}
                        {!isPro() && (
                            <div className="absolute inset-0 z-10 flex items-center justify-center bg-transparent backdrop-blur-[1px]">
                                <div className="bg-[#1A1A1A]/80 border border-[#A88E65]/30 px-4 py-2 rounded-full flex items-center space-x-2 shadow-xl">
                                    <span className="text-[#A88E65] text-xs">🔒</span>
                                    <span className="text-white text-[10px] font-medium tracking-wide uppercase">Upgrade to unlock executive confidence analysis</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}


                {/* Tab Bar */}
                <div className="flex border-b border-gray-100 flex-wrap">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 py-4 text-sm font-medium uppercase tracking-widest transition-all ${activeTab === tab.id
                                ? 'bg-[#F9F7F5] text-[#A88E65] border-b-2 border-[#A88E65]'
                                : 'bg-white text-[#999] hover:text-[#1A1A1A]'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="p-10 md:p-14 min-h-[400px] bg-white">
                    <div className="prose prose-lg max-w-none font-serif text-[#1A1A1A] leading-relaxed whitespace-pre-wrap">
                        {currentContent}
                    </div>
                </div>

                {/* Strategic Gaps Section */}
                {data.clarifying_questions && data.clarifying_questions.length > 0 && (
                    <div className="bg-[#FFFBF0] p-8 border-t border-[#F0E6D2]">
                        <h4 className="text-[#A88E65] text-xs uppercase tracking-widest font-bold mb-4 flex items-center">
                            <span className="mr-2 text-lg">⚠️</span> Strategic Gaps
                        </h4>
                        <ul className="space-y-3">
                            {data.clarifying_questions.map((q, idx) => (
                                <li key={idx} className="flex items-start text-[#5A5A5A] text-sm md:text-base font-sans leading-relaxed">
                                    <span className="mr-2 text-[#A88E65]">•</span>
                                    {q}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Share Actions */}
            <ShareActions
                textToShare={getTextToShare()}
                analysisResult={data}
                url={window.location.href}
            />
        </div>
    );
};

export default ResultCard;
