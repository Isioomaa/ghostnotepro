const STORAGE_KEY = 'ghostnote_usage_count';
const LIMIT = 3;

export const getUsageCount = () => {
    const count = localStorage.getItem(STORAGE_KEY);
    return count ? parseInt(count, 10) : 0;
};

export const incrementUsageCount = () => {
    const current = getUsageCount();
    localStorage.setItem(STORAGE_KEY, (current + 1).toString());
};

export const hasReachedLimit = () => {
    return getUsageCount() >= LIMIT;
};
