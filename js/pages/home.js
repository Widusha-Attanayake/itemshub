import { getProducts } from '../firestore-service.js';
import { addToCart } from '../cart.js';
import { showToast } from '../utils.js';

export default async function renderHome() {
    const app = document.getElementById('app');

    app.innerHTML = `
    <div class="hero">
      <h1>Welcome to MyStore</h1>
      <p>Discover amazing products at great prices. Shop now and enjoy free delivery on orders over $50!</p>
      <a href="#products" class="btn">Shop Now</a>
    </div>
    
    <section id="featured">
      <h2>Featured Products</h2>
      <div class="products-grid" id="featuredProducts">
        <div class="skeleton"></div>
        <div class="skeleton"></div>
        <div class="skeleton"></div>
        <div class="skeleton"></div>
      </div>
    </section>
    
    <section id="all-products">
      <h2>All Products</h2>
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

    // Load products
    try {
        // Featured products
        const featuredProducts = await getProducts({ featured: true, limit: 4 });
        renderProducts('featuredProducts', featuredProducts);

        // All products (first 8)
        const allProducts = await getProducts({ limit: 8 });
        renderProducts('allProducts', allProducts);

        // Load more
        let currentLimit = 8;
        document.getElementById('loadMore').addEventListener('click', async () => {
            currentLimit += 8;
            const moreProducts = await getProducts({ limit: currentLimit });
            renderProducts('allProducts', moreProducts);
            if (moreProducts.length < currentLimit) {
                document.getElementById('loadMore').style.display = 'none';
            }
        });

    } catch (error) {
        console.error('Error loading products:', error);
        showToast('Error loading products', 'error');
    }
}

function renderProducts(containerId, products) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (products.length === 0) {
        container.innerHTML = '<p>No products found.</p>';
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
        <div class="product-price">$${product.price.toFixed(2)}</div>
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

// Expose add to cart handler
window.addToCartHandler = async (productId) => {
    try {
        const { getProduct } = await import('../firestore-service.js');
        const product = await getProduct(productId);
        if (!product) {
            showToast('Product not found', 'error');
            return;
        }
        addToCart(product, 1);
        showToast(`${product.name} added to cart!`, 'success');
    } catch (error) {
        showToast(error.message, 'error');
    }
};