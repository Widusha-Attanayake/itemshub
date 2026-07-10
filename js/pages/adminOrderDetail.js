import { checkAuth } from '../auth-check.js';
import { getOrder, updateOrderStatus, updateStock } from '../firestore-service.js';
import { showToast } from '../utils.js';

export default async function renderAdminOrderDetail() {
    if (!checkAuth()) return;

    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('id');

    if (!orderId) {
        window.location.href = 'orders.html';
        return;
    }

    const app = document.getElementById('app');
    app.innerHTML = `
    <div class="admin-layout">
      <aside class="admin-sidebar">
        <h3>Admin Panel</h3>
        <a href="index.html">Dashboard</a>
        <a href="products.html">Products</a>
        <a href="orders.html">Orders</a>
        <hr>
        <a href="#" onclick="handleLogout()" style="color: #ef4444;">Logout</a>
      </aside>
      
      <main class="admin-content">
        <div id="orderDetail">
          Loading order details...
        </div>
      </main>
    </div>
  `;

    try {
        const order = await getOrder(orderId);
        if (!order) {
            document.getElementById('orderDetail').innerHTML = '<p>Order not found.</p>';
            return;
        }

        renderOrderDetail(order);
    } catch (error) {
        console.error('Error loading order:', error);
        showToast('Error loading order details', 'error');
    }
}

function renderOrderDetail(order) {
    const container = document.getElementById('orderDetail');

    container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 2rem;">
      <div>
        <h1>Order #${order.orderNumber}</h1>
        <p>Placed on ${order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleString() : 'N/A'}</p>
      </div>
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
        <button class="btn btn-success" onclick="updateStatus('${order.id}', 'confirmed')">Confirm</button>
        <button class="btn" onclick="updateStatus('${order.id}', 'shipped')">Ship</button>
        <button class="btn btn-secondary" onclick="updateStatus('${order.id}', 'delivered')">Deliver</button>
        <button class="btn btn-danger" onclick="cancelOrder('${order.id}')">Cancel</button>
      </div>
    </div>
    
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
      <div>
        <h3>Customer Information</h3>
        <p><strong>Name:</strong> ${order.guestName}</p>
        <p><strong>Email:</strong> ${order.guestEmail}</p>
        <p><strong>Phone:</strong> ${order.guestPhone}</p>
        <p><strong>Address:</strong> ${order.shippingAddress}</p>
        <p><strong>City:</strong> ${order.shippingCity}</p>
        ${order.notes ? `<p><strong>Notes:</strong> ${order.notes}</p>` : ''}
      </div>
      <div>
        <h3>Order Status</h3>
        <p><strong>Status:</strong> <span class="badge badge-${order.status}">${order.status}</span></p>
        <p><strong>Items:</strong> ${order.items.length}</p>
        <p><strong>Subtotal:</strong> $${order.subtotal.toFixed(2)}</p>
        <p><strong>Total:</strong> $${order.orderTotal.toFixed(2)}</p>
      </div>
    </div>
    
    <h3>Order Items</h3>
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${order.items.map(item => `
            <tr>
              <td>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <img src="${item.image || 'https://via.placeholder.com/50'}" 
                       alt="${item.productName}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;">
                  ${item.productName}
                </div>
              </td>
              <td>$${item.price.toFixed(2)}</td>
              <td>${item.quantity}</td>
              <td>$${(item.price * item.quantity).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3"><strong>Subtotal</strong></td>
            <td>$${order.subtotal.toFixed(2)}</td>
          </tr>
          <tr>
            <td colspan="3"><strong>Total</strong></td>
            <td><strong>$${order.orderTotal.toFixed(2)}</strong></td>
          </tr>
        </tfoot>
      </table>
    </div>
  `;
}

window.updateStatus = async (orderId, status) => {
    try {
        await updateOrderStatus(orderId, status);
        showToast(`Order status updated to ${status}`, 'success');
        // Reload
        renderAdminOrderDetail();
    } catch (error) {
        showToast('Error updating order status: ' + error.message, 'error');
    }
};

window.cancelOrder = async (orderId) => {
    if (!confirm('Are you sure you want to cancel this order? This will restore stock.')) return;

    try {
        const order = await getOrder(orderId);
        if (!order) {
            showToast('Order not found', 'error');
            return;
        }

        // Restore stock for each item
        for (const item of order.items) {
            await updateStock(item.productId, item.quantity, 'increment');
        }

        await updateOrderStatus(orderId, 'cancelled');
        showToast('Order cancelled and stock restored', 'success');
        renderAdminOrderDetail();
    } catch (error) {
        showToast('Error cancelling order: ' + error.message, 'error');
    }
};