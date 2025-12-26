import React, { useState, useEffect } from 'react';
import PaystackSub from './PaystackSub';

const PaywallModal = ({ onClose, scenario = 'upsell' }) => {
    // 1. Fail-Safe State Initialization
    const [paymentConfig, setPaymentConfig] = useState({
        amount: 2000,
        currency: 'USD',
        displayText: '$20/mo'
    });

    useEffect(() => {
        try {
            const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const isNigeria = userTimezone && (
                userTimezone.toLowerCase().includes('lagos') ||
                userTimezone.toLowerCase().includes('africa/lagos')
            );

            if (isNigeria) {
                setPaymentConfig({
                    amount: 3000000,
                    currency: 'NGN',
                    displayText: '₦30,000/mo'
                });
            } else {
                setPaymentConfig({
                    amount: 2000,
                    currency: 'USD',
                    displayText: '$20/mo'
                });
            }
        } catch (err) {
            console.error("Region detection error:", err);
        }
    }, []);

    return (
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-[#0a0a0a]/90 backdrop-blur-sm cursor-pointer"
                onClick={onClose}
                aria-hidden="true"
            ></div>

            {/* Modal Card - Premium Bronze/Gold Design */}
            <div className="relative w-full max-w-lg bg-[#141414] border border-[#a88e65]/40 p-12 text-center shadow-[0_0_100px_rgba(0,0,0,0.9)]">

                {/* Lock Icon in Bronze Circle */}
                <div className="flex justify-center mb-10">
                    <div className="w-16 h-16 rounded-full border border-[#a88e65]/30 flex items-center justify-center bg-[#a88e65]/5">
                        <svg className="w-6 h-6 text-[#a88e65]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                </div>

                {/* Premium Headlines */}
                <div className="mb-12">
                    <h2 className="font-serif text-3xl md:text-5xl text-[#a88e65]/90 mb-8 leading-tight tracking-tight px-4">
                        Continue turning thought<br />into strategy
                    </h2>

                    <div className="space-y-6 max-w-sm mx-auto text-gray-400 font-light leading-relaxed px-2">
                        <p className="text-sm">
                            You've experienced GhostNote Pro's core workflow. Membership unlocks uninterrupted transmutation—from raw thinking to strategic clarity.
                        </p>

                        <p className="text-[12px] italic text-gray-500 mt-8 opacity-70">
                            Most members use GhostNote Pro to clarify thinking after meetings, during planning, and before writing.
                        </p>
                    </div>
                </div>

                {/* The Membership Button */}
                <div className="space-y-10">
                    <PaystackSub
                        amount={paymentConfig.amount}
                        currency={paymentConfig.currency}
                        displayText={paymentConfig.displayText}
                        onSuccess={onClose}
                        onClose={() => console.log("Paystack modal closed")}
                    />

                    {/* Footer Links */}
                    <div className="space-y-6">
                        <p className="text-[11px] text-gray-600 uppercase tracking-[0.2em] opacity-80">
                            Cancel anytime. Your thoughts stay private.
                        </p>

                        <button
                            onClick={onClose}
                            className="text-xs text-gray-500 hover:text-[#a88e65] transition-colors uppercase tracking-[0.3em] font-light"
                        >
                            Restore Purchase
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaywallModal;
