// Performance monitoring middleware
const performanceMiddleware = (req, res, next) => {
    const startTime = Date.now();
    
    // Override res.json to measure response time
    const originalJson = res.json;
    res.json = function(data) {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        // Log slow requests (> 1000ms)
        if (responseTime > 1000) {
            console.warn(`Slow request detected: ${req.method} ${req.path} - ${responseTime}ms`);
        }
        
        // Add performance headers
        res.set('X-Response-Time', `${responseTime}ms`);
        
        // Call original json method
        return originalJson.call(this, data);
    };
    
    next();
};

module.exports = performanceMiddleware;
