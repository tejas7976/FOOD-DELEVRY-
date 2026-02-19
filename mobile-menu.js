// Mobile Menu JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initMobileMenu();
    initMobileCart();
});

// Initialize Mobile Menu
function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (!hamburger || !navMenu) return;

    // Create overlay
    let overlay = document.querySelector('.menu-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'menu-overlay';
        document.body.appendChild(overlay);
    }

    // Toggle menu
    hamburger.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleMobileMenu();
    });

    // Close on overlay click
    overlay.addEventListener('click', function() {
        closeMobileMenu();
    });

    // Close on link click
    const navLinks = navMenu.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            closeMobileMenu();
        });
    });

    // Close on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeMobileMenu();
        }
    });

    // Close menu on window resize (if larger than mobile)
    window.addEventListener('resize', function() {
        if (window.innerWidth > 992) {
            closeMobileMenu();
        }
    });
}

// Toggle mobile menu
function toggleMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const overlay = document.querySelector('.menu-overlay');

    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
    overlay.classList.toggle('active');
    
    // Prevent body scroll when menu is open
    document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
}

// Close mobile menu
function closeMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const overlay = document.querySelector('.menu-overlay');

    if (hamburger) hamburger.classList.remove('active');
    if (navMenu) navMenu.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
}

// Initialize Mobile Cart (for restaurant-detail page)
function initMobileCart() {
    const cartSummary = document.querySelector('.cart-summary');
    
    if (!cartSummary) return;

    // Only on mobile
    if (window.innerWidth > 768) return;

    const cartHeader = cartSummary.querySelector('h3');
    
    if (cartHeader) {
        cartHeader.addEventListener('click', function() {
            cartSummary.classList.toggle('expanded');
        });
    }

    // Close cart when clicking outside
    document.addEventListener('click', function(e) {
        if (!cartSummary.contains(e.target) && cartSummary.classList.contains('expanded')) {
            cartSummary.classList.remove('expanded');
        }
    });

    // Re-check on resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            cartSummary.classList.remove('expanded');
        }
    });
}

// Expand cart on mobile
function expandMobileCart() {
    const cartSummary = document.querySelector('.cart-summary');
    if (cartSummary && window.innerWidth <= 768) {
        cartSummary.classList.add('expanded');
    }
}

// Collapse cart on mobile
function collapseMobileCart() {
    const cartSummary = document.querySelector('.cart-summary');
    if (cartSummary) {
        cartSummary.classList.remove('expanded');
    }
}