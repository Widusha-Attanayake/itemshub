import { getCart, getCartTotal, clearCart } from '../cart.js';
import { createOrder, generateOrderNumber, updateStock } from '../firestore-service.js';
import { showToast } from '../utils.js';

export default function renderCheckout() {
    const cart = getCart();
    const total = getCartTotal();

    if (cart.length === 0) {
        window.location.href = 'cart.html';
        return;
    }

    const app = document.getElementById('app');
    app.innerHTML = `
    <h2>Checkout</h2>
    <div class="checkout-container">
      <form id="checkoutForm" class="checkout-form">
        <div class="form-row">
          <div class="form-group">
            <label for="guestName">Full Name *</label>
            <input type="text" id="guestName" required>
          </div>
          <div class="form-group">
            <label for="guestEmail">Email *</label>
            <input type="email" id="guestEmail" required>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="guestPhone">Phone *</label>
            <input type="tel" id="guestPhone" required>
          </div>
          <div class="form-group">
            <label for="shippingCity">City *</label>
            <input type="text" id="shippingCity" required>
          </div>
        </div>
        <div class="form-group">
          <label for="shippingAddress">Shipping Address *</label>
          <textarea id="shippingAddress" required></textarea>
        </div>
        <div class="form-group">
          <label for="notes">Order Notes</label>
          <textarea id="notes"></textarea>
        </div>
        
        <button type="submit" class="btn btn-block" id="placeOrder">
          Place Order
        </button>
      </form>
      
      <div class="checkout-summary">
        <h3>Order Summary</h3>
        ${cart.map(item => `
          <div class="checkout-item">
            <span>${item.name} × ${item.quantity}</span>
            <span>$${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        `).join('')}
        <hr>
        <div class="checkout-total">
          <span>Subtotal</span>
          <span>$${total.toFixed(2)}</span>
        </div>
        <div class="checkout-total">
          <span>Shipping</span>
          <span>${total >= 50 ? 'Free' : '$5.00'}</span>
        </div>
        <div class="checkout-grand-total">
          <span>Total</span>
          <span>$${(total >= 50 ? total : total + 5).toFixed(2)}</span>
        </div>
      </div>
    </div>
  `;

    // Handle form submission
    document.getElementById('checkoutForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('placeOrder');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Processing...';

        try {
            // Validate form
            const name = document.getElementById('guestName').value.trim();
            const email = document.getElementById('guestEmail').value.trim();
            const phone = document.getElementById('guestPhone').value.trim();
            const address = document.getElementById('shippingAddress').value.trim();
            const city = document.getElementById('shippingCity').value.trim();
            const notes = document.getElementById('notes').value.trim();

            if (!name || !email || !phone || !address || !city) {
                throw new Error('Please fill in all required fields');
            }

            // Validate email
            if (!email.includes('@')) {
                throw new Error('Please enter a valid email address');
            }

            // Check stock
            for (const item of cart) {
                const { getProduct } = await import('../firestore-service.js');
                const product = await getProduct(item.productId);
                if (!product) {
                    throw new Error(`Product "${item.name}" no longer exists`);
                }
                if (product.stock < item.quantity) {
                    throw new Error(`Not enough stock for "${item.name}". Available: ${product.stock}`);
                }
            }

            // Generate order number
            const orderNumber = await generateOrderNumber();

            // Create order
            const orderData = {
                orderNumber,
                guestName: name,
                guestEmail: email,
                guestPhone: phone,
                shippingAddress: address,
                shippingCity: city,
                items: cart.map(item => ({
                    productId: item.productId,
                    productName: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    image: item.image
                })),
                subtotal: total,
                orderTotal: total >= 50 ? total : total + 5,
                notes: notes || '',
                status: 'pending'
            };

            const orderId = await createOrder(orderData);

            // Update stock
            for (const item of cart) {
                await updateStock(item.productId, item.quantity, 'decrement');
            }

            // Clear cart
            clearCart();

            // Redirect to confirmation
            window.location.href = `confirmation.html?id=${orderId}`;

        } catch (error) {
            showToast(error.message, 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Place Order';
        }
    });
}