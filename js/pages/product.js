import { getProduct, getProducts } from '../firestore-service.js';
import { addToCart } from '../cart.js';
import { showToast } from '../utils.js';

let currentQuantity = 1;
let currentProduct = null;

export default async function renderProduct() {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');

  if (!productId) {
    window.location.href = '404.html';
    return;
  }

  const app = document.getElementById('app');
  app.innerHTML = `<div style="text-align: center; padding: 3rem;">Loading product...</div>`;

  try {
    currentProduct = await getProduct(productId);
    if (!currentProduct) {
      window.location.href = '404.html';
      return;
    }

    renderProductPage(currentProduct);

  } catch (error) {
    console.error('Error loading product:', error);
    app.innerHTML = `<div style="text-align: center; padding: 3rem; color: red;">Error loading product: ${error.message}</div>`;
  }
}

function renderProductPage(product) {
  const app = document.getElementById('app');
  currentQuantity = 1;

  // Get related products (products in same category)
  getProducts({ category: product.category, limit: 4 }).then(relatedProducts => {
    const filteredRelated = relatedProducts.filter(p => p.id !== product.id);
    document.getElementById('relatedProductsContainer').innerHTML = renderRelatedProducts(filteredRelated);
  }).catch(() => { });

  app.innerHTML = `
        <style>
            .product-page { max-width: 1200px; margin: 0 auto; padding: 2rem 0; }
            .product-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; }
            .product-gallery img { width: 100%; border-radius: 12px; }
            .product-title { font-size: 2rem; font-weight: 700; margin: 0.5rem 0; }
            .product-price { font-size: 2rem; font-weight: 700; color: #2563EB; }
            .product-description { color: #4B5563; line-height: 1.8; margin: 1rem 0; }
            .stock-status { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.85rem; font-weight: 600; }
            .in-stock { background: #D1FAE5; color: #065F46; }
            .out-of-stock { background: #FEE2E2; color: #991B1B; }
            .quantity-selector { display: flex; align-items: center; gap: 0.5rem; margin: 1rem 0; }
            .quantity-selector button { width: 40px; height: 40px; border: 2px solid #E5E7EB; border-radius: 50%; background: white; font-size: 1.2rem; cursor: pointer; }
            .quantity-selector span { min-width: 40px; text-align: center; font-weight: 600; font-size: 1.2rem; }
            .btn-add-cart { background: #2563EB; color: white; border: none; padding: 0.8rem 2.5rem; border-radius: 50px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s; }
            .btn-add-cart:hover { background: #1D4ED8; transform: translateY(-2px); }
            .btn-add-cart:disabled { background: #9CA3AF; cursor: not-allowed; }
            .related-products { margin-top: 3rem; }
            .related-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1.5rem; margin-top: 1rem; }
            .related-card { background: white; border-radius: 12px; padding: 1rem; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
            .related-card img { width: 100%; height: 150px; object-fit: cover; border-radius: 8px; }
            .related-card h4 { margin: 0.5rem 0; font-size: 0.95rem; }
            .related-card .price { font-weight: 600; color: #2563EB; }
            .wishlist-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #D1D5DB; transition: color 0.3s; }
            .wishlist-btn.active { color: #EF4444; }
            .product-details { margin: 1rem 0; padding: 1rem 0; border-top: 1px solid #E5E7EB; }
            .detail-row { display: flex; gap: 0.5rem; color: #4B5563; margin: 0.25rem 0; }
            @media (max-width: 768px) {
                .product-grid { grid-template-columns: 1fr; gap: 2rem; }
            }
        </style>

        <div class="product-page">
            <div class="product-grid">
                <!-- Gallery -->
                <div class="product-gallery">
                    <img src="${product.images && product.images[0] || 'https://via.placeholder.com/600'}" 
                         alt="${product.name}" id="mainImage">
                    ${product.images && product.images.length > 1 ? `
                        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; margin-top: 0.5rem;">
                            ${product.images.map(img => `
                                <img src="${img}" alt="${product.name}" 
                                     style="width:100%; height:80px; object-fit:cover; border-radius:8px; cursor:pointer; border:2px solid transparent;"
                                     onmouseover="document.getElementById('mainImage').src='${img}'"
                                     onclick="document.getElementById('mainImage').src='${img}'">
                            `).join('')}
                        </div>
                    ` : ''}
                </div>

                <!-- Info -->
                <div class="product-info">
                    <div style="color: #6B7280; font-size: 0.9rem;">
                        <a href="index.html" style="color: #2563EB;">Home</a> / ${product.category}
                    </div>
                    
                    <h1 class="product-title">${product.name}</h1>
                    
                    <div style="display: flex; align-items: center; gap: 1rem; margin: 0.5rem 0;">
                        <span class="stock-status ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}">
                            ${product.stock > 0 ? '✅ In Stock' : '❌ Out of Stock'}
                        </span>
                        ${product.stock > 0 && product.stock < 10 ? `<span style="color: #EF4444; font-weight: 600;">⚠️ Only ${product.stock} left!</span>` : ''}
                    </div>

                    <div class="product-price">$${product.price.toFixed(2)}</div>
                    
                    <p class="product-description">${product.description || 'No description available.'}</p>

                    ${product.stock > 0 ? `
                        <div class="quantity-selector">
                            <button onclick="changeQty(-1)">−</button>
                            <span id="qtyDisplay">1</span>
                            <button onclick="changeQty(1)">+</button>
                        </div>
                        <button class="btn-add-cart" onclick="handleAddToCart()">
                            <i class="fas fa-shopping-cart"></i> Add to Cart
                        </button>
                    ` : `
                        <button class="btn-add-cart" disabled>Out of Stock</button>
                    `}

                    <div class="product-details">
                        <div class="detail-row"><strong>Category:</strong> ${product.category}</div>
                        <div class="detail-row"><strong>Stock:</strong> ${product.stock} units</div>
                        ${product.sku ? `<div class="detail-row"><strong>SKU:</strong> ${product.sku}</div>` : ''}
                    </div>

                    <div style="display: flex; gap: 1rem; padding-top: 1rem; border-top: 1px solid #E5E7EB;">
                        <button class="wishlist-btn" onclick="toggleWishlist('${product.id}')">
                            <i class="far fa-heart"></i> Save
                        </button>
                        <button class="wishlist-btn" onclick="shareProduct()">
                            <i class="fas fa-share-alt"></i> Share
                        </button>
                    </div>
                </div>
            </div>

            <!-- Related Products -->
            <div class="related-products">
                <h3>🔄 You May Also Like</h3>
                <div class="related-grid" id="relatedProductsContainer">
                    <div style="grid-column: 1/-1; text-align: center; color: #6B7280;">Loading related products...</div>
                </div>
            </div>
        </div>
    `;

  // Global functions for the page
  window.changeQty = (delta) => {
    const newQty = Math.max(1, Math.min(product.stock, currentQuantity + delta));
    currentQuantity = newQty;
    document.getElementById('qtyDisplay').textContent = currentQuantity;
  };

  window.handleAddToCart = () => {
    try {
      addToCart(product, currentQuantity);
      showToast(`${product.name} added to cart! 🛒`, 'success');
      updateCartBadge();
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  window.toggleWishlist = (id) => {
    const btn = document.querySelector('.wishlist-btn');
    const icon = btn.querySelector('i');
    if (icon.classList.contains('far')) {
      icon.classList.replace('far', 'fas');
      btn.style.color = '#EF4444';
      showToast('❤️ Added to wishlist!', 'success');
    } else {
      icon.classList.replace('fas', 'far');
      btn.style.color = '';
      showToast('Removed from wishlist', 'success');
    }
  };

  window.shareProduct = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: product.name, url });
    } else {
      navigator.clipboard.writeText(url);
      showToast('Link copied to clipboard!', 'success');
    }
  };
}

function renderRelatedProducts(products) {
  if (!products || products.length === 0) {
    return '<div style="grid-column: 1/-1; text-align: center; color: #6B7280;">No related products found.</div>';
  }
  return products.map(p => `
        <div class="related-card">
            <a href="product.html?id=${p.id}">
                <img src="${p.images && p.images[0] || 'https://via.placeholder.com/300'}" alt="${p.name}">
            </a>
            <a href="product.html?id=${p.id}" style="text-decoration: none; color: inherit;">
                <h4>${p.name}</h4>
            </a>
            <div class="price">$${p.price.toFixed(2)}</div>
        </div>
    `).join('');
}

// Helper function for cart badge
function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  if (badge) {
    const cart = JSON.parse(localStorage.getItem('myStore_cart') || '[]');
    badge.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
  }
}