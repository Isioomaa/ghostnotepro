import React, { useState } from 'react';
import { FaLinkedin, FaXTwitter, FaWhatsapp, FaRegCopy } from 'react-icons/fa6';

const ShareActions = ({ textToShare, analysisResult, url = "https://ghostnotepro.com" }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(textToShare);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleLinkedIn = async () => {
        try {
            // Priority: linkedin_version from AI, then textToShare fallback
            const linkedInContent = analysisResult?.linkedin_version || textToShare;
            await navigator.clipboard.writeText(linkedInContent);

            // 2. Alert user
            alert("LinkedIn Draft Copied! Paste it into your post.");

            // 3. Open LinkedIn share 
            window.open('https://www.linkedin.com/feed/?shareActive=true', '_blank');
        } catch (err) {
            console.error('LinkedIn copy failed:', err);
            window.open('https://www.linkedin.com/feed/?shareActive=true', '_blank');
        }
    };

    const handleX = () => {
        // Priority: x_version from AI, then textToShare fallback
        let content = analysisResult?.x_version;

        if (!content && textToShare) {
            content = textToShare.substring(0, 150) + "...";
        }

        const shareText = content || "Built my strategy with GhostNote Pro.";
        const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`;
        window.open(shareUrl, '_blank');
    };

    const handleWhatsApp = () => {
        // Priority: whatsapp_version from AI, then textToShare fallback
        let content = analysisResult?.whatsapp_version;

        if (!content && textToShare) {
            content = "Hey team, here's a strategy summary: " + textToShare.substring(0, 200) + "...";
        }

        const shareText = content || "Built my strategy with GhostNote Pro.";
        const text = encodeURIComponent(`${shareText} ${url}`);
        window.open(`https://wa.me/?text=${text}`, '_blank');
    };

    return (
        <div className="flex justify-center items-center gap-6 mt-6">
            <button
                onClick={handleLinkedIn}
                className="opacity-60 hover:opacity-100 text-[#999] hover:text-[#0077b5] transition-all"
                title="Share to LinkedIn (Copies text first)"
            >
                <FaLinkedin size={20} />
            </button>
            <button
                onClick={handleX}
                className="opacity-60 hover:opacity-100 text-[#999] hover:text-[#1DA1F2] transition-all"
                title="Share to X"
            >
                <FaXTwitter size={20} />
            </button>
            <button
                onClick={handleWhatsApp}
                className="opacity-60 hover:opacity-100 text-[#999] hover:text-[#25D366] transition-all"
                title="Share to WhatsApp"
            >
                <FaWhatsapp size={20} />
            </button>
            <button
                onClick={handleCopy}
                className={`flex items-center space-x-2 font-medium text-xs uppercase tracking-widest transition-colors ${copied ? 'text-green-500' : 'text-[#999] hover:text-[#A88E65]'
                    }`}
                title="Copy Text"
            >
                <FaRegCopy size={18} />
                <span>{copied ? 'COPIED!' : ''}</span>
            </button>
        </div>
    );
};

export default ShareActions;
