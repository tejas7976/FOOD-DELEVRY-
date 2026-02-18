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

// Place order - UPDATED to save order history
function placeOrder() {
    const name = document.getElementById('customerName').value;
    const phone = document.getElementById('customerPhone').value;
    const address = document.getElementById('customerAddress').value;
    
    if (!name || !phone || !address) {
        alert('Please fill all delivery details!');
        return;
    }

    // Get current user
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Create order object
    const order = {
        id: 'ORD' + Date.now(),
        items: [...cart],
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 40, // +40 delivery
        name: name,
        phone: phone,
        address: address,
        restaurant: 'Pizza Paradise', // You can make this dynamic later
        date: new Date().toISOString(),
        status: 'pending' // pending, delivered, cancelled
    };

    // Save order to user's order history
    if (currentUser) {
        const ordersKey = 'orders_' + currentUser.email;
        const orders = JSON.parse(localStorage.getItem(ordersKey)) || [];
        orders.push(order);
        localStorage.setItem(ordersKey, JSON.stringify(orders));
    }

    // Also save to all orders (for admin)
    const allOrders = JSON.parse(localStorage.getItem('allOrders')) || [];
    order.userEmail = currentUser ? currentUser.email : 'guest';
    order.userName = name;
    allOrders.push(order);
    localStorage.setItem('allOrders', JSON.stringify(allOrders));

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
    
    // Show success message
    alert('🎉 Order placed successfully!\n\nOrder ID: ' + order.id + '\n\nYou can track your order in "My Orders" section.');
    
    console.log('Order placed:', order);


    // Send notification
    if (typeof sendOrderPlacedNotification === 'function') {
    sendOrderPlacedNotification(order.id);
    }
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

// Load saved addresses in checkout
function loadSavedAddresses() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const savedAddressesSection = document.getElementById('savedAddressesSection');
    const savedAddressesList = document.getElementById('savedAddressesList');
    const newAddressForm = document.getElementById('newAddressForm');
    
    if (!currentUser || !savedAddressesSection) return;

    const addressKey = 'addresses_' + currentUser.email;
    const addresses = JSON.parse(localStorage.getItem(addressKey)) || [];

    if (addresses.length === 0) {
        savedAddressesSection.style.display = 'none';
        newAddressForm.style.display = 'block';
        return;
    }

    savedAddressesSection.style.display = 'block';
    newAddressForm.style.display = 'none';

    // Sort: default first
    addresses.sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));

    savedAddressesList.innerHTML = addresses.map((address, index) => {
        const typeIcons = { home: '🏠', work: '💼', other: '📍' };
        const isChecked = address.isDefault ? 'checked' : '';
        
        return `
            <label style="display: block; padding: 12px; border: 2px solid ${address.isDefault ? '#ff6347' : '#e0e0e0'}; border-radius: 8px; margin-bottom: 10px; cursor: pointer; transition: border-color 0.3s;">
                <input type="radio" name="selectedAddress" value="${address.id}" ${isChecked} onchange="selectSavedAddress('${address.id}')" style="margin-right: 10px;">
                <strong>${typeIcons[address.type] || '📍'} ${address.type.charAt(0).toUpperCase() + address.type.slice(1)}</strong>
                ${address.isDefault ? '<span style="background: #ff6347; color: white; padding: 2px 8px; border-radius: 10px; font-size: 10px; margin-left: 10px;">Default</span>' : ''}
                <br>
                <span style="font-size: 13px; color: #555; margin-left: 22px; display: block; margin-top: 5px;">
                    ${address.fullName}, ${address.addressLine1}, ${address.addressLine2}, ${address.city} - ${address.pincode}
                    <br>📞 ${address.phoneNumber}
                </span>
            </label>
        `;
    }).join('');

    // Pre-fill with default address
    const defaultAddress = addresses.find(a => a.isDefault);
    if (defaultAddress) {
        selectSavedAddress(defaultAddress.id);
    }
}

// Select saved address
function selectSavedAddress(addressId) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;

    const addressKey = 'addresses_' + currentUser.email;
    const addresses = JSON.parse(localStorage.getItem(addressKey)) || [];
    const address = addresses.find(a => a.id === addressId);

    if (address) {
        document.getElementById('customerName').value = address.fullName;
        document.getElementById('customerPhone').value = address.phoneNumber;
        document.getElementById('customerAddress').value = `${address.addressLine1}, ${address.addressLine2}, ${address.city}, ${address.state} - ${address.pincode}${address.landmark ? ', Near ' + address.landmark : ''}`;
    }

    // Update selected styling
    document.querySelectorAll('#savedAddressesList label').forEach(label => {
        const radio = label.querySelector('input[type="radio"]');
        label.style.borderColor = radio.checked ? '#ff6347' : '#e0e0e0';
    });
}

// Toggle new address form
function toggleNewAddressForm() {
    const newAddressForm = document.getElementById('newAddressForm');
    const isHidden = newAddressForm.style.display === 'none';
    
    newAddressForm.style.display = isHidden ? 'block' : 'none';
    
    if (isHidden) {
        // Clear form for new address
        document.getElementById('customerName').value = '';
        document.getElementById('customerPhone').value = '';
        document.getElementById('customerAddress').value = '';
        
        // Uncheck all saved addresses
        document.querySelectorAll('#savedAddressesList input[type="radio"]').forEach(radio => {
            radio.checked = false;
        });
        document.querySelectorAll('#savedAddressesList label').forEach(label => {
            label.style.borderColor = '#e0e0e0';
        });
    }
}

// Update showCheckout to load addresses
const originalShowCheckout = showCheckout;
showCheckout = function() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    const modal = document.getElementById('checkoutModal');
    if (modal) {
        modal.style.display = 'flex';
        updateOrderSummary();
        loadSavedAddresses();
    }
};