// ============================================
// WISHLIST MANAGEMENT
// ============================================

const WISHLIST_KEY = 'myStore_wishlist';

// Get wishlist
export function getWishlist() {
    try {
        return JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]');
    } catch {
        return [];
    }
}

// Get wishlist with product details
export async function getWishlistWithDetails() {
    const wishlistIds = getWishlist();
    if (wishlistIds.length === 0) return [];

    const { getProduct } = await import('./firestore-service.js');
    const products = [];
    for (const id of wishlistIds) {
        const product = await getProduct(id);
        if (product) {
            products.push(product);
        }
    }
    return products;
}

// Add to wishlist
export function addToWishlist(productId) {
    const wishlist = getWishlist();
    if (!wishlist.includes(productId)) {
        wishlist.push(productId);
        localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    }
    return wishlist;
}

// Remove from wishlist
export function removeFromWishlist(productId) {
    const wishlist = getWishlist();
    const updated = wishlist.filter(id => id !== productId);
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(updated));
    return updated;
}

// Toggle wishlist
export function toggleWishlist(productId) {
    const wishlist = getWishlist();
    if (wishlist.includes(productId)) {
        return removeFromWishlist(productId);
    } else {
        return addToWishlist(productId);
    }
}

// Check if in wishlist
export function isInWishlist(productId) {
    return getWishlist().includes(productId);
}

// Clear wishlist
export function clearWishlist() {
    localStorage.removeItem(WISHLIST_KEY);
}

// Get wishlist count
export function getWishlistCount() {
    return getWishlist().length;
}