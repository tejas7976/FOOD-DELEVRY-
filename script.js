// Wait for the page to load completely
document.addEventListener('DOMContentLoaded', function() {
    
    // Get all the elements we need
    const searchInput = document.getElementById('searchInput');
    const restaurantCards = document.querySelectorAll('.restaurant-card');
    const filterChips = document.querySelectorAll('.chip');
    
    // Make restaurant cards clickable
    restaurantCards.forEach(card => {
        card.addEventListener('click', function() {
            // Navigate to restaurant detail page
            window.location.href = 'restaurant-detail.html';
        });
    });
    
    // Search functionality
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        
        restaurantCards.forEach(card => {
            const restaurantName = card.querySelector('h2').textContent.toLowerCase();
            const cuisine = card.querySelector('.cuisine').textContent.toLowerCase();
            
            // Check if search term matches restaurant name or cuisine
            if (restaurantName.includes(searchTerm) || cuisine.includes(searchTerm)) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        });
        
        // If search is empty, remove all active filters
        if (searchTerm === '') {
            filterChips.forEach(chip => {
                if (chip.dataset.filter === 'all') {
                    chip.classList.add('active');
                } else {
                    chip.classList.remove('active');
                }
            });
        }
    });
    
    // Filter chip functionality
    filterChips.forEach(chip => {
        chip.addEventListener('click', function() {
            // Remove active class from all chips
            filterChips.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked chip
            this.classList.add('active');
            
            // Clear search input
            searchInput.value = '';
            
            // Get filter value
            const filterValue = this.dataset.filter;
            
            // Filter restaurants
            restaurantCards.forEach(card => {
                if (filterValue === 'all') {
                    card.classList.remove('hidden');
                } else {
                    const cuisine = card.querySelector('.cuisine').textContent.toLowerCase();
                    
                    if (cuisine.includes(filterValue)) {
                        card.classList.remove('hidden');
                    } else {
                        card.classList.add('hidden');
                    }
                }
            });
        });
    });
    
    console.log(`Total restaurants loaded: ${restaurantCards.length}`);
});