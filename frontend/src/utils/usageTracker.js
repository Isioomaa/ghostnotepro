const USAGE_COUNT_KEY = 'ghostnote_usage_count';
const PRO_STATUS_KEY = 'ghostnote_is_pro';
export const LIMIT = 3;

export const PRO_STATUS_CHANGED_EVENT = 'ghostnote-pro-changed';

// Usage Count Management
export const getUsageCount = () => {
    const count = localStorage.getItem(USAGE_COUNT_KEY);
    return count ? parseInt(count, 10) : 0;
};

export const incrementUsageCount = () => {
    const current = getUsageCount();
    localStorage.setItem(USAGE_COUNT_KEY, (current + 1).toString());
};

export const resetUsageCount = () => {
    localStorage.setItem(USAGE_COUNT_KEY, '0');
};

// Pro Status Management
export const isPro = () => {
    const proStatus = localStorage.getItem(PRO_STATUS_KEY);
    const legacyProStatus = localStorage.getItem('isPro'); // Fallback for manual user override
    return proStatus === 'true' || legacyProStatus === 'true';
};

export const setPro = (value) => {
    localStorage.setItem(PRO_STATUS_KEY, value.toString());
    window.dispatchEvent(new CustomEvent(PRO_STATUS_CHANGED_EVENT, { detail: { isPro: value } }));
};

// Limit Check (Rule of 3)
export const hasReachedLimit = () => {
    // If user is Pro, they never reach the limit
    if (isPro()) {
        return false;
    }
    // Free users are limited to 3 generations
    return getUsageCount() >= LIMIT;
};

export const getRemainingGenerations = () => {
    if (isPro()) {
        return Infinity;
    }
    const remaining = LIMIT - getUsageCount();
    return Math.max(0, remaining);
};
