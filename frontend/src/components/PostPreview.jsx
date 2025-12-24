import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { generateExecutiveSuite } from '../services/gemini';
import { FaLinkedin, FaXTwitter, FaWhatsapp } from 'react-icons/fa6';

const PostPreview = ({ text, analysis, selectedPlatforms = ['twitter', 'linkedin'], t, languageName, onReset }) => {
    const [generatedPosts, setGeneratedPosts] = useState(null);
    const [editedPosts, setEditedPosts] = useState({});
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(null);
    const [showResults, setShowResults] = useState(false);
    const [minting, setMinting] = useState(null);
    const [error, setError] = useState(null);

    const textareaRefs = useRef({});

    // Auto-resize textarea
    const autoResize = (platform) => {
        const textarea = textareaRefs.current[platform];
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = textarea.scrollHeight + 'px';
        }
    };

    useEffect(() => {
        // Auto-resize all textareas when posts are generated
        if (generatedPosts) {
            Object.keys(editedPosts).forEach(platform => {
                setTimeout(() => autoResize(platform), 50);
            });
        }
    }, [generatedPosts, editedPosts]);

    const generatePosts = async () => {
        setLoading(true);
        setError(null);
        try {
            // Client-side generation using Gemini Executive Suite
            const data = await generateExecutiveSuite(text, analysis, languageName);
            setGeneratedPosts(data);

            // Map the new social_content structure to our platforms
            const initialPosts = {};
            if (data.social_content) {
                initialPosts.twitter = data.social_content.twitter_post;
                initialPosts.linkedin = data.social_content.linkedin_post;
                initialPosts.whatsapp = data.social_content.whatsapp_msg;
            }

            setEditedPosts(initialPosts);
            // Trigger fade in after a small delay
            setTimeout(() => setShowResults(true), 100);
        } catch (err) {
            console.error(err);
            setError("The transmuter encountered an error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handlePostEdit = (platform, value) => {
        setEditedPosts(prev => ({ ...prev, [platform]: value }));
        setTimeout(() => autoResize(platform), 0);
    };

    const regenerateSingle = async (platform) => {
        setLoading(true);
        try {
            // Client-side generation (variation)
            const data = await generateExecutiveSuite(text, analysis, languageName, true);
            if (data.social_content) {
                let newContent;
                switch (platform) {
                    case 'twitter': newContent = data.social_content.twitter_post; break;
                    case 'linkedin': newContent = data.social_content.linkedin_post; break;
                    case 'whatsapp': newContent = data.social_content.whatsapp_msg; break;
                }
                if (newContent) {
                    setEditedPosts(prev => ({ ...prev, [platform]: newContent }));
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = async (platform) => {
        try {
            const watermarkedText = editedPosts[platform] + "\n\n— Transmuted by GhostNote Pro";
            await navigator.clipboard.writeText(watermarkedText);
            setCopied(platform);
            setTimeout(() => setCopied(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
            alert("Please manually select and copy the text.");
        }
    };

    const mintArtifact = async (platform) => {
        setMinting(platform);

        const artifactContainer = document.createElement('div');
        artifactContainer.style.cssText = `
            position: fixed;
            left: -9999px;
            top: 0;
            width: 600px;
            padding: 48px;
            background-color: #F9F7F5;
            font-family: 'Inter', sans-serif;
        `;

        const content = document.createElement('div');
        content.innerHTML = `
            <p style="
                font-family: 'Playfair Display', serif;
                font-size: 18px;
                line-height: 1.7;
                color: #1A1A1A;
                margin: 0 0 48px 0;
                white-space: pre-wrap;
            ">${editedPosts[platform]}</p>
            <div style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding-top: 24px;
                border-top: 1px solid #E5E5E5;
            ">
                <span style="
                    font-family: 'Playfair Display', serif;
                    font-size: 12px;
                    letter-spacing: 0.2em;
                    color: #A88E65;
                ">GHOSTNOTE PRO</span>
                <span style="
                    font-size: 11px;
                    color: #999;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                ">${platformConfig[platform].name}</span>
            </div>
        `;

        artifactContainer.appendChild(content);
        document.body.appendChild(artifactContainer);

        try {
            const canvas = await html2canvas(artifactContainer, {
                backgroundColor: '#F9F7F5',
                scale: 2,
            });

            const link = document.createElement('a');
            link.download = `ghostnote-${platform}-artifact.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error('Failed to mint artifact:', err);
        } finally {
            document.body.removeChild(artifactContainer);
            setMinting(null);
        }
    };

    const platformConfig = {
        twitter: { name: 'X', maxLength: 280 },
        linkedin: { name: 'LinkedIn', maxLength: 3000 },
        whatsapp: { name: 'WhatsApp', maxLength: 1000 },
    };

    const handleShare = async (destination, content) => {
        // Platform Native Sharing Logic (LinkedIn Blocker Fix)
        if (destination === 'linkedin') {
            try {
                // 1. Copy to Clipboard
                await navigator.clipboard.writeText(content);

                // 2. Alert/Toast
                alert("LinkedIn Draft Copied! Paste it into your post.");

                // 3. Open LinkedIn Feed
                window.open('https://www.linkedin.com/feed/', '_blank');
            } catch (err) {
                console.error('Clipboard failed', err);
                // Fallback
                const text = encodeURIComponent(content);
                window.open(`https://www.linkedin.com/feed/?shareActive=true&text=${text}`, '_blank');
            }
            return;
        }

        const encodedContent = encodeURIComponent(content);
        let shareUrl = '';

        switch (destination) {
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?text=${encodedContent}`;
                break;
            case 'whatsapp':
                shareUrl = `https://wa.me/?text=${encodedContent}`;
                break;
        }

        if (shareUrl) {
            window.open(shareUrl, '_blank');
        }
    };

    // Show transcription and generate button before generation
    if (!generatedPosts) {
        return (
            <div className="space-y-12 transition-opacity duration-500">
                {/* Transcription */}
                <div className="text-center">
                    <p className="text-[#999] text-xs uppercase tracking-widest mb-4">Transcription</p>
                    <p className="text-[#F9F7F5] leading-relaxed max-w-lg mx-auto">{text}</p>
                </div>

                {/* Analysis */}
                {analysis && (
                    <div className="flex justify-center space-x-16">
                        <div className="text-center">
                            <p className="text-[#999] text-xs uppercase tracking-widest mb-2">Tone</p>
                            <p className="font-serif text-xl text-[#F9F7F5]">{analysis.tone}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[#999] text-xs uppercase tracking-widest mb-2">Score</p>
                            <p className="font-serif text-xl text-[#A88E65]">{analysis.virality_score}</p>
                        </div>
                    </div>
                )}

                {/* Generate Button */}
                <div className="flex flex-col items-center">
                    <button
                        onClick={generatePosts}
                        disabled={loading}
                        className="btn-transmute"
                    >
                        {loading ? t.processing : 'GENERATE POSTS'}
                    </button>
                    {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}
                </div>
            </div>
        );
    }

    // Show result cards after generation
    return (
        <div className={`transition-all duration-700 ${showResults ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {/* New Note Button */}
            <div className="mb-8">
                <button
                    onClick={onReset}
                    className="flex items-center space-x-2 text-[#999] hover:text-[#F9F7F5] transition-colors text-sm"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span>New Note</span>
                </button>
            </div>

            {selectedPlatforms.map(platform => {
                const config = platformConfig[platform];
                if (!config) return null;

                const charCount = editedPosts[platform]?.length || 0;
                const isOverLimit = charCount > config.maxLength;

                return (
                    <div key={platform} className="mb-16">
                        {/* Platform Label */}
                        <div className="flex justify-between items-center mb-4">
                            <p className="text-[#999] text-xs uppercase tracking-widest">{config.name}</p>
                            <span className={`text-xs ${isOverLimit ? 'text-red-500' : 'text-[#999]'}`}>
                                {charCount} / {config.maxLength}
                            </span>
                        </div>

                        {/* The Paper Card */}
                        <div className="bg-white w-full max-w-2xl mx-auto rounded-sm shadow-[0_20px_40px_-15px_rgba(168,142,101,0.1)] p-10 md:p-14">
                            <textarea
                                role="textbox"
                                ref={el => textareaRefs.current[platform] = el}
                                value={editedPosts[platform] || ''}
                                onChange={(e) => handlePostEdit(platform, e.target.value)}
                                className={`w-full font-sans text-lg md:text-xl leading-relaxed text-[#1A1A1A] bg-transparent outline-none resize-none overflow-hidden focus:ring-1 focus:ring-[#A88E65] rounded px-2 py-1 ${isOverLimit ? 'text-red-600' : ''
                                    }`}
                                placeholder={`Your ${config.name} post...`}
                                rows={1}
                            />
                        </div>

                        {/* Action Bar */}
                        <div className="flex justify-center items-center gap-12 mt-8">
                            {/* COPY */}
                            <button
                                onClick={() => copyToClipboard(platform)}
                                aria-label="Copy to clipboard"
                                className="flex items-center space-x-2 font-medium text-xs uppercase tracking-widest text-[#A88E65] hover:text-[#F9F7F5] transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                <span>{copied === platform ? 'COPIED' : 'COPY'}</span>
                            </button>

                            {/* MINT ARTIFACT */}
                            <button
                                onClick={() => mintArtifact(platform)}
                                disabled={minting === platform}
                                aria-label="Mint Artifact"
                                className="flex items-center space-x-2 font-medium text-xs uppercase tracking-widest text-[#A88E65] hover:text-[#1A1A1A] transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span>{minting === platform ? 'MINTING...' : 'MINT ARTIFACT'}</span>
                            </button>

                            {/* RETRY (Icon only) */}
                            <button
                                onClick={() => regenerateSingle(platform)}
                                disabled={loading}
                                className="p-2 text-gray-300 hover:text-[#A88E65] transition-colors"
                                title="Generate different variation"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>
                        </div>

                        {/* Share Row */}
                        <div className="flex justify-center items-center gap-6 mt-6">
                            <button
                                onClick={() => handleShare('linkedin', editedPosts[platform])}
                                className="opacity-60 hover:opacity-100 text-[#999] hover:text-[#A88E65] transition-all"
                                title="Share to LinkedIn"
                            >
                                <FaLinkedin size={20} />
                            </button>
                            <button
                                onClick={() => handleShare('twitter', editedPosts[platform])}
                                className="opacity-60 hover:opacity-100 text-[#999] hover:text-[#A88E65] transition-all"
                                title="Share to X"
                            >
                                <FaXTwitter size={20} />
                            </button>
                            <button
                                onClick={() => handleShare('whatsapp', editedPosts[platform])}
                                className="opacity-60 hover:opacity-100 text-[#999] hover:text-[#A88E65] transition-all"
                                title="Share to WhatsApp"
                            >
                                <FaWhatsapp size={20} />
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default PostPreview;
