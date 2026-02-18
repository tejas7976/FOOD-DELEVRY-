// Cart array to store items
let cart = [];

// Load cart from localStorage when page loads
function loadCart() {
    const savedCart = localStorage.getItem('foodDeliveryCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('foodDeliveryCart', JSON.stringify(cart));
}

// Add item to cart
function addToCart(itemName, itemPrice) {
    // Check if item already exists in cart
    const existingItem = cart.find(item => item.name === itemName);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: itemName,
            price: itemPrice,
            quantity: 1
        });
    }
    
    saveCart(); // Save to localStorage
    updateCart();
    showToast(`${itemName} added to cart! 🎉`);
}

// Remove item from cart
function removeFromCart(itemName) {
    cart = cart.filter(item => item.name !== itemName);
    saveCart(); // Save to localStorage
    updateCart();
    showToast(`${itemName} removed from cart`);
}

// Update quantity
function updateQuantity(itemName, change) {
    const item = cart.find(item => item.name === itemName);
    
    if (item) {
        item.quantity += change;
        
        if (item.quantity <= 0) {
            removeFromCart(itemName);
        } else {
            saveCart(); // Save to localStorage
            updateCart();
        }
    }
}

// Clear entire cart
function clearCart() {
    if (confirm('Are you sure you want to clear your cart?')) {
        cart = [];
        saveCart();
        updateCart();
        showToast('Cart cleared!');
    }
}

// Update cart display
function updateCart() {
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotalContainer = document.getElementById('cartTotal');
    const cartCountBadge = document.querySelector('.cart-count');
    
    // Clear current cart display
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        if (cartTotalContainer) {
            cartTotalContainer.style.display = 'none';
        }
        if (cartCountBadge) {
            cartCountBadge.textContent = '0';
        }
        return;
    }
    
    // Display cart items
    cart.forEach(item => {
        const cartItemHTML = `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p class="cart-item-price">₹${item.price} × ${item.quantity}</p>
                </div>
                <div class="cart-item-controls">
                    <button class="quantity-btn" onclick="updateQuantity('${item.name}', -1)">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity('${item.name}', 1)">+</button>
                </div>
            </div>
        `;
        cartItemsContainer.innerHTML += cartItemHTML;
    });
    
    // Calculate totals
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = subtotal > 0 ? 40 : 0;
    const grandTotal = subtotal + deliveryFee;
    
    // Update totals
    const subtotalElement = document.getElementById('subtotal');
    const grandTotalElement = document.getElementById('grandTotal');
    
    if (subtotalElement) {
        subtotalElement.textContent = `₹${subtotal}`;
    }
    if (grandTotalElement) {
        grandTotalElement.textContent = `₹${grandTotal}`;
    }
    
    // Show cart total section
    if (cartTotalContainer) {
        cartTotalContainer.style.display = 'block';
    }
    
    // Update cart count badge
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCountBadge) {
        cartCountBadge.textContent = totalItems;
    }
}

// Show toast notification
function showToast(message) {
    // Remove any existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    // Hide and remove toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// Show checkout modal
function showCheckout() {
    if (cart.length === 0) {
        showToast('Your cart is empty!');
        return;
    }
    
    const modal = document.getElementById('checkoutModal');
    if (modal) {
        modal.style.display = 'flex';
        updateOrderSummary();
    }
}

// Close checkout modal
function closeCheckout() {
    const modal = document.getElementById('checkoutModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Update order summary in modal
function updateOrderSummary() {
    const summaryContainer = document.getElementById('orderSummary');
    if (!summaryContainer) return;
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = 40;
    const grandTotal = subtotal + deliveryFee;
    
    let itemsHTML = '';
    cart.forEach(item => {
        itemsHTML += `
            <div class="summary-item">
                <span>${item.name} × ${item.quantity}</span>
                <span>₹${item.price * item.quantity}</span>
            </div>
        `;
    });
    
    summaryContainer.innerHTML = `
        ${itemsHTML}
        <div class="summary-divider"></div>
        <div class="summary-item">
            <span>Subtotal</span>
            <span>₹${subtotal}</span>
        </div>
        <div class="summary-item">
            <span>Delivery Fee</span>
            <span>₹${deliveryFee}</span>
        </div>
        <div class="summary-item summary-total">
            <span>Total</span>
            <span>₹${grandTotal}</span>
        </div>
    `;
}

// Place order
function placeOrder() {
    const name = document.getElementById('customerName').value;
    const phone = document.getElementById('customerPhone').value;
    const address = document.getElementById('customerAddress').value;
    
    if (!name || !phone || !address) {
        showToast('Please fill all delivery details!');
        return;
    }
    
    // Simulate order placement
    showToast('🎉 Order placed successfully!');
    
    // Clear cart
    cart = [];
    saveCart();
    updateCart();
    
    // Close modal
    closeCheckout();
    
    // Clear form
    document.getElementById('customerName').value = '';
    document.getElementById('customerPhone').value = '';
    document.getElementById('customerAddress').value = '';
    
    // In a real app, you would send this to a backend server
    console.log('Order placed:', { name, phone, address, items: cart });
}

// Initialize cart on page load
document.addEventListener('DOMContentLoaded', function() {
    loadCart(); // Load saved cart
    updateCart(); // Update display
    
    // Add event listener to checkout button if it exists
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', showCheckout);
    }
});