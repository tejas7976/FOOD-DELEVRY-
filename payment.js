// Razorpay Payment Integration

// Your Razorpay Key ID (public - safe to use in frontend)
const RAZORPAY_KEY_ID = 'rzp_live_SHve6qymFxQpW1';

// Initialize payment
function initiatePayment(amount, orderId, customerName, customerEmail, customerPhone) {
    // Amount should be in paise (₹1 = 100 paise)
    const amountInPaise = amount * 100;
    
    const options = {
        key: RAZORPAY_KEY_ID,
        amount: amountInPaise,
        currency: 'INR',
        name: 'FoodExpress',
        description: 'Food Order Payment',
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=100', // Your logo
        order_id: '', // Leave empty for direct payment
        handler: function(response) {
            // Payment successful
            handlePaymentSuccess(response, orderId, amount);
        },
        prefill: {
            name: customerName,
            email: customerEmail,
            contact: customerPhone
        },
        notes: {
            order_id: orderId,
            address: 'FoodExpress Delivery'
        },
        theme: {
            color: '#ff6347'
        },
        modal: {
            ondismiss: function() {
                handlePaymentDismiss();
            }
        }
    };
    
    try {
        const razorpayInstance = new Razorpay(options);
        razorpayInstance.open();
    } catch (error) {
        console.error('Razorpay Error:', error);
        alert('Payment gateway error. Please try again.');
    }
}

// Handle successful payment
function handlePaymentSuccess(response, orderId, amount) {
    console.log('Payment Success:', response);
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    // Save payment details
    const payment = {
        id: response.razorpay_payment_id,
        orderId: orderId,
        amount: amount,
        status: 'success',
        date: new Date().toISOString()
    };
    
    // Save to payments history
    const paymentsKey = 'payments_' + currentUser.email;
    const payments = JSON.parse(localStorage.getItem(paymentsKey)) || [];
    payments.push(payment);
    localStorage.setItem(paymentsKey, JSON.stringify(payments));
    
    // Update order status to paid
    updateOrderPaymentStatus(orderId, 'paid', response.razorpay_payment_id);
    
    // Show success message
    showPaymentSuccessModal(response.razorpay_payment_id, amount);
    
    // Send notification
    if (typeof addNotification === 'function') {
        addNotification(
            '✅ Payment Successful!',
            `Payment of ₹${amount} completed. Transaction ID: ${response.razorpay_payment_id}`,
            'order',
            'orders.html'
        );
    }
    
    // Clear cart
    if (typeof clearCart === 'function') {
        clearCart();
    }
    
    // Close checkout modal
    if (typeof closeCheckout === 'function') {
        closeCheckout();
    }
}

// Handle payment dismiss (user closed payment window)
function handlePaymentDismiss() {
    console.log('Payment dismissed by user');
    alert('Payment cancelled. Your order has not been placed.');
}

// Update order payment status
function updateOrderPaymentStatus(orderId, status, paymentId) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    // Update in user's orders
    const ordersKey = 'orders_' + currentUser.email;
    let orders = JSON.parse(localStorage.getItem(ordersKey)) || [];
    
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex !== -1) {
        orders[orderIndex].paymentStatus = status;
        orders[orderIndex].paymentId = paymentId;
        orders[orderIndex].status = 'confirmed';
        localStorage.setItem(ordersKey, JSON.stringify(orders));
    }
    
    // Update in allOrders (for admin)
    let allOrders = JSON.parse(localStorage.getItem('allOrders')) || [];
    const allOrderIndex = allOrders.findIndex(o => o.id === orderId);
    if (allOrderIndex !== -1) {
        allOrders[allOrderIndex].paymentStatus = status;
        allOrders[allOrderIndex].paymentId = paymentId;
        allOrders[allOrderIndex].status = 'confirmed';
        localStorage.setItem('allOrders', JSON.stringify(allOrders));
    }
}

