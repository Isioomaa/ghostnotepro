import React from 'react';
import { PaystackButton } from 'react-paystack';
import { setPro } from '../utils/usageTracker';

const PaystackSub = ({ email, amount, currency, displayText, metadata, onSuccess, onClose }) => {
    // Safety Fallbacks
    const safeEmail = email || "customer@example.com";
    const safeAmount = amount || 2000;
    const safeCurrency = currency || 'USD';
    const safeDisplay = displayText || (safeCurrency === 'USD' ? '$20/mo' : '₦30,000/mo');

    const config = {
        reference: (new Date()).getTime().toString(),
        email: safeEmail,
        amount: safeAmount,
        currency: safeCurrency,
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

    const componentProps = {
        ...config,
        text: `Continue with Membership (${safeDisplay})`,
        onSuccess: (reference) => {
            setPro(true);
            if (onSuccess) onSuccess(reference);
        },
        onClose: onClose,
        className: "w-full py-4 bg-[#A88E65] text-[#1A1A1A] font-bold tracking-wide shadow-lg shadow-[#A88E65]/20 hover:bg-[#8F7650] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 text-sm"
    };

    return <PaystackButton {...componentProps} />;
};

export default PaystackSub;
