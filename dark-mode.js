// Dark Mode System

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
});

// Initialize theme based on saved preference or system preference
function initializeTheme() {
    // Prevent transition on initial load
    document.body.classList.add('no-transition');
    
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
        // Use saved preference
        setTheme(savedTheme);
    } else {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(prefersDark ? 'dark' : 'light');
    }
    
    // Re-enable transitions after a short delay
    setTimeout(() => {
        document.body.classList.remove('no-transition');
    }, 100);
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            setTheme(e.matches ? 'dark' : 'light');
        }
    });
}

// Set theme
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    updateToggleButton(theme);
}

// Toggle theme
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    setTheme(newTheme);
    
    // Add animation effect
    animateThemeChange();
}

// Update toggle button appearance
function updateToggleButton(theme) {
    const toggleIcon = document.getElementById('themeToggleIcon');
    const toggleText = document.getElementById('themeToggleText');
    
    if (toggleIcon) {
        toggleIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
    
    if (toggleText) {
        toggleText.textContent = theme === 'dark' ? 'Light' : 'Dark';
    }
}

// Animate theme change
function animateThemeChange() {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: var(--accent-color);
        opacity: 0;
        pointer-events: none;
        z-index: 999999;
        transition: opacity 0.3s ease;
    `;
    
    document.body.appendChild(overlay);
    
    // Fade in
    requestAnimationFrame(() => {
        overlay.style.opacity = '0.1';
    });
    
    // Fade out and remove
    setTimeout(() => {
        overlay.style.opacity = '0';
        setTimeout(() => {
            overlay.remove();
        }, 300);
    }, 150);
}

// Get current theme
function getCurrentTheme() {
    return document.documentElement.getAttribute('data-theme') || 'light';
}

// Check if dark mode
function isDarkMode() {
    return getCurrentTheme() === 'dark';
}