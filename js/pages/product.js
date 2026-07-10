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
    app.innerHTML = `<div style="text-align: center; padding: 3rem; color: red;">Error: ${error.message}</div>`;
  }
}

function renderProductPage(product) {
  const app = document.getElementById('app');
  currentQuantity = 1;

  app.innerHTML = `
        <div style="max-width:1200px;margin:0 auto;padding:2rem 0;">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:3rem;">
                <!-- Image -->
                <div>
                    <img src="${product.images && product.images[0] || 'https://via.placeholder.com/600'}" 
                         alt="${product.name}" style="width:100%;border-radius:12px;">
                    ${product.images && product.images.length > 1 ? `
                        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:0.5rem;margin-top:0.5rem;">
                            ${product.images.map(img => `
                                <img src="${img}" alt="${product.name}" 
                                     style="width:100%;height:80px;object-fit:cover;border-radius:8px;cursor:pointer;border:2px solid transparent;"
                                     onmouseover="this.style.borderColor='#2563EB'"
                                     onmouseout="this.style.borderColor='transparent'"
                                     onclick="document.getElementById('mainImage').src='${img}'">
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
                
                <!-- Info -->
                <div>
                    <div style="color:#6B7280;font-size:0.9rem;">${product.category}</div>
                    <h1 style="font-size:2.5rem;font-weight:800;margin:0.5rem 0;">${product.name}</h1>
                    
                    <div style="display:flex;align-items:center;gap:1rem;margin:0.5rem 0;">
                        <span style="padding:0.25rem 0.75rem;border-radius:20px;font-weight:600;${product.stock > 0 ? 'background:#D1FAE5;color:#065F46;' : 'background:#FEE2E2;color:#991B1B;'}">
                            ${product.stock > 0 ? '✅ In Stock' : '❌ Out of Stock'}
                        </span>
                        ${product.stock > 0 && product.stock < 10 ? `<span style="color:#EF4444;font-weight:600;">⚠️ Only ${product.stock} left!</span>` : ''}
                    </div>

                    <div style="font-size:2.5rem;font-weight:700;color:#2563EB;margin:1rem 0;">
                        $${product.price.toFixed(2)}
                    </div>
                    
                    <p style="color:#4B5563;line-height:1.8;margin:1rem 0;">${product.description || 'No description available.'}</p>

                    ${product.stock > 0 ? `
                        <div style="display:flex;align-items:center;gap:1rem;margin:1.5rem 0;">
                            <div style="display:flex;align-items:center;gap:0.5rem;border:2px solid #E5E7EB;border-radius:50px;overflow:hidden;">
                                <button onclick="changeQty(-1)" style="width:40px;height:40px;border:none;background:none;font-size:1.2rem;cursor:pointer;">−</button>
                                <span id="qtyDisplay" style="min-width:40px;text-align:center;font-weight:600;">1</span>
                                <button onclick="changeQty(1)" style="width:40px;height:40px;border:none;background:none;font-size:1.2rem;cursor:pointer;">+</button>
                            </div>
                            <button onclick="handleAddToCart()" style="background:#2563EB;color:white;border:none;padding:0.8rem 2.5rem;border-radius:50px;font-weight:600;cursor:pointer;transition:all 0.3s;">
                                <i class="fas fa-shopping-cart"></i> Add to Cart
                            </button>
                        </div>
                    ` : `
                        <button disabled style="background:#9CA3AF;color:white;border:none;padding:0.8rem 2.5rem;border-radius:50px;font-weight:600;cursor:not-allowed;">
                            Out of Stock
                        </button>
                    `}

                    <div style="margin-top:1.5rem;padding-top:1rem;border-top:1px solid #E5E7EB;">
                        <div><strong>Category:</strong> ${product.category}</div>
                        <div><strong>Stock:</strong> ${product.stock} units</div>
                    </div>
                </div>
            </div>

            <!-- Related Products -->
            <div id="relatedProducts" style="margin-top:3rem;">
                <h3>🔄 You May Also Like</h3>
                <div id="relatedGrid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:1.5rem;margin-top:1rem;">
                    <div style="grid-column:1/-1;text-align:center;color:#6B7280;">Loading related products...</div>
                </div>
            </div>
        </div>
    `;

  // Load related products
  getProducts({ category: product.category, limit: 4 })
    .then(related => {
      const filtered = related.filter(p => p.id !== product.id);
      const grid = document.getElementById('relatedGrid');
      if (filtered.length === 0) {
        grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:#6B7280;">No related products found.</div>';
      } else {
        grid.innerHTML = filtered.map(p => `
                    <div style="background:white;border-radius:12px;padding:1rem;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
                        <a href="product.html?id=${p.id}">
                            <img src="${p.images && p.images[0] || 'https://via.placeholder.com/300'}" alt="${p.name}" style="width:100%;height:150px;object-fit:cover;border-radius:8px;">
                        </a>
                        <a href="product.html?id=${p.id}" style="text-decoration:none;color:inherit;">
                            <h4 style="margin:0.5rem 0;font-size:0.95rem;">${p.name}</h4>
                        </a>
                        <div style="font-weight:600;color:#2563EB;">$${p.price.toFixed(2)}</div>
                    </div>
                `).join('');
      }
    })
    .catch(() => {
      document.getElementById('relatedGrid').innerHTML = '<div style="grid-column:1/-1;text-align:center;color:#6B7280;">Could not load related products.</div>';
    });

  // Quantity functions
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
}

function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  if (badge) {
    try {
      const cart = JSON.parse(localStorage.getItem('myStore_cart') || '[]');
      badge.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    } catch { badge.textContent = '0'; }
  }
}