import { getProducts } from '../firestore-service.js';
import { addToCart } from '../cart.js';
import { showToast } from '../utils.js';

// ============================================
// HERO SLIDESHOW FUNCTIONS
// ============================================
function initHeroSlideshow() {
    const slidesContainer = document.getElementById('heroSlides');
    const dots = document.querySelectorAll('.hero-dot');
    const prevBtn = document.getElementById('prevArrow');
    const nextBtn = document.getElementById('nextArrow');
    let currentSlide = 0;
    let autoPlayInterval = null;
    const totalSlides = dots.length;

    if (totalSlides === 0) return;

    function goToSlide(index) {
        if (index < 0) index = totalSlides - 1;
        if (index >= totalSlides) index = 0;
        currentSlide = index;
        slidesContainer.style.transform = `translateX(-${currentSlide * 100}%)`;

        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentSlide);
        });
    }

    function nextSlide() {
        goToSlide(currentSlide + 1);
    }

    function prevSlide() {
        goToSlide(currentSlide - 1);
    }

    function startAutoPlay() {
        if (autoPlayInterval) clearInterval(autoPlayInterval);
        autoPlayInterval = setInterval(nextSlide, 5000);
    }

    function stopAutoPlay() {
        if (autoPlayInterval) {
            clearInterval(autoPlayInterval);
            autoPlayInterval = null;
        }
    }

    // Event listeners
    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            stopAutoPlay();
            prevSlide();
            setTimeout(startAutoPlay, 100);
        });

        nextBtn.addEventListener('click', () => {
            stopAutoPlay();
            nextSlide();
            setTimeout(startAutoPlay, 100);
        });
    }

    dots.forEach((dot) => {
        dot.addEventListener('click', () => {
            stopAutoPlay();
            const index = parseInt(dot.dataset.index);
            goToSlide(index);
            setTimeout(startAutoPlay, 100);
        });
    });

    const container = document.getElementById('heroSlideshow');
    if (container) {
        container.addEventListener('mouseenter', stopAutoPlay);
        container.addEventListener('mouseleave', startAutoPlay);

        // Touch support
        let touchStartX = 0;
        let touchEndX = 0;
        container.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });
        container.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            const diff = touchStartX - touchEndX;
            if (Math.abs(diff) > 50) {
                stopAutoPlay();
                if (diff > 0) {
                    nextSlide();
                } else {
                    prevSlide();
                }
                setTimeout(startAutoPlay, 100);
            }
        });
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        const hero = document.getElementById('heroSlideshow');
        if (!hero) return;
        if (e.key === 'ArrowRight') {
            stopAutoPlay();
            nextSlide();
            setTimeout(startAutoPlay, 100);
        } else if (e.key === 'ArrowLeft') {
            stopAutoPlay();
            prevSlide();
            setTimeout(startAutoPlay, 100);
        }
    });

    startAutoPlay();
}

