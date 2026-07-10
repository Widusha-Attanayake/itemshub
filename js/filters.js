export class ProductFilters {
    constructor(products) {
        this.products = products;
        this.filteredProducts = [...products];
        this.activeFilters = {
            categories: [],
            priceRange: { min: 0, max: Infinity },
            rating: 0,
            sortBy: 'newest',
            inStock: false,
            search: ''
        };
    }

    applyFilters() {
        let filtered = [...this.products];

        // Category filter
        if (this.activeFilters.categories.length > 0) {
            filtered = filtered.filter(p =>
                this.activeFilters.categories.includes(p.category)
            );
        }

        // Price range
        filtered = filtered.filter(p =>
            p.price >= this.activeFilters.priceRange.min &&
            p.price <= this.activeFilters.priceRange.max
        );

        // Rating filter
        if (this.activeFilters.rating > 0) {
            filtered = filtered.filter(p =>
                (p.rating || 0) >= this.activeFilters.rating
            );
        }

        // In-stock filter
        if (this.activeFilters.inStock) {
            filtered = filtered.filter(p => p.stock > 0);
        }

        // Search
        if (this.activeFilters.search) {
            const search = this.activeFilters.search.toLowerCase();
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(search) ||
                p.description.toLowerCase().includes(search) ||
                p.category.toLowerCase().includes(search)
            );
        }

        // Sorting
        switch (this.activeFilters.sortBy) {
            case 'price-low':
                filtered.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                filtered.sort((a, b) => b.price - a.price);
                break;
            case 'popular':
                filtered.sort((a, b) => (b.sales || 0) - (a.sales || 0));
                break;
            case 'rating':
                filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            default: // newest
                filtered.sort((a, b) => b.createdAt - a.createdAt);
        }

        this.filteredProducts = filtered;
        return filtered;
    }

    setCategory(category, checked) {
        if (checked) {
            if (!this.activeFilters.categories.includes(category)) {
                this.activeFilters.categories.push(category);
            }
        } else {
            this.activeFilters.categories = this.activeFilters.categories
                .filter(c => c !== category);
        }
        return this.applyFilters();
    }

    setPriceRange(min, max) {
        this.activeFilters.priceRange = { min, max };
        return this.applyFilters();
    }

    setRating(rating) {
        this.activeFilters.rating = rating;
        return this.applyFilters();
    }

    setSortBy(sortBy) {
        this.activeFilters.sortBy = sortBy;
        return this.applyFilters();
    }

    setInStock(inStock) {
        this.activeFilters.inStock = inStock;
        return this.applyFilters();
    }

    setSearch(search) {
        this.activeFilters.search = search;
        return this.applyFilters();
    }

    clearFilters() {
        this.activeFilters = {
            categories: [],
            priceRange: { min: 0, max: Infinity },
            rating: 0,
            sortBy: 'newest',
            inStock: false,
            search: ''
        };
        return this.applyFilters();
    }

    getCategories() {
        const categories = new Set();
        this.products.forEach(p => categories.add(p.category));
        return Array.from(categories);
    }

    getPriceRange() {
        const prices = this.products.map(p => p.price);
        return {
            min: Math.min(...prices),
            max: Math.max(...prices)
        };
    }
}