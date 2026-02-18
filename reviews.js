// Reviews System
let selectedRating = 0;
let reviewsToShow = 5;
const restaurantId = 'pizza-paradise';

// Initialize reviews on page load
document.addEventListener('DOMContentLoaded', function() {
    loadReviews();
    setupCharacterCounter();
});

// Setup character counter for review text
function setupCharacterCounter() {
    const reviewText = document.getElementById('reviewText');
    const charCount = document.getElementById('charCount');
    
    if (reviewText && charCount) {
        reviewText.addEventListener('input', function() {
            charCount.textContent = this.value.length;
        });
    }
}

// Open review modal
function openReviewModal() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        alert('Please login to write a review');
        if (typeof showLoginModal === 'function') {
            showLoginModal();
        }
        return;
    }

    // Check if user has ordered from this restaurant
    const ordersKey = 'orders_' + currentUser.email;
    const orders = JSON.parse(localStorage.getItem(ordersKey)) || [];
    
    if (orders.length === 0) {
        alert('You need to place an order before writing a review!');
        return;
    }

    // Reset modal
    selectedRating = 0;
    updateStarDisplay();
    document.getElementById('reviewText').value = '';
    document.getElementById('charCount').textContent = '0';
    document.getElementById('ratingLabel').textContent = 'Tap to rate';
    document.getElementById('submitReviewBtn').disabled = true;

    document.getElementById('reviewModal').style.display = 'flex';
}

// Close review modal
function closeReviewModal() {
    document.getElementById('reviewModal').style.display = 'none';
}

// Set rating
function setRating(rating) {
    selectedRating = rating;
    updateStarDisplay();
    
    const labels = {
        1: '😞 Poor',
        2: '😐 Fair',
        3: '🙂 Good',
        4: '😊 Very Good',
        5: '🤩 Excellent!'
    };
    
    document.getElementById('ratingLabel').textContent = labels[rating];
    document.getElementById('submitReviewBtn').disabled = false;
}

// Update star display
function updateStarDisplay() {
    const stars = document.querySelectorAll('#starRatingInput span');
    stars.forEach((star, index) => {
        if (index < selectedRating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

// Submit review
function submitReview() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        alert('Please login to submit a review');
        return;
    }

    if (selectedRating === 0) {
        alert('Please select a rating');
        return;
    }

    const reviewText = document.getElementById('reviewText').value.trim();

    // Create review object
    const review = {
        id: 'rev_' + Date.now(),
        restaurantId: restaurantId,
        userEmail: currentUser.email,
        userName: currentUser.name || currentUser.email.split('@')[0],
        rating: selectedRating,
        text: reviewText,
        date: new Date().toISOString(),
        helpful: 0
    };

    // Save review
    const reviewsKey = 'reviews_' + restaurantId;
    const reviews = JSON.parse(localStorage.getItem(reviewsKey)) || [];
    
    // Check if user already reviewed
    const existingReviewIndex = reviews.findIndex(r => r.userEmail === currentUser.email);
    if (existingReviewIndex !== -1) {
        reviews[existingReviewIndex] = review;
        alert('Your review has been updated!');
    } else {
        reviews.push(review);
        alert('Thank you for your review! ⭐');
    }

    localStorage.setItem(reviewsKey, JSON.stringify(reviews));

    closeReviewModal();
    loadReviews();
}

// Load reviews
function loadReviews() {
    const reviewsKey = 'reviews_' + restaurantId;
    const reviews = JSON.parse(localStorage.getItem(reviewsKey)) || [];
    
    updateOverallRating(reviews);

    const reviewsList = document.getElementById('reviewsList');
    const loadMoreBtn = document.getElementById('loadMoreBtn');

    if (!reviewsList) return;

    if (reviews.length === 0) {
        reviewsList.innerHTML = '<div class="no-reviews"><div class="no-reviews-icon">📝</div><h3>No Reviews Yet</h3><p>Be the first to review this restaurant!</p></div>';
        if (loadMoreBtn) loadMoreBtn.style.display = 'none';
        return;
    }

    reviews.sort((a, b) => new Date(b.date) - new Date(a.date));

    const reviewsToDisplay = reviews.slice(0, reviewsToShow);

    reviewsList.innerHTML = reviewsToDisplay.map(review => {
        const initial = review.userName.charAt(0).toUpperCase();
        const date = new Date(review.date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
        
        let ratingClass = '';
        if (review.rating <= 2) ratingClass = 'low';
        else if (review.rating <= 3) ratingClass = 'medium';

        return '<div class="review-card"><div class="review-header"><div class="reviewer-info"><div class="reviewer-avatar">' + initial + '</div><div><div class="reviewer-name">' + review.userName + '</div><div class="review-date">' + date + '</div></div></div><div class="review-rating ' + ratingClass + '">⭐ ' + review.rating + '</div></div>' + (review.text ? '<p class="review-text">' + review.text + '</p>' : '') + '<button class="helpful-btn" onclick="markHelpful(\'' + review.id + '\')">👍 Helpful (' + (review.helpful || 0) + ')</button></div>';
    }).join('');

    if (loadMoreBtn) {
        loadMoreBtn.style.display = reviews.length > reviewsToShow ? 'block' : 'none';
    }
}

// Update overall rating display
function updateOverallRating(reviews) {
    const overallRatingEl = document.getElementById('overallRating');
    const overallStarsEl = document.getElementById('overallStars');
    const totalReviewsEl = document.getElementById('totalReviews');

    if (!overallRatingEl) return;

    if (reviews.length === 0) {
        overallRatingEl.textContent = '0.0';
        if (overallStarsEl) overallStarsEl.textContent = '☆☆☆☆☆';
        if (totalReviewsEl) totalReviewsEl.textContent = '0 reviews';
        return;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const avgRating = (totalRating / reviews.length).toFixed(1);

    overallRatingEl.textContent = avgRating;
    if (totalReviewsEl) totalReviewsEl.textContent = reviews.length + ' review' + (reviews.length !== 1 ? 's' : '');

    if (overallStarsEl) {
        const fullStars = Math.floor(avgRating);
        let starsHTML = '★'.repeat(fullStars) + '☆'.repeat(5 - fullStars);
        overallStarsEl.textContent = starsHTML;
    }
}

// Load more reviews
function loadMoreReviews() {
    reviewsToShow += 5;
    loadReviews();
}

// Mark review as helpful
function markHelpful(reviewId) {
    const reviewsKey = 'reviews_' + restaurantId;
    const reviews = JSON.parse(localStorage.getItem(reviewsKey)) || [];
    
    const review = reviews.find(r => r.id === reviewId);
    if (review) {
        const helpfulKey = 'helpful_' + reviewId;
        if (localStorage.getItem(helpfulKey)) {
            alert('You already marked this review as helpful');
            return;
        }

        review.helpful = (review.helpful || 0) + 1;
        localStorage.setItem(reviewsKey, JSON.stringify(reviews));
        localStorage.setItem(helpfulKey, 'true');
        loadReviews();
    }
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modal = document.getElementById('reviewModal');
    if (event.target === modal) {
        closeReviewModal();
    }
});