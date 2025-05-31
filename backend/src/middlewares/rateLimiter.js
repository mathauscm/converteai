import rateLimit from 'express-rate-limit';
import logger from '../utils/logger.js';

/**
 * Rate limiting configurations for different endpoints
 */

// General API rate limiter
export const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000) / 1000)
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  
  // Custom key generator (uses IP by default)
  keyGenerator: (req) => {
    return req.ip;
  },
  
  // Custom handler for rate limit exceeded
  handler: (req, res) => {
    logger.security('Rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      method: req.method
    });
    
    res.status(429).json({
      success: false,
      message: 'Muitas tentativas de acesso. Tente novamente em alguns minutos.',
      retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000) / 1000),
      timestamp: new Date().toISOString()
    });
  },
  
  // Skip successful requests in count
  skipSuccessfulRequests: false,
  
  // Skip failed requests in count
  skipFailedRequests: false,
  
  // Custom skip function
  skip: (req) => {
    // Skip rate limiting for health checks in development
    if (process.env.NODE_ENV === 'development' && req.path === '/health') {
      return true;
    }
    return false;
  }
});

// Strict rate limiter for file uploads
export const uploadLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // limit each IP to 10 uploads per 5 minutes
  message: {
    success: false,
    error: 'Upload limit exceeded. Please wait before uploading again.',
    retryAfter: 300 // 5 minutes in seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  
  keyGenerator: (req) => {
    return req.ip;
  },
  
  handler: (req, res) => {
    logger.security('Upload rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });
    
    res.status(429).json({
      success: false,
      message: 'Limite de uploads excedido. Aguarde 5 minutos antes de tentar novamente.',
      retryAfter: 300,
      timestamp: new Date().toISOString()
    });
  },
  
  // Only count failed uploads
  skipSuccessfulRequests: true,
  skipFailedRequests: false
});

// Lenient rate limiter for downloads
export const downloadLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 downloads per minute
  message: {
    success: false,
    error: 'Download limit exceeded. Please wait before downloading again.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  
  handler: (req, res) => {
    logger.security('Download rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      filename: req.params.filename,
      timestamp: new Date().toISOString()
    });
    
    res.status(429).json({
      success: false,
      message: 'Limite de downloads excedido. Aguarde um momento antes de tentar novamente.',
      retryAfter: 60,
      timestamp: new Date().toISOString()
    });
  }
});

// Very strict limiter for suspicious activity
export const strictLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 3, // only 3 requests per minute
  message: {
    success: false,
    error: 'Too many requests. Access temporarily restricted.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  
  handler: (req, res) => {
    logger.security('Strict rate limit exceeded - potential attack', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString()
    });
    
    res.status(429).json({
      success: false,
      message: 'Acesso temporariamente restrito devido a atividade suspeita.',
      retryAfter: 60,
      timestamp: new Date().toISOString()
    });
  }
});

// Create a progressive rate limiter that gets stricter with repeated violations
export const progressiveLimiter = () => {
  const attempts = new Map();
  
  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: (req) => {
      const ip = req.ip;
      const currentAttempts = attempts.get(ip) || 0;
      
      // Decrease max requests based on previous violations
      if (currentAttempts >= 3) return 5;   // Very strict after 3 violations
      if (currentAttempts >= 2) return 20;  // Strict after 2 violations
      if (currentAttempts >= 1) return 50;  // Moderate after 1 violation
      return 100; // Normal limit
    },
    
    keyGenerator: (req) => req.ip,
    
    handler: (req, res) => {
      const ip = req.ip;
      const currentAttempts = attempts.get(ip) || 0;
      attempts.set(ip, currentAttempts + 1);
      
      // Clear attempts after 1 hour
      setTimeout(() => {
        attempts.delete(ip);
      }, 60 * 60 * 1000);
      
      logger.security('Progressive rate limit exceeded', {
        ip,
        attempts: currentAttempts + 1,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      });
      
      res.status(429).json({
        success: false,
        message: 'Limite de requisições excedido. Acesso progressivamente restrito.',
        retryAfter: 900, // 15 minutes
        attempts: currentAttempts + 1,
        timestamp: new Date().toISOString()
      });
    }
  });
};

// IP-based blocking for severe violations
const blockedIPs = new Set();
const blockExpiry = new Map();

export const ipBlocker = (req, res, next) => {
  const ip = req.ip;
  
  // Check if IP is currently blocked
  if (blockedIPs.has(ip)) {
    const expiryTime = blockExpiry.get(ip);
    
    if (Date.now() < expiryTime) {
      logger.security('Blocked IP attempted access', {
        ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
        expiresIn: Math.ceil((expiryTime - Date.now()) / 1000)
      });
      
      return res.status(403).json({
        success: false,
        message: 'IP address temporarily blocked due to suspicious activity.',
        retryAfter: Math.ceil((expiryTime - Date.now()) / 1000)
      });
    } else {
      // Block expired, remove from blocked list
      blockedIPs.delete(ip);
      blockExpiry.delete(ip);
    }
  }
  
  next();
};

// Function to block an IP address
export const blockIP = (ip, durationMs = 30 * 60 * 1000) => { // 30 minutes default
  blockedIPs.add(ip);
  blockExpiry.set(ip, Date.now() + durationMs);
  
  logger.security('IP address blocked', {
    ip,
    duration: `${durationMs / 1000}s`,
    expires: new Date(Date.now() + durationMs).toISOString()
  });
  
  // Auto-remove after expiry
  setTimeout(() => {
    blockedIPs.delete(ip);
    blockExpiry.delete(ip);
    logger.info('IP block expired', { ip });
  }, durationMs);
};

// Middleware to detect and handle suspicious patterns
export const suspiciousActivityDetector = (req, res, next) => {
  const ip = req.ip;
  const userAgent = req.get('User-Agent') || '';
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /bot|crawl|spider|scrape/i.test(userAgent),
    req.path.includes('..'),
    req.path.includes('<script>'),
    req.method === 'OPTIONS' && !req.get('Origin'),
    !userAgent || userAgent.length < 10
  ];
  
  if (suspiciousPatterns.some(pattern => pattern)) {
    logger.security('Suspicious activity detected', {
      ip,
      userAgent,
      path: req.path,
      method: req.method,
      patterns: suspiciousPatterns.map((p, i) => p ? i : null).filter(i => i !== null)
    });
    
    // Apply strict rate limiting for suspicious requests
    return strictLimiter(req, res, next);
  }
  
  next();
};

// Export a factory function for custom rate limiters
export const createCustomLimiter = (options = {}) => {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests',
    standardHeaders: true,
    legacyHeaders: false
  };
  
  return rateLimit({
    ...defaultOptions,
    ...options,
    handler: (req, res) => {
      logger.security('Custom rate limit exceeded', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
        limiterName: options.name || 'custom'
      });
      
      res.status(429).json({
        success: false,
        message: options.message || 'Rate limit exceeded',
        retryAfter: Math.ceil(options.windowMs / 1000),
        timestamp: new Date().toISOString()
      });
    }
  });
};