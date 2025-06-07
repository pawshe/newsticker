class GoogleRssNewsTicker {
    constructor() {
        this.tickerElement = document.getElementById('newsTicker');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.categoryBtns = document.querySelectorAll('.category-btn');
        
        this.state = {
            currentPosition: 0,
            isPaused: false,
            animationFrameId: null,
            newsItems: [],
            currentCategory: 'world',
            originalWidth: 0,
            speed: 0.7
        };
        
        this.rssFeeds = {
            world: 'https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en&topic=w',
            business: 'https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en&topic=b',
            technology: 'https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en&topic=tc',
            science: 'https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en&topic=snc',
            health: 'https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en&topic=m'
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadNews(this.state.currentCategory);
    }
    
    setupEventListeners() {
        this.pauseBtn.addEventListener('click', () => this.togglePause());
        this.prevBtn.addEventListener('click', () => this.moveToPrevious());
        this.nextBtn.addEventListener('click', () => this.moveToNext());
        
        this.categoryBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const category = btn.dataset.category;
                this.changeCategory(category);
            });
        });
        
        // Pause on hover
        this.tickerElement.addEventListener('mouseenter', () => this.pause());
        this.tickerElement.addEventListener('mouseleave', () => this.play());
    }
    
    async loadNews(category) {
    this.tickerElement.innerHTML = '<div class="loading-message">Loading news headlines...</div>';
    this.state.newsItems = [];
    
    try {
        const feedUrl = this.rssFeeds[category];
        const apiKey = 'kldcpntkrgafvpdevdjsq9lhltdg7zcegitj1eeo'; // ← Replace with your actual key
        const response = await fetch(
            `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}&api_key=${apiKey}`
        );
        
        // Rest of the code remains the same...
    }
}
    
    renderTickerItems() {
        this.tickerElement.innerHTML = '';
        
        this.state.newsItems.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'ticker-item';
            itemElement.innerHTML = `
                <a href="${item.link}" class="ticker-link" target="_blank" rel="noopener noreferrer">
                    ${item.title}
                    <span class="ticker-time">${this.formatTime(item.pubDate)}</span>
                </a>
            `;
            this.tickerElement.appendChild(itemElement);
        });
        
        this.state.originalWidth = this.tickerElement.scrollWidth;
    }
    
    setupSeamlessLoop() {
        const containerWidth = this.tickerElement.parentElement.offsetWidth;
        const items = Array.from(this.tickerElement.children);
        
        // Remove existing clones
        const existingClones = this.tickerElement.querySelectorAll('[data-clone]');
        existingClones.forEach(clone => clone.remove());
        
        // Add enough clones to fill the viewport plus buffer
        let totalWidth = this.state.originalWidth;
        let clonesAdded = 0;
        
        while (totalWidth < containerWidth * 2 && items.length > 0) {
            const clone = items[clonesAdded % items.length].cloneNode(true);
            clone.setAttribute('data-clone', 'true');
            clone.setAttribute('aria-hidden', 'true');
            this.tickerElement.appendChild(clone);
            totalWidth += clone.offsetWidth;
            clonesAdded++;
        }
    }
    
    animate() {
        if (this.state.isPaused) return;
        
        this.state.currentPosition -= this.state.speed;
        
        // Reset position when we've scrolled the original content width
        if (this.state.currentPosition <= -this.state.originalWidth) {
            this.state.currentPosition = 0;
            this.tickerElement.style.transition = 'none';
            this.tickerElement.style.transform = `translateX(${this.state.currentPosition}px)`;
            // Force reflow
            void this.tickerElement.offsetWidth;
            this.tickerElement.style.transition = '';
        }
        
        this.tickerElement.style.transform = `translateX(${this.state.currentPosition}px)`;
        this.state.animationFrameId = requestAnimationFrame(() => this.animate());
    }
    
    play() {
        if (!this.state.isPaused) return;
        
        this.state.isPaused = false;
        this.pauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        this.pauseBtn.setAttribute('aria-label', 'Pause ticker');
        this.animate();
    }
    
    pause() {
        if (this.state.isPaused) return;
        
        this.state.isPaused = true;
        cancelAnimationFrame(this.state.animationFrameId);
        this.pauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        this.pauseBtn.setAttribute('aria-label', 'Play ticker');
    }
    
    togglePause() {
        this.state.isPaused ? this.play() : this.pause();
    }
    
    moveToNext() {
        // Move to next item (simplified implementation)
        const itemWidth = this.tickerElement.children[0]?.offsetWidth || 200;
        this.state.currentPosition -= itemWidth;
        this.tickerElement.style.transform = `translateX(${this.state.currentPosition}px)`;
    }
    
    moveToPrevious() {
        // Move to previous item (simplified implementation)
        const itemWidth = this.tickerElement.children[0]?.offsetWidth || 200;
        this.state.currentPosition += itemWidth;
        
        // Don't go beyond start position
        if (this.state.currentPosition > 0) {
            this.state.currentPosition = 0;
        }
        
        this.tickerElement.style.transform = `translateX(${this.state.currentPosition}px)`;
    }
    
    changeCategory(category) {
        this.state.currentCategory = category;
        this.pause();
        
        // Update active button
        this.categoryBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === category);
        });
        
        this.loadNews(category);
    }
    
    formatTime(date) {
        const now = new Date();
        const diffHours = Math.floor((now - date) / 3600000);
        
        if (diffHours < 1) {
            const diffMinutes = Math.floor((now - date) / 60000);
            return `${diffMinutes}m ago`;
        } else if (diffHours < 24) {
            return `${diffHours}h ago`;
        } else {
            return date.toLocaleDateString();
        }
    }
    
    showErrorMessage(message) {
        this.tickerElement.innerHTML = `<div class="ticker-item error-message">${message}</div>`;
    }
}

// Initialize the ticker when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const newsTicker = new GoogleRssNewsTicker();
    
    // Make available globally if needed
    window.newsTicker = newsTicker;
});