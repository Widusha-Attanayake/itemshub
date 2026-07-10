import { checkAuth } from '../auth-check.js';
import { getOrders, updateOrderStatus } from '../firestore-service.js';
import { showToast } from '../utils.js';

let orders = [];
let currentFilter = 'All';

export default async function renderAdminOrders() {
    if (!checkAuth()) return;

    const app = document.getElementById('app');
    app.innerHTML = `
    <div class="admin-layout">
      <aside class="admin-sidebar">
        <h3>Admin Panel</h3>
        <a href="index.html">Dashboard</a>
        <a href="products.html">Products</a>
        <a href="orders.html" class="active">Orders</a>
        <hr>
        <a href="#" onclick="handleLogout()" style="color: #ef4444;">Logout</a>
      </aside>
      
      <main class="admin-content">
        <div class="admin-header">
          <h1>Order Management</h1>
        </div>
        
        <div class="admin-toolbar">
          <div>
            <label>Filter by Status:</label>
            <select id="statusFilter" onchange="filterOrders()">
              <option value="All">All Orders</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <input type="text" id="searchOrders" placeholder="Search by order # or customer..." oninput="filterOrders()">
          </div>
        </div>
        
        <div id="ordersTable" class="table-container">
          Loading...
        </div>
      </main>
    </div>
  `;

    await loadOrders();
}

async function loadOrders() {
    try {
        orders = await getOrders();
        renderOrdersTable();
    } catch (error) {
        console.error('Error loading orders:', error);
        showToast('Error loading orders', 'error');
    }
}

function renderOrdersTable() {
    const container = document.getElementById('ordersTable');

    let filteredOrders = orders;

    // Apply status filter
    if (currentFilter !== 'All') {
        filteredOrders = filteredOrders.filter(o => o.status === currentFilter);
    }

    // Apply search filter
    const search = document.getElementById('searchOrders')?.value.toLowerCase() || '';
    if (search) {
        filteredOrders = filteredOrders.filter(o =>
            o.orderNumber.toLowerCase().includes(search) ||
            o.guestName.toLowerCase().includes(search)
        );
    }

    if (filteredOrders.length === 0) {
        container.innerHTML = '<p>No orders found.</p>';
        return;
    }

    container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Order #</th>
          <th>Customer</th>
          <th>Date</th>
          <th>Total</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${filteredOrders.map(o => `
          <tr>
            <td><strong>${o.orderNumber}</strong></td>
            <td>${o.guestName}</td>
            <td>${o.createdAt ? new Date(o.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</td>
            <td>$${o.orderTotal.toFixed(2)}</td>
            <td><span class="badge badge-${o.status}">${o.status}</span></td>
            <td>
              <a href="order-detail.html?id=${o.id}" class="btn btn-secondary">View</a>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

window.filterOrders = () => {
    currentFilter = document.getElementById('statusFilter').value;
    renderOrdersTable();
};