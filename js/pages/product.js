import { getProduct, getProducts } from '../firestore-service.js';
import { addToCart } from '../cart.js';
import { showToast } from '../utils.js';

export default async function renderProduct() {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');

    if (!productId) {
        window.location.href = '404.html';
        return;
    }

    const app = document.getElementById('app');
    app.innerHTML = `
    <div class="product-detail">
      <div class="product-detail-loading">Loading...</div>
    </div>
  `;

    try {
        const product = await getProduct(productId);
        if (!product) {
            window.location.href = '404.html';
            return;
        }

        // Get related products
        const relatedProducts = await getProducts({
            category: product.category,
            limit: 4
        });
        const filteredRelated = relatedProducts.filter(p => p.id !== productId);

        app.innerHTML = `
      <div class="product-detail-container">
        <div class="product-detail-grid">
          <div class="product-gallery">
            <img src="${product.images && product.images[0] || 'https://via.placeholder.com/600'}" 
                 alt="${product.name}" 
                 class="product-main-image"
                 id="mainImage">
            <div class="product-thumbnails">
              ${product.images && product.images.map(img => `
                <img src="${img}" alt="${product.name}" 
                     onclick="document.getElementById('mainImage').src='${img}'">
              `).join('')}
            </div>
          </div>
          
          <div class="product-detail-info">
            <h1>${product.name}</h1>
            <div class="product-detail-price">$${product.price.toFixed(2)}</div>
            <div class="product-detail-stock ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}">
              ${product.stock > 0 ? `✓ In Stock (${product.stock} available)` : '✗ Out of Stock'}
            </div>
            <p class="product-detail-description">${product.description || 'No description available.'}</p>
            
            <div class="product-detail-actions">
              ${product.stock > 0 ? `
                <div class="quantity-selector">
                  <button onclick="changeQuantity(-1)">-</button>
                  <span id="quantity">1</span>
                  <button onclick="changeQuantity(1)">+</button>
                </div>
                <button class="btn btn-block" onclick="addToCartHandler('${productId}')">
                  Add to Cart
                </button>
              ` : `
                <button class="btn btn-block" disabled>Out of Stock</button>
              `}
            </div>
          </div>
        </div>
        
        ${filteredRelated.length > 0 ? `
          <section class="related-products">
            <h2>Related Products</h2>
            <div class="products-grid">
              ${filteredRelated.map(p => `
                <div class="product-card">
                  <a href="product.html?id=${p.id}">
                    <img src="${p.images && p.images[0] || 'https://via.placeholder.com/300'}" 
                         alt="${p.name}" class="product-image">
                  </a>
                  <div class="product-info">
                    <a href="product.html?id=${p.id}" style="text-decoration: none; color: inherit;">
                      <h3 class="product-name">${p.name}</h3>
                    </a>
                    <div class="product-price">$${p.price.toFixed(2)}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </section>
        ` : ''}
      </div>
    `;

        // Quantity selector
        window.currentQuantity = 1;
        window.changeQuantity = (delta) => {
            const newQty = Math.max(1, Math.min(product.stock, window.currentQuantity + delta));
            window.currentQuantity = newQty;
            document.getElementById('quantity').textContent = newQty;
        };

        // Add to cart
        window.addToCartHandler = async () => {
            try {
                addToCart(product, window.currentQuantity);
                showToast(`${product.name} added to cart!`, 'success');
            } catch (error) {
                showToast(error.message, 'error');
            }
        };

    } catch (error) {
        console.error('Error loading product:', error);
        showToast('Error loading product', 'error');
    }
}