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
        // Show login form, hide forgot password form
        showLoginForm();
    }
}

// Close login modal
function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'none';
    }
    // Reset forms
    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');
    if (loginEmail) loginEmail.value = '';
    if (loginPassword) loginPassword.value = '';
    
    // Reset forgot password forms
    resetForgotPasswordForms();
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
        password: password,
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
    
    alert('Welcome back ' + (user.name || user.email.split('@')[0]) + '! 🎉');
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
                // Go to profile page instead of just logout
                window.location.href = 'profile.html';
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

// ==================== FORGOT PASSWORD FUNCTIONS ====================

let resetEmail = '';
let resetCode = '';

// Show Forgot Password Form
function showForgotPassword() {
    document.getElementById('loginFormContainer').style.display = 'none';
    document.getElementById('forgotPasswordContainer').style.display = 'block';
    document.getElementById('verifyCodeContainer').style.display = 'none';
    document.getElementById('newPasswordContainer').style.display = 'none';
    
    // Clear any previous data
    document.getElementById('forgotEmail').value = '';
    resetEmail = '';
    resetCode = '';
}

// Show Login Form (go back)
function showLoginForm() {
    document.getElementById('loginFormContainer').style.display = 'block';
    document.getElementById('forgotPasswordContainer').style.display = 'none';
    document.getElementById('verifyCodeContainer').style.display = 'none';
    document.getElementById('newPasswordContainer').style.display = 'none';
}

// Reset all forgot password forms
function resetForgotPasswordForms() {
    const forgotEmail = document.getElementById('forgotEmail');
    const verifyCode = document.getElementById('verifyCode');
    const newPassword = document.getElementById('newPassword');
    const confirmNewPassword = document.getElementById('confirmNewPassword');
    
    if (forgotEmail) forgotEmail.value = '';
    if (verifyCode) verifyCode.value = '';
    if (newPassword) newPassword.value = '';
    if (confirmNewPassword) confirmNewPassword.value = '';
    
    resetEmail = '';
    resetCode = '';
    
    showLoginForm();
}

// Send Reset Code
function sendResetCode() {
    const email = document.getElementById('forgotEmail').value.trim();
    
    if (!email) {
        alert('Please enter your email address');
        return;
    }
    
    if (!email.includes('@')) {
        alert('Please enter a valid email address');
        return;
    }
    
    // Check if email exists
    const users = getAllUsers();
    const user = users.find(u => u.email === email);
    
    if (!user) {
        alert('No account found with this email address');
        return;
    }
    
    // Generate 6-digit code
    resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    resetEmail = email;
    
    // In a real app, you would send this code via email
    // For this demo, we'll show it in an alert
    alert('🔐 Password Reset Code\n\nYour verification code is: ' + resetCode + '\n\n(In a real app, this would be sent to your email)');
    
    // Show verify code form
    document.getElementById('forgotPasswordContainer').style.display = 'none';
    document.getElementById('verifyCodeContainer').style.display = 'block';
    
    // Show which email the code was sent to
    document.getElementById('resetEmailDisplay').textContent = email;
}

// Verify Reset Code
function verifyResetCode() {
    const enteredCode = document.getElementById('verifyCode').value.trim();
    
    if (!enteredCode) {
        alert('Please enter the verification code');
        return;
    }
    
    if (enteredCode !== resetCode) {
        alert('Invalid verification code. Please try again.');
        return;
    }
    
    // Code is correct, show new password form
    document.getElementById('verifyCodeContainer').style.display = 'none';
    document.getElementById('newPasswordContainer').style.display = 'block';
}

// Resend Reset Code
function resendResetCode() {
    if (!resetEmail) {
        showForgotPassword();
        return;
    }
    
    // Generate new code
    resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    alert('🔐 New Verification Code\n\nYour new code is: ' + resetCode + '\n\n(In a real app, this would be sent to your email)');
}

// Reset Password (set new password)
function resetPassword() {
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;
    
    if (!newPassword || !confirmNewPassword) {
        alert('Please fill in all fields');
        return;
    }
    
    if (newPassword.length < 6) {
        alert('Password must be at least 6 characters');
        return;
    }
    
    if (newPassword !== confirmNewPassword) {
        alert('Passwords do not match');
        return;
    }
    
    // Update password in registered users
    const users = getAllUsers();
    const userIndex = users.findIndex(u => u.email === resetEmail);
    
    if (userIndex === -1) {
        alert('Error: User not found. Please try again.');
        resetForgotPasswordForms();
        return;
    }
    
    users[userIndex].password = newPassword;
    saveAllUsers(users);
    
    // Clear reset data
    resetEmail = '';
    resetCode = '';
    
    alert('🎉 Password reset successful!\n\nYou can now login with your new password.');
    
    // Go back to login form
    showLoginForm();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadCurrentUser();
    
    // Setup login button
    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn && !currentUser) {
        loginBtn.onclick = showLoginModal;
    }
});