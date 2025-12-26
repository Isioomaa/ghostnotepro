import React from 'react';
import { usePaystackPayment } from 'react-paystack';
import { setPro } from '../utils/usageTracker';

const PaystackSub = ({ email, amount, metadata, onSuccess, onClose }) => {
    // Note: Public key should ideally come from env
    const config = {
        reference: (new Date()).getTime().toString(),
        email: email || "customer@example.com",
        amount: amount * 100, // Paystack expects amount in kobos
        publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_placeholder',
        metadata: {
            custom_fields: [
                {
                    display_name: "Subscription Plan",
                    variable_name: "subscription_plan",
                    value: "GhostNote Pro Membership"
                },
                ...Object.entries(metadata || {}).map(([key, value]) => ({
                    display_name: key,
                    variable_name: key.toLowerCase().replace(/\s+/g, '_'),
                    value: value
                }))
            ]
        }
    };

    const initializePayment = usePaystackPayment(config);

    const handlePayment = () => {
        initializePayment(
            (reference) => {
                // Set Pro status on successful payment
                setPro(true);
                // Call the original onSuccess callback
                if (onSuccess) {
                    onSuccess(reference);
                }
            },
            onClose
        );
    };

    return (
        <button
            onClick={handlePayment}
            className="w-full py-4 bg-[#A88E65] text-[#1A1A1A] font-bold tracking-wide shadow-lg shadow-[#A88E65]/20 hover:bg-[#8F7650] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 text-sm"
        >
            Continue with Membership (${amount}/mo)
        </button>
    );
};

export default PaystackSub;
