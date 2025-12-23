import React, { useState } from 'react';
import { FaLinkedin, FaXTwitter, FaWhatsapp, FaRegCopy } from 'react-icons/fa6';

const ShareActions = ({ textToShare, url = "https://ghostnotepro.com" }) => {
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
        // 1. Copy text to clipboard
        await navigator.clipboard.writeText(textToShare);

        // 2. Alert user
        alert("Text Copied! Paste it into your LinkedIn post.");

        // 3. Open LinkedIn share (just the main feed or share dialog)
        // Since we can't pre-fill text reliably on LinkedIn anymore without API,
        // we just open standard share or feed.
        window.open('https://www.linkedin.com/feed/?shareActive=true', '_blank');
    };

    const handleX = () => {
        const text = encodeURIComponent("Built my strategy with GhostNote Pro. ");
        const shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`;
        window.open(shareUrl, '_blank');
    };

    const handleWhatsApp = () => {
        const text = encodeURIComponent(`Built my strategy with GhostNote Pro. Check it out: ${url}`);
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
