import { db } from './firebase-config.js';
import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, serverTimestamp, runTransaction
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

// PRODUCTS
export const productsCollection = collection(db, 'products');

export async function getProducts(filters = {}) {
  try {
    let q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));

    if (filters.category) {
      q = query(q, where('category', '==', filters.category));
    }
    if (filters.featured !== undefined) {
      q = query(q, where('featured', '==', filters.featured));
    }
    if (filters.limit) {
      q = query(q, limit(filters.limit));
    }

    const snapshot = await getDocs(q);
    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log('📦 getProducts returned:', products.length, 'products');
    return products;
  } catch (error) {
    console.error('❌ Error in getProducts:', error);
    throw error;
  }
}

export async function getProduct(id) {
  const docRef = doc(db, 'products', id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() };
}

export async function createProduct(data) {
  const docRef = await addDoc(productsCollection, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
}

export async function updateProduct(id, data) {
  const docRef = doc(db, 'products', id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp()
  });
}

export async function deleteProduct(id) {
  const docRef = doc(db, 'products', id);
  await deleteDoc(docRef);
}

// ORDERS
export const ordersCollection = collection(db, 'orders');

export async function createOrder(data) {
  const orderData = {
    ...data,
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  const docRef = await addDoc(ordersCollection, orderData);
  return docRef.id;
}

export async function getOrders(filters = {}) {
  let q = query(ordersCollection, orderBy('createdAt', 'desc'));

  if (filters.status && filters.status !== 'All') {
    q = query(q, where('status', '==', filters.status));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getOrder(id) {
  const docRef = doc(db, 'orders', id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() };
}

export async function updateOrderStatus(id, status) {
  const docRef = doc(db, 'orders', id);
  await updateDoc(docRef, {
    status: status,
    updatedAt: serverTimestamp()
  });
}

// STOCK MANAGEMENT
export async function updateStock(productId, quantity, operation = 'decrement') {
  const productRef = doc(db, 'products', productId);

  await runTransaction(db, async (transaction) => {
    const productDoc = await transaction.get(productRef);
    if (!productDoc.exists()) {
      throw new Error('Product does not exist!');
    }

    const currentStock = productDoc.data().stock;
    const newStock = operation === 'decrement'
      ? currentStock - quantity
      : currentStock + quantity;

    if (newStock < 0) {
      throw new Error('Insufficient stock!');
    }

    transaction.update(productRef, { stock: newStock });
  });
}

// GENERATE ORDER NUMBER
export async function generateOrderNumber() {
  const snapshot = await getDocs(query(ordersCollection, orderBy('createdAt', 'desc'), limit(1)));
  if (snapshot.empty) {
    return 'ORD-0001';
  }
  const lastOrder = snapshot.docs[0].data();
  const lastNumber = parseInt(lastOrder.orderNumber.split('-')[1]);
  const newNumber = String(lastNumber + 1).padStart(4, '0');
  return `ORD-${newNumber}`;
}