// Firebase Configuration for FoodExpress
// This file initializes Firebase services

// Firebase CDN imports (using compat version for easier setup)
// These are loaded via script tags in HTML

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCezNDpEfqehBBXQgSj1AilGQWRhRqnbSY",
    authDomain: "foodexpress-f878f.firebaseapp.com",
    projectId: "foodexpress-f878f",
    storageBucket: "foodexpress-f878f.firebasestorage.app",
    messagingSenderId: "543718087569",
    appId: "1:543718087569:web:d984198125b54ff8905830",
    measurementId: "G-BCJQ4BE5QV"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();

// Log successful initialization
console.log('🔥 Firebase initialized successfully!');

// ==================== AUTHENTICATION FUNCTIONS ====================

// Sign Up with Email
async function firebaseSignUp(email, password, name, phone) {
    try {
        // Create user in Firebase Auth
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Update display name
        await user.updateProfile({
            displayName: name
        });
        
        // Save user data to Firestore
        await db.collection('users').doc(user.uid).set({
            uid: user.uid,
            email: email,
            name: name,
            phone: phone || '',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        console.log('✅ User signed up:', email);
        return { success: true, user: user };
        
    } catch (error) {
        console.error('❌ Sign up error:', error);
        return { success: false, error: error.message };
    }
}

// Sign In with Email
async function firebaseSignIn(email, password) {
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Update last login time
        await db.collection('users').doc(user.uid).update({
            lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
            isOnline: true
        });
        
        console.log('✅ User signed in:', email);
        return { success: true, user: user };
        
    } catch (error) {
        console.error('❌ Sign in error:', error);
        return { success: false, error: error.message };
    }
}

// Sign Out
async function firebaseSignOut() {
    try {
        const user = auth.currentUser;
        
        // Update online status before signing out
        if (user) {
            await db.collection('users').doc(user.uid).update({
                isOnline: false
            });
        }
        
        await auth.signOut();
        console.log('✅ User signed out');
        return { success: true };
        
    } catch (error) {
        console.error('❌ Sign out error:', error);
        return { success: false, error: error.message };
    }
}

// Get Current User
function getCurrentUser() {
    return auth.currentUser;
}

// Password Reset
async function firebaseResetPassword(email) {
    try {
        await auth.sendPasswordResetEmail(email);
        console.log('✅ Password reset email sent to:', email);
        return { success: true };
    } catch (error) {
        console.error('❌ Password reset error:', error);
        return { success: false, error: error.message };
    }
}

// ==================== USER DATA FUNCTIONS ====================

// Get User Data from Firestore
async function getUserData(uid) {
    try {
        const doc = await db.collection('users').doc(uid).get();
        if (doc.exists) {
            return { success: true, data: doc.data() };
        } else {
            return { success: false, error: 'User not found' };
        }
    } catch (error) {
        console.error('❌ Get user data error:', error);
        return { success: false, error: error.message };
    }
}

// Update User Profile
async function updateUserProfile(uid, data) {
    try {
        await db.collection('users').doc(uid).update(data);
        console.log('✅ User profile updated');
        return { success: true };
    } catch (error) {
        console.error('❌ Update profile error:', error);
        return { success: false, error: error.message };
    }
}

// ==================== ORDERS FUNCTIONS ====================

// Create Order
async function createOrder(orderData) {
    try {
        const user = auth.currentUser;
        if (!user) {
            return { success: false, error: 'User not logged in' };
        }
        
        const orderId = 'ORD' + Date.now();
        
        const order = {
            id: orderId,
            ...orderData,
            userId: user.uid,
            userEmail: user.email,
            status: 'pending',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('orders').doc(orderId).set(order);
        
        console.log('✅ Order created:', orderId);
        return { success: true, orderId: orderId };
        
    } catch (error) {
        console.error('❌ Create order error:', error);
        return { success: false, error: error.message };
    }
}

// Get User Orders
async function getUserOrders(userId) {
    try {
        const snapshot = await db.collection('orders')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .get();
        
        const orders = [];
        snapshot.forEach(doc => {
            orders.push({ id: doc.id, ...doc.data() });
        });
        
        return { success: true, orders: orders };
        
    } catch (error) {
        console.error('❌ Get orders error:', error);
        return { success: false, error: error.message };
    }
}

// Get All Orders (Admin)
async function getAllOrders() {
    try {
        const snapshot = await db.collection('orders')
            .orderBy('createdAt', 'desc')
            .get();
        
        const orders = [];
        snapshot.forEach(doc => {
            orders.push({ id: doc.id, ...doc.data() });
        });
        
        return { success: true, orders: orders };
        
    } catch (error) {
        console.error('❌ Get all orders error:', error);
        return { success: false, error: error.message };
    }
}

// Update Order Status
async function updateOrderStatus(orderId, status) {
    try {
        await db.collection('orders').doc(orderId).update({
            status: status,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        console.log('✅ Order status updated:', orderId, status);
        return { success: true };
        
    } catch (error) {
        console.error('❌ Update order status error:', error);
        return { success: false, error: error.message };
    }
}

// ==================== ADDRESS FUNCTIONS ====================

// Add Address
async function addAddress(addressData) {
    try {
        const user = auth.currentUser;
        if (!user) {
            return { success: false, error: 'User not logged in' };
        }
        
        const addressId = 'ADDR' + Date.now();
        
        const address = {
            id: addressId,
            ...addressData,
            userId: user.uid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('addresses').doc(addressId).set(address);
        
        console.log('✅ Address added:', addressId);
        return { success: true, addressId: addressId };
        
    } catch (error) {
        console.error('❌ Add address error:', error);
        return { success: false, error: error.message };
    }
}

// Get User Addresses
async function getUserAddresses(userId) {
    try {
        const snapshot = await db.collection('addresses')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .get();
        
        const addresses = [];
        snapshot.forEach(doc => {
            addresses.push({ id: doc.id, ...doc.data() });
        });
        
        return { success: true, addresses: addresses };
        
    } catch (error) {
        console.error('❌ Get addresses error:', error);
        return { success: false, error: error.message };
    }
}

// Delete Address
async function deleteAddress(addressId) {
    try {
        await db.collection('addresses').doc(addressId).delete();
        console.log('✅ Address deleted:', addressId);
        return { success: true };
    } catch (error) {
        console.error('❌ Delete address error:', error);
        return { success: false, error: error.message };
    }
}

// ==================== ADMIN FUNCTIONS ====================

// Get All Users (Admin)
async function getAllUsers() {
    try {
        const snapshot = await db.collection('users')
            .orderBy('createdAt', 'desc')
            .get();
        
        const users = [];
        snapshot.forEach(doc => {
            users.push({ id: doc.id, ...doc.data() });
        });
        
        return { success: true, users: users };
        
    } catch (error) {
        console.error('❌ Get all users error:', error);
        return { success: false, error: error.message };
    }
}

// Delete User (Admin)
async function deleteUser(uid) {
    try {
        // Delete user data from Firestore
        await db.collection('users').doc(uid).delete();
        
        // Delete user's orders
        const ordersSnapshot = await db.collection('orders').where('userId', '==', uid).get();
        const batch = db.batch();
        ordersSnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });
        
        // Delete user's addresses
        const addressesSnapshot = await db.collection('addresses').where('userId', '==', uid).get();
        addressesSnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });
        
        await batch.commit();
        
        console.log('✅ User deleted:', uid);
        return { success: true };
        
    } catch (error) {
        console.error('❌ Delete user error:', error);
        return { success: false, error: error.message };
    }
}

// Get Stats (Admin)
async function getAdminStats() {
    try {
        // Get total users
        const usersSnapshot = await db.collection('users').get();
        const totalUsers = usersSnapshot.size;
        
        // Get online users
        const onlineSnapshot = await db.collection('users').where('isOnline', '==', true).get();
        const onlineUsers = onlineSnapshot.size;
        
        // Get total orders
        const ordersSnapshot = await db.collection('orders').get();
        const totalOrders = ordersSnapshot.size;
        
        // Get today's signups
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todaySignupsSnapshot = await db.collection('users')
            .where('createdAt', '>=', today)
            .get();
        const todaySignups = todaySignupsSnapshot.size;
        
        return {
            success: true,
            stats: {
                totalUsers,
                onlineUsers,
                totalOrders,
                todaySignups
            }
        };
        
    } catch (error) {
        console.error('❌ Get stats error:', error);
        return { success: false, error: error.message };
    }
}

// ==================== CART FUNCTIONS ====================

// Save Cart to Firebase
async function saveCart(cartItems) {
    try {
        const user = auth.currentUser;
        if (!user) return { success: false, error: 'User not logged in' };
        
        await db.collection('carts').doc(user.uid).set({
            items: cartItems,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        return { success: true };
    } catch (error) {
        console.error('❌ Save cart error:', error);
        return { success: false, error: error.message };
    }
}

// Get Cart from Firebase
async function getCart() {
    try {
        const user = auth.currentUser;
        if (!user) return { success: false, error: 'User not logged in' };
        
        const doc = await db.collection('carts').doc(user.uid).get();
        if (doc.exists) {
            return { success: true, items: doc.data().items || [] };
        }
        return { success: true, items: [] };
    } catch (error) {
        console.error('❌ Get cart error:', error);
        return { success: false, error: error.message };
    }
}

// ==================== AUTH STATE LISTENER ====================

// Listen for auth state changes
auth.onAuthStateChanged(async (user) => {
    if (user) {
        console.log('👤 User logged in:', user.email);
        
        // Update UI for logged in user
        updateUIForLoggedInUser(user);
        
    } else {
        console.log('👤 User logged out');
        
        // Update UI for logged out user
        updateUIForLoggedOutUser();
    }
});

// Update UI for logged in user
function updateUIForLoggedInUser(user) {
    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn) {
        const displayName = user.displayName || user.email.split('@')[0];
        loginBtn.textContent = displayName.length > 12 ? displayName.substring(0, 12) + '...' : displayName;
        loginBtn.onclick = () => window.location.href = 'profile.html';
    }
}

// Update UI for logged out user
function updateUIForLoggedOutUser() {
    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn) {
        loginBtn.textContent = 'Login';
        loginBtn.onclick = showLoginModal;
    }
}