// ============================================
// ADVANCED FILTERS ENGINE
// ============================================

export class FilterEngine {
    constructor(products) {
        this.products = products;
        this.filtered = [...products];
        this.filters = {
            categories: [],
            priceRange: { min: 0, max: Infinity },
            rating: 0,
            brands: [],
            stock: 'all', // 'all', 'in-stock', 'out-of-stock'
            sortBy: 'featured',
            search: '',
            discount: 'all', // 'all', 'on-sale', 'not-on-sale'
            minPrice: 0,
            maxPrice: Infinity,
        };
    }

    apply() {
        let filtered = [...this.products];

        // Search
        if (this.filters.search) {
            const q = this.filters.search.toLowerCase();
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(q) ||
                p.description?.toLowerCase().includes(q) ||
                p.category.toLowerCase().includes(q)
            );
        }

        // Categories
        if (this.filters.categories.length > 0) {
            filtered = filtered.filter(p =>
                this.filters.categories.includes(p.category)
            );
        }

        // Price range
        filtered = filtered.filter(p =>
            p.price >= this.filters.priceRange.min &&
            p.price <= this.filters.priceRange.max
        );

        // Rating
        if (this.filters.rating > 0) {
            filtered = filtered.filter(p =>
                (p.rating || 0) >= this.filters.rating
            );
        }

        // Stock
        if (this.filters.stock === 'in-stock') {
            filtered = filtered.filter(p => p.stock > 0);
        } else if (this.filters.stock === 'out-of-stock') {
            filtered = filtered.filter(p => p.stock <= 0);
        }

        // Discount
        if (this.filters.discount === 'on-sale') {
            filtered = filtered.filter(p => p.originalPrice && p.originalPrice > p.price);
        }

        // Sort
        switch (this.filters.sortBy) {
            case 'price-low':
                filtered.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                filtered.sort((a, b) => b.price - a.price);
                break;
            case 'rating':
                filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            case 'popular':
                filtered.sort((a, b) => (b.sales || 0) - (a.sales || 0));
                break;
            case 'discount':
                filtered.sort((a, b) => {
                    const da = a.originalPrice ? (a.originalPrice - a.price) / a.originalPrice : 0;
                    const db = b.originalPrice ? (b.originalPrice - b.price) / b.originalPrice : 0;
                    return db - da;
                });
                break;
            default: // featured
                filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        }

        this.filtered = filtered;
        return filtered;
    }

    // Get all categories with counts
    getCategories() {
        const categories = {};
        this.products.forEach(p => {
            categories[p.category] = (categories[p.category] || 0) + 1;
        });
        return categories;
    }

    // Get price range
    getPriceRange() {
        const prices = this.products.map(p => p.price);
        return {
            min: Math.min(...prices),
            max: Math.max(...prices)
        };
    }

    // Get all brands
    getBrands() {
        const brands = new Set();
        this.products.forEach(p => {
            if (p.brand) brands.add(p.brand);
        });
        return Array.from(brands);
    }

    // Reset all filters
    reset() {
        this.filters = {
            categories: [],
            priceRange: { min: 0, max: Infinity },
            rating: 0,
            brands: [],
            stock: 'all',
            sortBy: 'featured',
            search: '',
            discount: 'all',
            minPrice: 0,
            maxPrice: Infinity,
        };
        return this.apply();
    }
}

// ============================================
// SUGGESTED PRODUCTS
// ============================================

export function getSuggestedProducts(product, allProducts, limit = 4) {
    if (!product || !allProducts || allProducts.length === 0) return [];

    // Score each product for relevance
    const scored = allProducts
        .filter(p => p.id !== product.id)
        .map(p => {
            let score = 0;

            // Same category (high weight)
            if (p.category === product.category) score += 10;

            // Same brand
            if (p.brand && p.brand === product.brand) score += 8;

            // Price similarity (within 30%)
            const priceDiff = Math.abs(p.price - product.price) / product.price;
            if (priceDiff < 0.3) score += 5;

            // Similar rating
            if (p.rating && product.rating && Math.abs(p.rating - product.rating) < 1) score += 3;

            // Popularity
            if (p.sales) score += Math.min(p.sales / 100, 3);

            // Featured
            if (p.featured) score += 2;

            return { ...p, score };
        });

    // Sort by score and return top results
    return scored
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
}