import { checkAuth } from '../auth-check.js';
import { getProducts, getOrders } from '../firestore-service.js';
import { logoutUser } from '../auth.js';
import { showToast } from '../utils.js';

export default async function renderAdminDashboard() {
    if (!checkAuth()) return;

    const app = document.getElementById('app');
    app.innerHTML = `
    <div class="admin-layout">
      <aside class="admin-sidebar">
        <h3>Admin Panel</h3>
        <a href="index.html" class="active">Dashboard</a>
        <a href="products.html">Products</a>
        <a href="orders.html">Orders</a>
        <hr>
        <a href="#" onclick="handleLogout()" style="color: #ef4444;">Logout</a>
      </aside>
      
      <main class="admin-content">
        <div class="admin-header">
          <h1>Dashboard</h1>
          <p>Welcome back, Admin!</p>
        </div>
        
        <div class="stats-grid" id="statsGrid">
          <div class="stat-card">
            <div class="number" id="totalProducts">...</div>
            <div class="label">Total Products</div>
          </div>
          <div class="stat-card">
            <div class="number" id="totalOrders">...</div>
            <div class="label">Total Orders</div>
          </div>
          <div class="stat-card">
            <div class="number" id="pendingOrders">...</div>
            <div class="label">Pending Orders</div>
          </div>
          <div class="stat-card">
            <div class="number" id="totalRevenue">...</div>
            <div class="label">Total Revenue</div>
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
          <div>
            <h3>Recent Orders</h3>
            <div id="recentOrders">Loading...</div>
          </div>
          <div>
            <h3>Low Stock Alerts</h3>
            <div id="lowStock">Loading...</div>
          </div>
        </div>
      </main>
    </div>
  `;

    // Load stats
    try {
        const products = await getProducts();
        const orders = await getOrders();

        const pendingOrders = orders.filter(o => o.status === 'pending');
        const nonCancelledOrders = orders.filter(o => o.status !== 'cancelled');
        const totalRevenue = nonCancelledOrders.reduce((sum, o) => sum + (o.orderTotal || 0), 0);

        document.getElementById('totalProducts').textContent = products.length;
        document.getElementById('totalOrders').textContent = orders.length;
        document.getElementById('pendingOrders').textContent = pendingOrders.length;
        document.getElementById('totalRevenue').textContent = `$${totalRevenue.toFixed(2)}`;

        // Recent orders
        const recentOrders = orders.slice(0, 5);
        const ordersHtml = recentOrders.length > 0 ? `
      <table>
        <thead>
          <tr>
            <th>Order #</th>
            <th>Customer</th>
            <th>Total</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${recentOrders.map(o => `
            <tr>
              <td><a href="order-detail.html?id=${o.id}">${o.orderNumber}</a></td>
              <td>${o.guestName}</td>
              <td>$${o.orderTotal.toFixed(2)}</td>
              <td><span class="badge badge-${o.status}">${o.status}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    ` : '<p>No recent orders</p>';
        document.getElementById('recentOrders').innerHTML = ordersHtml;

        // Low stock alerts
        const lowStockProducts = products.filter(p => p.stock < 5);
        const lowStockHtml = lowStockProducts.length > 0 ? `
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Stock</th>
          </tr>
        </thead>
        <tbody>
          ${lowStockProducts.map(p => `
            <tr>
              <td>${p.name}</td>
              <td style="color: ${p.stock === 0 ? '#ef4444' : '#f59e0b'}">${p.stock}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    ` : '<p>All products have sufficient stock</p>';
        document.getElementById('lowStock').innerHTML = lowStockHtml;

    } catch (error) {
        console.error('Error loading dashboard:', error);
        showToast('Error loading dashboard data', 'error');
    }
}

window.handleLogout = async () => {
    const result = await logoutUser();
    if (result.success) {
        window.location.href = 'login.html';
    } else {
        showToast('Logout failed: ' + result.error, 'error');
    }
};