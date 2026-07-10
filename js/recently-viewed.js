const RECENT_KEY = 'myStore_recent';

export function getRecentlyViewed() {
    try {
        return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
    } catch {
        return [];
    }
}

export function addRecentlyViewed(productId) {
    let recent = getRecentlyViewed();
    recent = recent.filter(id => id !== productId);
    recent.unshift(productId);
    if (recent.length > 10) recent.pop();
    localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
    return recent;
}

export function clearRecentlyViewed() {
    localStorage.removeItem(RECENT_KEY);
}