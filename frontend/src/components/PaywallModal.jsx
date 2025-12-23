import React from 'react';
import PaystackSub from './PaystackSub';

const PaywallModal = ({ onClose }) => {
    const handleSuccess = (reference) => {
        console.log('Payment successful. Reference:', reference);
        // Here you would typically update the user's status in your backend/local state
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

                <h2 className="font-serif text-2xl text-[#A88E65] mb-4 tracking-wide text-balance">
                    Complimentary Access Complete
                </h2>

                <p className="font-light text-gray-300 mb-8 leading-relaxed">
                    You have used your 3 trial notes. To continue transmuting thought into influence, acquire a membership.
                </p>

                <div className="space-y-4">
                    <PaystackSub
                        amount={20}
                        onSuccess={handleSuccess}
                        onClose={handleClose}
                    />

                    <button className="text-sm text-[#666] hover:text-[#A88E65] transition-colors" onClick={onClose}>
                        Restore Purchase
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaywallModal;