// Show payment success modal
function showPaymentSuccessModal(paymentId, amount) {
    // Remove existing modal if any
    const existingModal = document.getElementById('paymentSuccessModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create success modal
    const modal = document.createElement('div');
    modal.id = 'paymentSuccessModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999999;
    `;
    
    modal.innerHTML = `
        <div style="
            background: white;
            border-radius: 20px;
            padding: 40px;
            text-align: center;
            max-width: 400px;
            width: 90%;
            animation: popIn 0.3s ease;
        ">
            <div style="font-size: 80px; margin-bottom: 20px;">✅</div>
            <h2 style="color: #48c479; margin-bottom: 10px;">Payment Successful!</h2>
            <p style="color: #666; margin-bottom: 20px;">Your order has been placed successfully</p>
            
            <div style="background: #f5f5f5; border-radius: 10px; padding: 15px; margin-bottom: 20px;">
                <p style="color: #888; font-size: 12px; margin-bottom: 5px;">Amount Paid</p>
                <p style="color: #333; font-size: 28px; font-weight: bold;">₹${amount}</p>
            </div>
            
            <div style="background: #f5f5f5; border-radius: 10px; padding: 15px; margin-bottom: 25px;">
                <p style="color: #888; font-size: 12px; margin-bottom: 5px;">Transaction ID</p>
                <p style="color: #333; font-size: 14px; word-break: break-all;">${paymentId}</p>
            </div>
            
            <button onclick="closePaymentSuccessModal()" style="
                background: #ff6347;
                color: white;
                border: none;
                padding: 15px 40px;
                border-radius: 10px;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                width: 100%;
            ">
                View My Orders
            </button>
        </div>
    `;
    
    // Add animation keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes popIn {
            0% { transform: scale(0.5); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(modal);
}

// Close payment success modal
function closePaymentSuccessModal() {
    const modal = document.getElementById('paymentSuccessModal');
    if (modal) {
        modal.remove();
    }
    window.location.href = 'orders.html';
}

// Process payment for order
function processPayment() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        alert('Please login to make payment');
        return;
    }
    
    // Get customer details
    const customerName = document.getElementById('customerName').value.trim();
    const customerPhone = document.getElementById('customerPhone').value.trim();
    const customerAddress = document.getElementById('customerAddress').value.trim();
    
    // Validation
    if (!customerName || !customerPhone || !customerAddress) {
        alert('Please fill in all delivery details');
        return;
    }
    
    // Get cart total
    const grandTotalElement = document.getElementById('grandTotal');
    if (!grandTotalElement) {
        alert('Error calculating total');
        return;
    }
    
    const totalText = grandTotalElement.textContent;
    const amount = parseInt(totalText.replace('₹', '').replace(',', ''));
    
    if (isNaN(amount) || amount <= 0) {
        alert('Invalid order amount');
        return;
    }
    
    // Create order first
    const orderId = 'ORD' + Date.now();
    const order = createOrderObject(orderId, customerName, customerPhone, customerAddress, amount);
    
    // Save order with pending payment status
    saveOrder(order);
    
    // Initiate Razorpay payment
    initiatePayment(
        amount,
        orderId,
        customerName,
        currentUser.email,
        customerPhone
    );
}

// Create order object
function createOrderObject(orderId, customerName, customerPhone, customerAddress, amount) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const cartKey = 'cart_' + currentUser.email;
    const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    
    return {
        id: orderId,
        userEmail: currentUser.email,
        userName: customerName,
        phone: customerPhone,
        address: customerAddress,
        items: cart,
        subtotal: amount - 40, // Subtract delivery fee
        deliveryFee: 40,
        total: amount,
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: 'razorpay',
        date: new Date().toISOString()
    };
}

// Save order
function saveOrder(order) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    // Save to user's orders
    const ordersKey = 'orders_' + currentUser.email;
    const orders = JSON.parse(localStorage.getItem(ordersKey)) || [];
    orders.unshift(order);
    localStorage.setItem(ordersKey, JSON.stringify(orders));
    
    // Save to allOrders (for admin)
    const allOrders = JSON.parse(localStorage.getItem('allOrders')) || [];
    allOrders.unshift(order);
    localStorage.setItem('allOrders', JSON.stringify(allOrders));
}

// Cash on Delivery option
function processCOD() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        alert('Please login to place order');
        return;
    }
    
    // Get customer details
    const customerName = document.getElementById('customerName').value.trim();
    const customerPhone = document.getElementById('customerPhone').value.trim();
    const customerAddress = document.getElementById('customerAddress').value.trim();
    
    // Validation
    if (!customerName || !customerPhone || !customerAddress) {
        alert('Please fill in all delivery details');
        return;
    }
    
    // Get cart total
    const grandTotalElement = document.getElementById('grandTotal');
    const totalText = grandTotalElement.textContent;
    const amount = parseInt(totalText.replace('₹', '').replace(',', ''));
    
    // Create order
    const orderId = 'ORD' + Date.now();
    const order = createOrderObject(orderId, customerName, customerPhone, customerAddress, amount);
    order.paymentMethod = 'cod';
    order.paymentStatus = 'cod';
    order.status = 'confirmed';
    
    // Save order
    saveOrder(order);
    
    // Clear cart
    const cartKey = 'cart_' + currentUser.email;
    localStorage.setItem(cartKey, JSON.stringify([]));
    
    // Send notification
    if (typeof sendOrderPlacedNotification === 'function') {
        sendOrderPlacedNotification(orderId);
    }
    
    // Close checkout and show success
    if (typeof closeCheckout === 'function') {
        closeCheckout();
    }
    
    alert('🎉 Order placed successfully!\n\nOrder ID: ' + orderId + '\nPayment: Cash on Delivery\nTotal: ₹' + amount);
    
    // Redirect to orders
    window.location.href = 'orders.html';
}