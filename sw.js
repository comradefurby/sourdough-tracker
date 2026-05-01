// ============================================
// Service Worker - Offline Caching
// ============================================

// Cache version name - change this to force cache refresh
const CACHE_NAME = 'sourdough-tracker-v1';

// List of URLs to cache for offline use
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/manifest.json'
];

// ============================================
// Install Event - Cache Resources
// ============================================

// Run when service worker is first installed
self.addEventListener('install', event => {
    // Wait until caching is complete before finishing
    event.waitUntil(
        // Open the cache and add all URLs
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

// ============================================
// Fetch Event - Serve from Cache or Network
// ============================================

// Run when the app requests a resource (page, script, etc.)
self.addEventListener('fetch', event => {
    // Respond with cached version or fetch from network
    event.respondWith(
        caches.match(event.request) // Try to find in cache
            .then(response => {
                // Return cached response if found, otherwise fetch from network
                return response || fetch(event.request);
            })
    );
});