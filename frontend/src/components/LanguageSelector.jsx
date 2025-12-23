import React, { useState, useRef, useEffect } from 'react';
import { LANGUAGES } from '../constants/languages';

const LanguageSelector = ({ currentLang, onLanguageChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const dropdownRef = useRef(null);

    // Filter languages based on search
    const filteredLanguages = LANGUAGES.filter(lang =>
        lang.name.toLowerCase().includes(search.toLowerCase()) ||
        lang.native.toLowerCase().includes(search.toLowerCase()) ||
        lang.code.toLowerCase().includes(search.toLowerCase())
    );

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearch('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (code) => {
        onLanguageChange(code);
        setIsOpen(false);
        setSearch('');
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Current Language Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-[#D4AF37] text-sm font-medium tracking-wider hover:opacity-70 transition-opacity"
            >
                {currentLang}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 top-12 w-56 bg-[#0a0a0a] border border-white/10 shadow-2xl z-50 rounded-xl overflow-hidden backdrop-blur-xl">
                    {/* Search Input */}
                    <div className="p-3 border-b border-white/10">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search..."
                            className="w-full px-3 py-2 text-sm bg-white/5 text-[#f0f0f0] border-none focus:outline-none focus:ring-1 focus:ring-[#D4AF37] rounded-lg"
                            autoFocus
                        />
                    </div>

                    {/* Language List */}
                    <div className="max-h-64 overflow-y-auto">
                        {filteredLanguages.map(lang => (
                            <button
                                key={lang.code}
                                onClick={() => handleSelect(lang.code)}
                                className={`w-full px-4 py-3 text-left text-sm flex justify-between items-center hover:bg-white/5 transition-colors ${currentLang === lang.code ? 'text-[#D4AF37]' : 'text-[#f0f0f0]'
                                    }`}
                            >
                                <span>{lang.name}</span>
                                <span className="text-[#444] text-xs">{lang.native}</span>
                            </button>
                        ))}
                        {filteredLanguages.length === 0 && (
                            <div className="px-4 py-3 text-sm text-[#444]">No languages found</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LanguageSelector;
