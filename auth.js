// Simple Authentication System (No Firebase)
let currentUser = null;

// Load current user from localStorage
function loadCurrentUser() {
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
        currentUser = JSON.parse(userJson);
        updateUIForUser(currentUser);
    }
}

// Save user to localStorage
function saveUser(user) {
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    updateUIForUser(user);
}

// Get all registered users
function getAllUsers() {
    const usersJson = localStorage.getItem('registeredUsers');
    return usersJson ? JSON.parse(usersJson) : [];
}

// Save all users
function saveAllUsers(users) {
    localStorage.setItem('registeredUsers', JSON.stringify(users));
}

// Show login modal
function showLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

// Close login modal
function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'none';
    }
    // Clear inputs
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
}

// Sign Up with Email/Password
function signUpWithEmail() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    // Validation
    if (!email || !password) {
        alert('Please enter email and password');
        return;
    }
    
    if (!email.includes('@')) {
        alert('Please enter a valid email');
        return;
    }
    
    if (password.length < 6) {
        alert('Password must be at least 6 characters');
        return;
    }
    
    // Check if user already exists
    const users = getAllUsers();
    const existingUser = users.find(u => u.email === email);
    
    if (existingUser) {
        alert('Email already registered! Please login instead.');
        return;
    }
    
    // Create new user
    const newUser = {
        email: email,
        password: password, // In real app, this should be hashed!
        name: email.split('@')[0],
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    saveAllUsers(users);
    
    // Auto login
    saveUser(newUser);
    closeLoginModal();
    
    alert('Account created successfully! Welcome ' + newUser.name + '! 🎉');
}

// Login with Email/Password
function signInWithEmail() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    // Validation
    if (!email || !password) {
        alert('Please enter email and password');
        return;
    }
    
    // Find user
    const users = getAllUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
        alert('Invalid email or password');
        return;
    }
    
    // Login successful
    saveUser(user);
    closeLoginModal();
    
    alert('Welcome back ' + user.name + '! 🎉');
}

// Logout
function logout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    
    // Clear cart
    if (typeof cart !== 'undefined') {
        cart = [];
        if (typeof saveCart === 'function') saveCart();
        if (typeof updateCart === 'function') updateCart();
    }
    
    updateUIForUser(null);
    alert('Logged out successfully');
}

// Update UI based on user state
function updateUIForUser(user) {
    const loginBtn = document.querySelector('.login-btn');
    
    if (user) {
        // User is logged in
        if (loginBtn) {
            const displayName = user.name || user.email.split('@')[0];
            loginBtn.textContent = displayName.length > 15 ? displayName.substring(0, 15) + '...' : displayName;
            loginBtn.onclick = function() {
                if (confirm('Logout from ' + displayName + '?')) {
                    logout();
                }
            };
        }
    } else {
        // User is logged out
        if (loginBtn) {
            loginBtn.textContent = 'Login';
            loginBtn.onclick = showLoginModal;
        }
    }
}

// Load user-specific cart
function loadUserCart() {
    if (currentUser && typeof cart !== 'undefined') {
        const userCartKey = 'cart_' + currentUser.email;
        const savedCart = localStorage.getItem(userCartKey);
        if (savedCart) {
            cart = JSON.parse(savedCart);
            if (typeof updateCart === 'function') updateCart();
        }
    }
}

// Override saveCart to save per user
window.saveCart = function() {
    if (typeof cart !== 'undefined') {
        if (currentUser) {
            const userCartKey = 'cart_' + currentUser.email;
            localStorage.setItem(userCartKey, JSON.stringify(cart));
        } else {
            localStorage.setItem('foodDeliveryCart', JSON.stringify(cart));
        }
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadCurrentUser();
    
    // Setup login button
    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn && !currentUser) {
        loginBtn.onclick = showLoginModal;
    }
});