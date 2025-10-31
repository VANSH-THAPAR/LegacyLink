// Simple in-memory cache for user authentication
class AuthCache {
    constructor() {
        this.cache = new Map();
        this.maxSize = 1000; // Maximum number of cached entries
        this.ttl = 5 * 60 * 1000; // 5 minutes TTL
    }

    // Generate cache key from identifier
    generateKey(identifier) {
        return `auth:${identifier.toLowerCase().trim()}`;
    }

    // Get user from cache
    get(identifier) {
        const key = this.generateKey(identifier);
        const cached = this.cache.get(key);
        
        if (!cached) return null;
        
        // Check if cache entry has expired
        if (Date.now() > cached.expiry) {
            this.cache.delete(key);
            return null;
        }
        
        return cached.user;
    }

    // Set user in cache
    set(identifier, user) {
        const key = this.generateKey(identifier);
        
        // Remove oldest entries if cache is full
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        
        this.cache.set(key, {
            user: { ...user },
            expiry: Date.now() + this.ttl
        });
    }

    // Clear cache entry
    delete(identifier) {
        const key = this.generateKey(identifier);
        this.cache.delete(key);
    }

    // Clear all cache
    clear() {
        this.cache.clear();
    }

    // Get cache stats
    getStats() {
        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            ttl: this.ttl
        };
    }
}

// Export singleton instance
module.exports = new AuthCache();
