const CART_KEY = 'myStore_cart';

export function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

export function addToCart(product, quantity = 1) {
  const cart = getCart();
  const existingItem = cart.find(item => item.productId === product.id);

  if (existingItem) {
    const newQty = existingItem.quantity + quantity;
    if (newQty > product.stock) {
      throw new Error('Not enough stock available');
    }
    existingItem.quantity = newQty;
  } else {
    if (quantity > product.stock) {
      throw new Error('Not enough stock available');
    }
    cart.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images && product.images.length > 0 ? product.images[0] : '',
      quantity: quantity,
      maxStock: product.stock
    });
  }

  saveCart(cart);
  return cart;
}

export function removeFromCart(productId) {
  const cart = getCart();
  const filtered = cart.filter(item => item.productId !== productId);
  saveCart(filtered);
  return filtered;
}

export function updateQuantity(productId, quantity) {
  const cart = getCart();
  const item = cart.find(item => item.productId === productId);
  if (!item) return cart;

  if (quantity <= 0) {
    return removeFromCart(productId);
  }

  if (quantity > item.maxStock) {
    throw new Error('Not enough stock available');
  }

  item.quantity = quantity;
  saveCart(cart);
  return cart;
}

export function clearCart() {
  localStorage.removeItem(CART_KEY);
  updateCartBadge();
}

export function getCartTotal() {
  const cart = getCart();
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

export function getCartCount() {
  const cart = getCart();
  return cart.reduce((count, item) => count + item.quantity, 0);
}

export function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  if (badge) {
    badge.textContent = getCartCount();
  }
}

// Initialize badge on page load
document.addEventListener('DOMContentLoaded', updateCartBadge);

