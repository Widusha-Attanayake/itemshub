import { db } from './firebase-config.js';
import { collection, doc, addDoc, getDocs, query, where, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

export async function addReview(productId, review) {
    try {
        const reviewData = {
            productId,
            userName: review.name,
            userEmail: review.email,
            rating: review.rating,
            title: review.title,
            content: review.content,
            images: review.images || [],
            verified: review.verified || false,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, 'reviews'), reviewData);
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Error adding review:', error);
        return { success: false, error: error.message };
    }
}

export async function getProductReviews(productId) {
    try {
        const q = query(
            collection(db, 'reviews'),
            where('productId', '==', productId),
            orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error getting reviews:', error);
        return [];
    }
}

export function getAverageRating(reviews) {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((total, r) => total + (r.rating || 0), 0);
    return sum / reviews.length;
}

export function getRatingDistribution(reviews) {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
        if (r.rating >= 1 && r.rating <= 5) {
            distribution[r.rating]++;
        }
    });
    return distribution;
}