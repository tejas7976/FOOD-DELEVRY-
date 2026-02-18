// Notification System
let notifications = [];

// Initialize notifications on page load
document.addEventListener('DOMContentLoaded', function() {
    loadNotifications();
    updateNotificationBadge();
    
    // Check for new notifications every 30 seconds
    setInterval(checkForNewNotifications, 30000);
});

// Load notifications from localStorage
function loadNotifications() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    const notifKey = 'notifications_' + currentUser.email;
    notifications = JSON.parse(localStorage.getItem(notifKey)) || [];
}

// Save notifications to localStorage
function saveNotifications() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    const notifKey = 'notifications_' + currentUser.email;
    localStorage.setItem(notifKey, JSON.stringify(notifications));
}

// Add new notification
function addNotification(title, message, type = 'order', link = '#') {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    const notification = {
        id: 'notif_' + Date.now(),
        title: title,
        message: message,
        type: type, // order, promo, system
        link: link,
        read: false,
        createdAt: new Date().toISOString()
    };
    
    notifications.unshift(notification); // Add to beginning
    saveNotifications();
    updateNotificationBadge();
    
    // Show toast notification
    showNotificationToast(title, message);
    
    // Play notification sound (optional)
    playNotificationSound();
    
    return notification;
}

// Show notification toast
function showNotificationToast(title, message) {
    // Remove existing toast
    const existingToast = document.querySelector('.notification-toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'notification-toast';
    toast.innerHTML = `
        <div class="toast-icon">🔔</div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <span class="toast-close" onclick="this.parentElement.remove()">×</span>
    `;
    
    document.body.appendChild(toast);
    
    // Show toast with animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 300);
    }, 5000);
}

// Play notification sound
function playNotificationSound() {
    try {
        // Create a simple beep sound using Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        gainNode.gain.value = 0.1;
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.2);
    } catch (e) {
        // Audio not supported or blocked
        console.log('Notification sound not available');
    }
}

// Update notification badge count
function updateNotificationBadge() {
    const badge = document.getElementById('notificationBadge');
    if (!badge) return;
    
    const unreadCount = notifications.filter(n => !n.read).length;
    
    if (unreadCount > 0) {
        badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
        badge.style.display = 'flex';
    } else {
        badge.style.display = 'none';
    }
}

// Toggle notification dropdown
function toggleNotificationDropdown() {
    const dropdown = document.getElementById('notificationDropdown');
    if (!dropdown) return;
    
    if (dropdown.style.display === 'block') {
        dropdown.style.display = 'none';
    } else {
        renderNotifications();
        dropdown.style.display = 'block';
    }
}

// Close notification dropdown
function closeNotificationDropdown() {
    const dropdown = document.getElementById('notificationDropdown');
    if (dropdown) {
        dropdown.style.display = 'none';
    }
}

// Render notifications in dropdown
function renderNotifications() {
    const list = document.getElementById('notificationList');
    if (!list) return;
    
    if (notifications.length === 0) {
        list.innerHTML = `
            <div class="notification-empty">
                <div class="notification-empty-icon">🔔</div>
                <p>No notifications yet</p>
            </div>
        `;
        return;
    }
    
    // Show only latest 10 notifications
    const recentNotifications = notifications.slice(0, 10);
    
    list.innerHTML = recentNotifications.map(notif => {
        const timeAgo = getTimeAgo(notif.createdAt);
        const typeIcons = {
            order: '📦',
            promo: '🎉',
            system: '⚙️'
        };
        const icon = typeIcons[notif.type] || '🔔';
        const unreadClass = notif.read ? '' : 'unread';
        
        return `
            <div class="notification-item ${unreadClass}" onclick="handleNotificationClick('${notif.id}', '${notif.link}')">
                <div class="notification-icon">${icon}</div>
                <div class="notification-content">
                    <div class="notification-title">${notif.title}</div>
                    <div class="notification-message">${notif.message}</div>
                    <div class="notification-time">${timeAgo}</div>
                </div>
                ${!notif.read ? '<div class="notification-dot"></div>' : ''}
            </div>
        `;
    }).join('');
}

// Handle notification click
function handleNotificationClick(notifId, link) {
    // Mark as read
    const notif = notifications.find(n => n.id === notifId);
    if (notif) {
        notif.read = true;
        saveNotifications();
        updateNotificationBadge();
    }
    
    // Navigate to link
    if (link && link !== '#') {
        window.location.href = link;
    }
    
    closeNotificationDropdown();
}

// Mark all as read
function markAllNotificationsRead() {
    notifications.forEach(n => n.read = true);
    saveNotifications();
    updateNotificationBadge();
    renderNotifications();
}

// Clear all notifications
function clearAllNotifications() {
    if (confirm('Are you sure you want to clear all notifications?')) {
        notifications = [];
        saveNotifications();
        updateNotificationBadge();
        renderNotifications();
    }
}

// Get time ago string
function getTimeAgo(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return Math.floor(seconds / 60) + ' mins ago';
    if (seconds < 86400) return Math.floor(seconds / 3600) + ' hours ago';
    if (seconds < 604800) return Math.floor(seconds / 86400) + ' days ago';
    
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

// Check for new notifications (order status updates)
function checkForNewNotifications() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    // Check orders for status changes
    const ordersKey = 'orders_' + currentUser.email;
    const orders = JSON.parse(localStorage.getItem(ordersKey)) || [];
    
    const notifiedOrdersKey = 'notifiedOrders_' + currentUser.email;
    const notifiedOrders = JSON.parse(localStorage.getItem(notifiedOrdersKey)) || {};
    
    orders.forEach(order => {
        const lastNotifiedStatus = notifiedOrders[order.id];
        
        if (lastNotifiedStatus !== order.status) {
            // Status changed, send notification
            let title = '';
            let message = '';
            
            switch(order.status) {
                case 'confirmed':
                    title = '✅ Order Confirmed!';
                    message = `Your order #${order.id} has been confirmed by the restaurant.`;
                    break;
                case 'preparing':
                    title = '👨‍🍳 Order Being Prepared';
                    message = `Your order #${order.id} is being prepared.`;
                    break;
                case 'out_for_delivery':
                    title = '🚴 Out for Delivery!';
                    message = `Your order #${order.id} is on the way!`;
                    break;
                case 'delivered':
                    title = '🎉 Order Delivered!';
                    message = `Your order #${order.id} has been delivered. Enjoy your meal!`;
                    break;
                case 'cancelled':
                    title = '❌ Order Cancelled';
                    message = `Your order #${order.id} has been cancelled.`;
                    break;
            }
            
            if (title && lastNotifiedStatus !== undefined) {
                addNotification(title, message, 'order', 'orders.html');
            }
            
            // Update notified status
            notifiedOrders[order.id] = order.status;
            localStorage.setItem(notifiedOrdersKey, JSON.stringify(notifiedOrders));
        }
    });
}

// Send order placed notification
function sendOrderPlacedNotification(orderId) {
    addNotification(
        '🎉 Order Placed Successfully!',
        `Your order #${orderId} has been placed. We'll notify you when it's confirmed.`,
        'order',
        'orders.html'
    );
}

// Send welcome notification for new users
function sendWelcomeNotification() {
    addNotification(
        '👋 Welcome to FoodExpress!',
        'Thanks for signing up. Explore restaurants and place your first order!',
        'system',
        'index.html'
    );
}

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
    const dropdown = document.getElementById('notificationDropdown');
    const bell = document.querySelector('.notification-bell');
    
    if (dropdown && bell && !dropdown.contains(e.target) && !bell.contains(e.target)) {
        dropdown.style.display = 'none';
    }
});