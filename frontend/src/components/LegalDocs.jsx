import React from 'react';
import { IoClose } from 'react-icons/io5';

const LegalContainer = ({ title, children, onClose }) => (
    <div className="fixed inset-0 bg-[#0a0a0a] z-50 flex flex-col items-center py-16 px-6 overflow-y-auto">
        <div className="max-w-2xl w-full">
            <header className="flex justify-between items-center mb-12">
                <h2 className="font-serif text-2xl tracking-widest text-[#A88E65] uppercase">
                    {title}
                </h2>
                <button
                    onClick={onClose}
                    className="text-[#666666] hover:text-white transition-colors"
                    aria-label="Close"
                >
                    <IoClose size={24} />
                </button>
            </header>
            <div className="font-sans text-[#E5E5E5] leading-relaxed space-y-6 text-sm">
                {children}
            </div>
        </div>
    </div>
);

export const PrivacyPolicy = ({ onClose }) => (
    <LegalContainer title="Privacy Policy" onClose={onClose}>
        <section>
            <h3 className="text-[#A88E65] font-serif mb-2 uppercase text-xs tracking-widest">1. Data Collection</h3>
            <p>We collect minimal data (audio, usage metrics). Payments are processed by Paystack.</p>
        </section>
        <section>
            <h3 className="text-[#A88E65] font-serif mb-2 uppercase text-xs tracking-widest">2. Usage</h3>
            <p>Audio is sent to Google Gemini for processing only. We do not use it to train public models.</p>
        </section>
        <section>
            <h3 className="text-[#A88E65] font-serif mb-2 uppercase text-xs tracking-widest">3. Storage</h3>
            <p>Data is stored locally where possible.</p>
        </section>
        <section>
            <h3 className="text-[#A88E65] font-serif mb-2 uppercase text-xs tracking-widest">4. Contact</h3>
            <p>ghostnotepro.team@gmail.com</p>
        </section>
    </LegalContainer>
);

export const TermsOfService = ({ onClose }) => (
    <LegalContainer title="Terms of Service" onClose={onClose}>
        <section>
            <h3 className="text-[#A88E65] font-serif mb-2 uppercase text-xs tracking-widest">1. Service</h3>
            <p>GhostNote Pro is an AI-powered transmutation tool provided 'as is'.</p>
        </section>
        <section>
            <h3 className="text-[#A88E65] font-serif mb-2 uppercase text-xs tracking-widest">2. Subscription</h3>
            <p>Cost is $20/month via Paystack.</p>
        </section>
        <section>
            <h3 className="text-[#A88E65] font-serif mb-2 uppercase text-xs tracking-widest">3. Cancellation</h3>
            <p>Cancel anytime via your billing email.</p>
        </section>
        <section>
            <h3 className="text-[#A88E65] font-serif mb-2 uppercase text-xs tracking-widest">4. Law</h3>
            <p>Governed by the laws of Lagos, Nigeria.</p>
        </section>
    </LegalContainer>
);

export const RefundPolicy = ({ onClose }) => (
    <LegalContainer title="Refund Policy" onClose={onClose}>
        <section>
            <h3 className="text-[#A88E65] font-serif mb-2 uppercase text-xs tracking-widest">1. Guarantee</h3>
            <p>We offer a 7-day money-back guarantee.</p>
        </section>
        <section>
            <h3 className="text-[#A88E65] font-serif mb-2 uppercase text-xs tracking-widest">2. Request</h3>
            <p>Email ghostnotepro.team@gmail.com with subject 'Refund Request'.</p>
        </section>
        <section>
            <h3 className="text-[#A88E65] font-serif mb-2 uppercase text-xs tracking-widest">3. Processing</h3>
            <p>Refunds take 5-10 business days.</p>
        </section>
    </LegalContainer>
);
