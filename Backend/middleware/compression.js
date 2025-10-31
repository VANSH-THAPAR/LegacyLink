const compression = require('compression');

// Compression middleware configuration for better performance
const compressionMiddleware = compression({
    // Only compress responses that are larger than this threshold (in bytes)
    threshold: 1024,
    
    // Compression level (1-9, where 9 is best compression but slowest)
    level: 6,
    
    // Only compress these content types
    filter: (req, res) => {
        // Don't compress if the request includes a 'x-no-compression' header
        if (req.headers['x-no-compression']) {
            return false;
        }
        
        // Use compression for JSON responses (our API responses)
        return compression.filter(req, res);
    }
});

module.exports = compressionMiddleware;