// ============================================
// RENDER PRODUCTS
// ============================================
function renderProducts(containerId, products) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!products || products.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:#6B7280;padding:2rem;">No products found.</p>';
        return;
    }

    container.innerHTML = products.map(product => `
        <div class="product-card">
            <a href="product.html?id=${product.id}">
                <img src="${product.images && product.images[0] || 'https://via.placeholder.com/300'}" 
                     alt="${product.name}" class="product-image">
            </a>
            <div class="product-info">
                <a href="product.html?id=${product.id}" style="text-decoration: none; color: inherit;">
                    <h3 class="product-name">${product.name}</h3>
                </a>
                <div class="product-price">$${product.price ? product.price.toFixed(2) : '0.00'}</div>
                <div class="product-stock">${product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}</div>
                <div class="product-actions">
                    <button class="btn btn-block" 
                            onclick="window.addToCartHandler('${product.id}')"
                            ${product.stock <= 0 ? 'disabled' : ''}>
                        ${product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// ============================================
// MAIN HOME PAGE RENDER
// ============================================
export default async function renderHome() {
    const app = document.getElementById('app');

    // Render HTML with hero slideshow
    app.innerHTML = `
        <!-- Hero Slideshow -->
        <div class="hero-slideshow" id="heroSlideshow">
            <div class="hero-slides" id="heroSlides">
                <!-- Slide 1 -->
                <div class="hero-slide" style="background-image: url('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200');">
                    <div class="hero-slide-content">
                        <h1>🎧 Premium Headphones</h1>
                        <p>Experience crystal-clear sound with our latest collection</p>
                        <a href="search.html?category=Electronics" class="btn-hero">Shop Now</a>
                        <a href="#products" class="btn-hero btn-hero-secondary">Explore</a>
                    </div>
                </div>
                
                <!-- Slide 2 -->
                <div class="hero-slide" style="background-image: url('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200');">
                    <div class="hero-slide-content">
                        <h1>⌚ Smart Watches</h1>
                        <p>Track your fitness and style with our premium smartwatches</p>
                        <a href="search.html?category=Electronics" class="btn-hero">Shop Now</a>
                        <a href="#products" class="btn-hero btn-hero-secondary">Explore</a>
                    </div>
                </div>
                
                <!-- Slide 3 -->
                <div class="hero-slide" style="background-image: url('https://images.unsplash.com/photo-1551028719-00167b16eac5?w=1200');">
                    <div class="hero-slide-content">
                        <h1>👔 Premium Fashion</h1>
                        <p>Discover our latest collection of premium clothing</p>
                        <a href="search.html?category=Clothing" class="btn-hero">Shop Now</a>
                        <a href="#products" class="btn-hero btn-hero-secondary">Explore</a>
                    </div>
                </div>
                
                <!-- Slide 4 -->
                <div class="hero-slide" style="background-image: url('https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=1200');">
                    <div class="hero-slide-content">
                        <h1>☕ Home Essentials</h1>
                        <p>Premium home products for a comfortable lifestyle</p>
                        <a href="search.html?category=Home" class="btn-hero">Shop Now</a>
                        <a href="#products" class="btn-hero btn-hero-secondary">Explore</a>
                    </div>
                </div>
            </div>
            
            <!-- Dots Navigation -->
            <div class="hero-dots" id="heroDots">
                <span class="hero-dot active" data-index="0"></span>
                <span class="hero-dot" data-index="1"></span>
                <span class="hero-dot" data-index="2"></span>
                <span class="hero-dot" data-index="3"></span>
            </div>
            
            <!-- Arrow Buttons -->
            <div class="hero-arrows">
                <button class="hero-arrow" id="prevArrow">‹</button>
                <button class="hero-arrow" id="nextArrow">›</button>
            </div>
        </div>
        
        <!-- Featured Products -->
        <section id="featured">
            <h2>⭐ Featured Products</h2>
            <div class="products-grid" id="featuredProducts">
                <div class="skeleton"></div>
                <div class="skeleton"></div>
                <div class="skeleton"></div>
                <div class="skeleton"></div>
            </div>
        </section>
        
        <!-- All Products -->
        <section id="all-products">
            <h2>📦 All Products</h2>
            <div class="products-grid" id="allProducts">
                <div class="skeleton"></div>
                <div class="skeleton"></div>
                <div class="skeleton"></div>
                <div class="skeleton"></div>
            </div>
            <div class="text-center mt-2">
                <button class="btn" id="loadMore">Load More</button>
            </div>
        </section>
    `;

    // ============================================
    // LOAD PRODUCTS
    // ============================================
    try {
        console.log('🔄 Loading products...');

        // Get ALL products from Firestore
        const allProducts = await getProducts();
        console.log('📦 Products found:', allProducts.length);

        // Filter featured products
        const featuredProducts = allProducts.filter(p => p.featured === true);
        console.log('⭐ Featured products:', featuredProducts.length);

        // Display products
        if (allProducts.length === 0) {
            document.getElementById('allProducts').innerHTML = '<p style="text-align:center;color:#6B7280;padding:2rem;">No products found. Add some products!</p>';
            document.getElementById('featuredProducts').innerHTML = '<p style="text-align:center;color:#6B7280;padding:2rem;">No featured products yet.</p>';
            document.getElementById('loadMore').style.display = 'none';
        } else {
            // Show featured products
            if (featuredProducts.length > 0) {
                renderProducts('featuredProducts', featuredProducts);
            } else {
                document.getElementById('featuredProducts').innerHTML = '<p style="text-align:center;color:#6B7280;padding:2rem;">No featured products. Check the "Featured" box when adding products.</p>';
            }

            // Show ALL products (first 8)
            renderProducts('allProducts', allProducts.slice(0, 8));

            // Load more button
            let currentLimit = 8;
            const loadMoreBtn = document.getElementById('loadMore');

            if (loadMoreBtn) {
                loadMoreBtn.addEventListener('click', async () => {
                    currentLimit += 8;
                    const moreProducts = allProducts.slice(0, currentLimit);
                    renderProducts('allProducts', moreProducts);
                    if (moreProducts.length >= allProducts.length) {
                        loadMoreBtn.style.display = 'none';
                    }
                });

                if (allProducts.length <= 8) {
                    loadMoreBtn.style.display = 'none';
                }
            }
        }

        // ============================================
        // INIT HERO SLIDESHOW (after DOM is ready)
        // ============================================
        setTimeout(() => {
            initHeroSlideshow();
        }, 100);

    } catch (error) {
        console.error('❌ Error loading products:', error);
        document.getElementById('allProducts').innerHTML = `<p style="text-align:center;color:#EF4444;padding:2rem;">Error loading products: ${error.message}</p>`;
        document.getElementById('featuredProducts').innerHTML = `<p style="text-align:center;color:#EF4444;padding:2rem;">Error loading products</p>`;
    }
}

// ============================================
// ADD TO CART HANDLER (Global)
// ============================================
window.addToCartHandler = async (productId) => {
    try {
        const { getProduct } = await import('../firestore-service.js');
        const product = await getProduct(productId);
        if (!product) {
            showToast('Product not found', 'error');
            return;
        }
        addToCart(product, 1);
        showToast(`${product.name} added to cart! 🛒`, 'success');

        // Update cart badge
        const badge = document.getElementById('cartBadge');
        if (badge) {
            const cart = JSON.parse(localStorage.getItem('myStore_cart') || '[]');
            badge.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
        }
    } catch (error) {
        showToast(error.message, 'error');
    }
};