const WISHLIST_KEY = 'myStore_wishlist';

export function getWishlist() {
    try {
        return JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]');
    } catch {
        return [];
    }
}

export function addToWishlist(productId) {
    const wishlist = getWishlist();
    if (!wishlist.includes(productId)) {
        wishlist.push(productId);
        localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    }
    return wishlist;
}

export function removeFromWishlist(productId) {
    const wishlist = getWishlist();
    const updated = wishlist.filter(id => id !== productId);
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(updated));
    return updated;
}

export function isInWishlist(productId) {
    return getWishlist().includes(productId);
}

export function toggleWishlist(productId) {
    if (isInWishlist(productId)) {
        return removeFromWishlist(productId);
    } else {
        return addToWishlist(productId);
    }
}