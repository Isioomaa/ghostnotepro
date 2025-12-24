import React, { useState } from 'react';
import ShareActions from './ShareActions';
import { generateExecutiveSuite } from '../services/gemini';

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
            {/* New Session Button */}
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
            </div>

            {/* The Main Card */}
            <div className="bg-white w-full max-w-3xl mx-auto rounded-sm shadow-[0_20px_40px_-15px_rgba(168,142,101,0.1)] overflow-hidden">

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
