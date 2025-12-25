import React from 'react';
import PaystackSub from './PaystackSub';

const PaywallModal = ({ onClose }) => {
    const handleSuccess = (reference) => {
        console.log('Payment successful. Reference:', reference);
        alert('Thank you for becoming a member!');
        onClose();
    };

    const handleClose = () => {
        console.log('Payment closed');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-[#1A1A1A]/90 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            {/* Modal Content - Bronze Card */}
            <div className="relative w-full max-w-md bg-[#1A1A1A] border border-[#A88E65] p-8 text-center shadow-2xl shadow-[#A88E65]/20">

                {/* Decorative Element */}
                <div className="w-16 h-1 bg-[#A88E65] mx-auto mb-8"></div>

                <h2 className="font-serif text-2xl md:text-3xl text-[#A88E65] mb-4 tracking-wide">
                    Continue turning thought into strategy
                </h2>

                <p className="font-light text-gray-400 mb-8 leading-relaxed text-sm md:text-base">
                    You've experienced GhostNote Pro's core workflow. Membership unlocks uninterrupted transmutation—from raw thinking to strategic clarity.
                </p>

                <div className="space-y-4">
                    <PaystackSub
                        amount={20}
                        onSuccess={handleSuccess}
                        onClose={handleClose}
                    />

                    {/* Microcopy */}
                    <p className="text-xs text-gray-500 mt-3">
                        Cancel anytime. Your thoughts stay private.
                    </p>

                    <button className="text-sm text-[#666] hover:text-[#A88E65] transition-colors" onClick={onClose}>
                        Restore Purchase
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaywallModal;
