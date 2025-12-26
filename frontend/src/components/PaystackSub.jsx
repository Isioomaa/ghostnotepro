import React from 'react';
import { usePaystackPayment } from 'react-paystack';
import { setPro } from '../utils/usageTracker';

const PaystackSub = ({ email, amount, currency, displayText, onSuccess, onClose }) => {
    // 1. Safety Fallbacks
    const safeEmail = email || "customer@example.com";
    const safeAmount = amount || 2000;
    const safeCurrency = currency || 'USD';
    const safeDisplay = displayText || (safeCurrency === 'USD' ? '$20' : '₦30,000');

    // Use a realistic-looking placeholder if the user hasn't set their key yet
    // This prevents runtime crashes in some versions of the Paystack library
    const fallbackKey = "pk_test_000000000000000000000000000000000000000";
    const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || fallbackKey;

    console.log("Initializing Paystack with:", { safeCurrency, safeAmount, hasKey: !!import.meta.env.VITE_PAYSTACK_PUBLIC_KEY });

    const config = {
        reference: `T${Date.now()}`,
        email: safeEmail,
        amount: safeAmount,
        currency: safeCurrency,
        publicKey: publicKey,
        metadata: {
            plan: "GhostNote Pro"
        }
    };

    let initializePayment;
    try {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        initializePayment = usePaystackPayment(config);
    } catch (err) {
        console.error("CRITICAL: usePaystackPayment hook failed!", err);
    }

    const handlePayment = () => {
        if (!initializePayment) {
            alert("Payment system is unavailable. Please check your internet connection.");
            return;
        }

        try {
            initializePayment(
                (reference) => {
                    console.log("Paystack Success Reference:", reference);
                    setPro(true);
                    if (onSuccess) onSuccess(reference);
                },
                () => {
                    console.log("Paystack Modal Closed");
                    if (onClose) onClose();
                }
            );
        } catch (err) {
            console.error("Paystack Execution Error:", err);
            alert("Could not open payment gateway. Please try refreshing.");
        }
    };

    return (
        <button
            onClick={handlePayment}
            className="w-full py-4 bg-[#A88E65] text-[#1A1A1A] font-bold tracking-widest shadow-lg shadow-[#A88E65]/20 hover:bg-[#8F7650] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 text-xs uppercase"
        >
            Upgrade Now ({safeDisplay})
        </button>
    );
};

export default PaystackSub;
