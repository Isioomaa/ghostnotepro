import React, { useState, useEffect } from 'react';
import PaystackSub from './PaystackSub';

const PaywallModal = ({ onClose, scenario = 'upsell' }) => {
    console.log("PaywallModal rendering...", { scenario });

    // 1. Fail-Safe State Initialization
    const [paymentConfig, setPaymentConfig] = useState({
        amount: 2000,
        currency: 'USD',
        displayText: '$20/mo'
    });

    useEffect(() => {
        console.log("PaywallModal useEffect: Detecting region...");
        try {
            const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            console.log("Resolved Timezone:", userTimezone);

            const isNigeria = userTimezone && (
                userTimezone.toLowerCase().includes('lagos') ||
                userTimezone.toLowerCase().includes('africa/lagos')
            );

            if (isNigeria) {
                console.log("Region: Nigeria. Applying NGN rates.");
                setPaymentConfig({
                    amount: 3000000,
                    currency: 'NGN',
                    displayText: '₦30,000/mo'
                });
            } else {
                console.log("Region: International. Staying with USD rates.");
                // Explicitly set to USD just in case of state weirdness
                setPaymentConfig({
                    amount: 2000,
                    currency: 'USD',
                    displayText: '$20/mo'
                });
            }
        } catch (err) {
            console.error("Region detection error, using USD fallback:", err);
        }
    }, []);

    const isLimitReached = scenario === 'limit_reached';

    return (
        <div className="fixed inset-0 flex items-center justify-center p-4 shadow-2xl" style={{ zIndex: 9999 }}>
            {/* Backdrop - Using a distinct dark blue to verify render */}
            <div
                className="absolute inset-0 bg-[#0c1421]/95 backdrop-blur-md cursor-pointer"
                onClick={onClose}
                aria-hidden="true"
            ></div>

            {/* Modal Card */}
            <div className="relative w-full max-w-md bg-[#1A1A1A] border border-[#A88E65] p-10 text-center shadow-[0_0_50px_rgba(168,142,101,0.2)]">

                {/* Manual Close X */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors p-2"
                    title="Close"
                >
                    ✕
                </button>

                {/* Content */}
                <div className="mb-8">
                    <div className="text-3xl mb-4">🔒</div>
                    {isLimitReached ? (
                        <>
                            <h2 className="font-serif text-2xl text-[#A88E65] mb-2">Limit Reached.</h2>
                            <p className="text-gray-400 text-sm">Continue your strategic thinking without limits.</p>
                        </>
                    ) : (
                        <h2 className="font-serif text-2xl text-[#A88E65] mb-2">Upgrade to GhostNote Pro</h2>
                    )}
                </div>

                <div className="space-y-6">
                    <PaystackSub
                        amount={paymentConfig.amount}
                        currency={paymentConfig.currency}
                        displayText={paymentConfig.displayText}
                        onSuccess={() => {
                            console.log("Payment success callback");
                            onClose();
                        }}
                        onClose={() => console.log("Paystack modal closed")}
                    />

                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                        Unlimited Transmutations & Executive Analysis
                    </p>

                    <button
                        onClick={onClose}
                        className="text-xs text-[#666] hover:text-[#A88E65] uppercase tracking-widest"
                    >
                        Maybe Later
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaywallModal;
