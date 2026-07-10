import { getCart, removeFromCart, updateQuantity, clearCart, getCartTotal } from '../cart.js';

export default function renderCart() {
    const app = document.getElementById('app');
    const cart = getCart();
    const total = getCartTotal();

    if (cart.length === 0) {
        app.innerHTML = `
      <div class="empty-cart">
        <h2>Your Cart is Empty</h2>
        <p>Looks like you haven't added any items to your cart yet.</p>
        <a href="index.html" class="btn">Continue Shopping</a>
      </div>
    `;
        return;
    }

    app.innerHTML = `
    <h2>Shopping Cart</h2>
    <div class="cart-container">
      <div class="cart-items">
        ${cart.map(item => `
          <div class="cart-item" data-id="${item.productId}">
            <img src="${item.image || 'https://via.placeholder.com/100'}" alt="${item.name}">
            <div class="cart-item-info">
              <h3>${item.name}</h3>
              <div class="cart-item-price">$${item.price.toFixed(2)}</div>
              <div class="cart-item-controls">
                <button onclick="updateQty('${item.productId}', ${item.quantity - 1})">-</button>
                <span>${item.quantity}</span>
                <button onclick="updateQty('${item.productId}', ${item.quantity + 1})">+</button>
                <button class="btn-danger" onclick="removeItem('${item.productId}')">Remove</button>
              </div>
            </div>
            <div class="cart-item-total">
              $${(item.price * item.quantity).toFixed(2)}
            </div>
          </div>
        `).join('')}
      </div>
      
      <div class="cart-summary">
        <h3>Order Summary</h3>
        <div class="cart-total">
          <span>Subtotal</span>
          <span>$${total.toFixed(2)}</span>
        </div>
        <div class="cart-total">
          <span>Shipping</span>
          <span>${total >= 50 ? 'Free' : '$5.00'}</span>
        </div>
        <div class="cart-grand-total">
          <span>Total</span>
          <span>$${(total >= 50 ? total : total + 5).toFixed(2)}</span>
        </div>
        <div class="cart-actions">
          <button class="btn btn-block" onclick="proceedToCheckout()">Proceed to Checkout</button>
          <button class="btn btn-secondary btn-block" onclick="clearCartConfirm()">Clear Cart</button>
        </div>
      </div>
    </div>
  `;

    // Expose functions
    window.updateQty = (productId, newQty) => {
        try {
            updateQuantity(productId, newQty);
            renderCart();
        } catch (error) {
            showToast(error.message, 'error');
        }
    };

    window.removeItem = (productId) => {
        removeFromCart(productId);
        renderCart();
        showToast('Item removed from cart', 'success');
    };

    window.clearCartConfirm = () => {
        if (confirm('Are you sure you want to clear your cart?')) {
            clearCart();
            renderCart();
            showToast('Cart cleared', 'success');
        }
    };

    window.proceedToCheckout = () => {
        window.location.href = 'checkout.html';
    };
}