// src/lib/rateLimit.ts - In-memory rate limiter for API endpoints

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// Store rate limit data per IP address
const requests = new Map<string, RateLimitRecord>();

/**
 * Check if an IP address has exceeded the rate limit
 * @param ip - Client IP address
 * @param limit - Maximum number of requests allowed (default: 5)
 * @param windowMs - Time window in milliseconds (default: 420000ms = 7 minutes)
 * @returns true if request is allowed, false if rate limited
 */
export function checkRateLimit(
  ip: string,
  limit: number = 5,
  windowMs: number = 420000 // 7 minutes
): boolean {
  const now = Date.now();
  const record = requests.get(ip);

  // If no record exists or the window has expired, create a new record
  if (!record || now > record.resetTime) {
    requests.set(ip, { count: 1, resetTime: now + windowMs });
    return true; // Allow the request
  }

  // If limit is reached, deny the request
  if (record.count >= limit) {
    return false; // Rate limited
  }

  // Increment the count and allow the request
  record.count++;
  return true; // Allow the request
}

// Optional: Cleanup function to remove expired entries periodically
// This prevents the Map from growing indefinitely
export function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [ip, record] of requests.entries()) {
    if (now > record.resetTime) {
      requests.delete(ip);
    }
  }
}

// Run cleanup every 10 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpiredEntries, 10 * 60 * 1000);
}
