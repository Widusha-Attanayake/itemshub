// ===== UTILITY FUNCTIONS =====

/**
 * Show a toast notification
 * @param {string} message - The message to display
 * @param {string} type - 'success' or 'error'
 */
export function showToast(message, type = 'success') {
    // Check if toast container exists
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

/**
 * Format a price with currency symbol
 * @param {number} amount
 * @param {string} currency - Default '$'
 * @returns {string}
 */
export function formatPrice(amount, currency = '$') {
    return `${currency}${amount.toFixed(2)}`;
}

/**
 * Generate a URL-friendly slug from text
 * @param {string} text
 * @returns {string}
 */
export function generateSlug(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}