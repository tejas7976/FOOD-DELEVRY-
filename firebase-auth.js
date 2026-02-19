// Firebase Authentication UI Functions

// Show Login Modal
function showLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'flex';
        // Reset to login form
        showLoginForm();
    }
}

// Close Login Modal
function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'none';
    }
    // Clear form
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    if (emailInput) emailInput.value = '';
    if (passwordInput) passwordInput.value = '';
}

// Show Login Form
function showLoginForm() {
    document.getElementById('loginFormContainer').style.display = 'block';
    document.getElementById('forgotPasswordContainer').style.display = 'none';
    if (document.getElementById('loginModalTitle')) {
        document.getElementById('loginModalTitle').textContent = 'Login / Sign Up';
    }
}

// Show Forgot Password Form
function showForgotPassword() {
    document.getElementById('loginFormContainer').style.display = 'none';
    document.getElementById('forgotPasswordContainer').style.display = 'block';
    if (document.getElementById('loginModalTitle')) {
        document.getElementById('loginModalTitle').textContent = 'Reset Password';
    }
}

// Sign Up with Email (Firebase)
async function signUpWithEmail() {
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
    
    // Show loading
    const signUpBtn = document.getElementById('signUpBtn') || document.querySelector('.signup-submit-btn');
    if (signUpBtn) {
        signUpBtn.disabled = true;
        signUpBtn.textContent = 'Creating Account...';
    }
    
    try {
        const name = email.split('@')[0];
        const result = await firebaseSignUp(email, password, name, '');
        
        if (result.success) {
            closeLoginModal();
            alert('🎉 Account created successfully! Welcome ' + name + '!');
            
            // Send welcome notification
            if (typeof addNotification === 'function') {
                addNotification(
                    '👋 Welcome to FoodExpress!',
                    'Thanks for signing up. Start ordering your favorite food!',
                    'system',
                    'index.html'
                );
            }
        } else {
            // Handle specific errors
            let errorMessage = result.error;
            if (errorMessage.includes('email-already-in-use')) {
                errorMessage = 'This email is already registered. Please login instead.';
            }
            alert('❌ Sign up failed: ' + errorMessage);
        }
    } catch (error) {
        alert('❌ Error: ' + error.message);
    } finally {
        if (signUpBtn) {
            signUpBtn.disabled = false;
            signUpBtn.textContent = 'Sign Up';
        }
    }
}

// Sign In with Email (Firebase)
async function signInWithEmail() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    // Validation
    if (!email || !password) {
        alert('Please enter email and password');
        return;
    }
    
    // Show loading
    const signInBtn = document.getElementById('signInBtn') || document.querySelector('.login-submit-btn');
    if (signInBtn) {
        signInBtn.disabled = true;
        signInBtn.textContent = 'Logging in...';
    }
    
    try {
        const result = await firebaseSignIn(email, password);
        
        if (result.success) {
            closeLoginModal();
            const displayName = result.user.displayName || email.split('@')[0];
            alert('🎉 Welcome back ' + displayName + '!');
        } else {
            // Handle specific errors
            let errorMessage = result.error;
            if (errorMessage.includes('user-not-found')) {
                errorMessage = 'No account found with this email. Please sign up first.';
            } else if (errorMessage.includes('wrong-password')) {
                errorMessage = 'Incorrect password. Please try again.';
            } else if (errorMessage.includes('too-many-requests')) {
                errorMessage = 'Too many failed attempts. Please try again later.';
            }
            alert('❌ Login failed: ' + errorMessage);
        }
    } catch (error) {
        alert('❌ Error: ' + error.message);
    } finally {
        if (signInBtn) {
            signInBtn.disabled = false;
            signInBtn.textContent = 'Login';
        }
    }
}

// Send Password Reset Email (Firebase)
async function sendResetCode() {
    const email = document.getElementById('forgotEmail').value.trim();
    
    if (!email) {
        alert('Please enter your email');
        return;
    }
    
    try {
        const result = await firebaseResetPassword(email);
        
        if (result.success) {
            alert('✅ Password reset email sent!\n\nCheck your inbox (and spam folder) for the reset link.');
            showLoginForm();
        } else {
            alert('❌ Error: ' + result.error);
        }
    } catch (error) {
        alert('❌ Error: ' + error.message);
    }
}

// Logout
async function logout() {
    try {
        const result = await firebaseSignOut();
        
        if (result.success) {
            alert('👋 Logged out successfully!');
            window.location.href = 'index.html';
        } else {
            alert('❌ Logout failed: ' + result.error);
        }
    } catch (error) {
        alert('❌ Error: ' + error.message);
    }
}

// Check if user is logged in
function isLoggedIn() {
    return auth.currentUser !== null;
}

// Get current user info
function getCurrentUserInfo() {
    const user = auth.currentUser;
    if (user) {
        return {
            uid: user.uid,
            email: user.email,
            name: user.displayName || user.email.split('@')[0]
        };
    }
    return null;
}