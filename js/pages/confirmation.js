import { getOrder } from '../firestore-service.js';

export default async function renderConfirmation() {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('id');

    if (!orderId) {
        window.location.href = '404.html';
        return;
    }

    const app = document.getElementById('app');
    app.innerHTML = '<div class="confirmation-loading">Loading order details...</div>';

    try {
        const order = await getOrder(orderId);
        if (!order) {
            window.location.href = '404.html';
            return;
        }

        app.innerHTML = `
      <div class="confirmation-container">
        <div class="confirmation-header">
          <div class="confirmation-icon">✓</div>
          <h1>Order Confirmed!</h1>
          <p>Thank you for your order, ${order.guestName}!</p>
          <p class="order-number">Order #${order.orderNumber}</p>
        </div>
        
        <div class="confirmation-details">
          <div class="confirmation-section">
            <h3>Order Summary</h3>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${order.items.map(item => `
                  <tr>
                    <td>
                      <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <img src="${item.image || 'https://via.placeholder.com/50'}" 
                             alt="${item.productName}" style="width: 50px; height: 50px; object-fit: cover;">
                        ${item.productName}
                      </div>
                    </td>
                    <td>${item.quantity}</td>
                    <td>$${item.price.toFixed(2)}</td>
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
          
          <div class="confirmation-section">
            <h3>Shipping Information</h3>
            <p><strong>Name:</strong> ${order.guestName}</p>
            <p><strong>Email:</strong> ${order.guestEmail}</p>
            <p><strong>Phone:</strong> ${order.guestPhone}</p>
            <p><strong>Address:</strong> ${order.shippingAddress}</p>
            <p><strong>City:</strong> ${order.shippingCity}</p>
            ${order.notes ? `<p><strong>Notes:</strong> ${order.notes}</p>` : ''}
          </div>
        </div>
        
        <div class="confirmation-actions">
          <a href="index.html" class="btn">Continue Shopping</a>
          <button class="btn btn-secondary" onclick="window.print()">Print Order</button>
        </div>
      </div>
    `;
    } catch (error) {
        console.error('Error loading order:', error);
        showToast('Error loading order details', 'error');
    }
}