import { checkAuth } from '../auth-check.js';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../firestore-service.js';
import { showToast } from '../utils.js';

let products = [];

export default async function renderAdminProducts() {
    if (!checkAuth()) return;

    const app = document.getElementById('app');
    app.innerHTML = `
    <div class="admin-layout">
      <aside class="admin-sidebar">
        <h3>Admin Panel</h3>
        <a href="index.html">Dashboard</a>
        <a href="products.html" class="active">Products</a>
        <a href="orders.html">Orders</a>
        <hr>
        <a href="#" onclick="handleLogout()" style="color: #ef4444;">Logout</a>
      </aside>
      
      <main class="admin-content">
        <div class="admin-header">
          <h1>Product Management</h1>
          <button class="btn" onclick="showProductForm()">Add New Product</button>
        </div>
        
        <div class="admin-toolbar">
          <input type="text" id="searchProducts" placeholder="Search products..." oninput="filterProducts()">
        </div>
        
        <div id="productsTable" class="table-container">
          Loading...
        </div>
      </main>
    </div>
  `;

    await loadProducts();
}

async function loadProducts() {
    try {
        products = await getProducts();
        renderProductsTable();
    } catch (error) {
        console.error('Error loading products:', error);
        showToast('Error loading products', 'error');
    }
}

function renderProductsTable() {
    const container = document.getElementById('productsTable');

    if (products.length === 0) {
        container.innerHTML = '<p>No products found. Add your first product!</p>';
        return;
    }

    container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Image</th>
          <th>Name</th>
          <th>Category</th>
          <th>Price</th>
          <th>Stock</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${products.map(p => `
          <tr>
            <td>
              <img src="${p.images && p.images[0] || 'https://via.placeholder.com/50'}" 
                   alt="${p.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;">
            </td>
            <td>${p.name}</td>
            <td>${p.category}</td>
            <td>$${p.price.toFixed(2)}</td>
            <td style="color: ${p.stock < 5 ? '#ef4444' : 'inherit'}">${p.stock}</td>
            <td>
              <button class="btn btn-secondary" onclick="editProduct('${p.id}')">Edit</button>
              <button class="btn btn-danger" onclick="deleteProductHandler('${p.id}')">Delete</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

window.filterProducts = () => {
    const search = document.getElementById('searchProducts').value.toLowerCase();
    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(search) ||
        p.category.toLowerCase().includes(search)
    );
    const container = document.getElementById('productsTable');
    // Re-render with filtered products
    const originalProducts = products;
    products = filtered;
    renderProductsTable();
    products = originalProducts;
};

window.showProductForm = (product = null) => {
    const isEdit = !!product;
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  `;

    modal.innerHTML = `
    <div style="background: white; padding: 2rem; border-radius: 20px; max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto;">
      <h2>${isEdit ? 'Edit' : 'Add'} Product</h2>
      <form id="productForm">
        <div class="form-group">
          <label for="productName">Name *</label>
          <input type="text" id="productName" value="${isEdit ? product.name : ''}" required>
        </div>
        <div class="form-group">
          <label for="productCategory">Category *</label>
          <select id="productCategory" required>
            <option value="">Select Category</option>
            ${['Electronics', 'Clothing', 'Books', 'Home', 'Beauty', 'Sports', 'Toys', 'Other'].map(cat => `
              <option value="${cat}" ${isEdit && product.category === cat ? 'selected' : ''}>${cat}</option>
            `).join('')}
          </select>
        </div>
        <div class="form-group">
          <label for="productPrice">Price *</label>
          <input type="number" id="productPrice" step="0.01" value="${isEdit ? product.price : ''}" required>
        </div>
        <div class="form-group">
          <label for="productStock">Stock *</label>
          <input type="number" id="productStock" value="${isEdit ? product.stock : 0}" required>
        </div>
        <div class="form-group">
          <label for="productDescription">Description</label>
          <textarea id="productDescription">${isEdit ? product.description || '' : ''}</textarea>
        </div>
        <div class="form-group">
          <label for="productImages">Image URLs (comma separated)</label>
          <input type="text" id="productImages" value="${isEdit && product.images ? product.images.join(', ') : ''}">
        </div>
        <div class="form-group">
          <label>
            <input type="checkbox" id="productFeatured" ${isEdit && product.featured ? 'checked' : ''}>
            Featured Product
          </label>
        </div>
        <button type="submit" class="btn btn-block">${isEdit ? 'Update' : 'Create'} Product</button>
        <button type="button" class="btn btn-secondary btn-block" onclick="this.closest('.modal').remove()">Cancel</button>
      </form>
    </div>
  `;

    document.body.appendChild(modal);

    document.getElementById('productForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('productName').value.trim();
        const category = document.getElementById('productCategory').value;
        const price = parseFloat(document.getElementById('productPrice').value);
        const stock = parseInt(document.getElementById('productStock').value);
        const description = document.getElementById('productDescription').value.trim();
        const images = document.getElementById('productImages').value.split(',').map(s => s.trim()).filter(s => s);
        const featured = document.getElementById('productFeatured').checked;

        if (!name || !category || isNaN(price) || isNaN(stock)) {
            showToast('Please fill in all required fields', 'error');
            return;
        }

        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

        const productData = {
            name,
            slug,
            category,
            price,
            stock,
            description,
            images,
            featured
        };

        try {
            if (isEdit) {
                await updateProduct(product.id, productData);
                showToast('Product updated successfully', 'success');
            } else {
                await createProduct(productData);
                showToast('Product created successfully', 'success');
            }
            modal.remove();
            await loadProducts();
        } catch (error) {
            showToast('Error saving product: ' + error.message, 'error');
        }
    });
};

window.editProduct = async (id) => {
    const { getProduct } = await import('../firestore-service.js');
    const product = await getProduct(id);
    if (product) {
        showProductForm(product);
    }
};

window.deleteProductHandler = (id) => {
    if (confirm('Are you sure you want to delete this product?')) {
        deleteProduct(id)
            .then(() => {
                showToast('Product deleted successfully', 'success');
                loadProducts();
            })
            .catch(error => {
                showToast('Error deleting product: ' + error.message, 'error');
            });
    }
};