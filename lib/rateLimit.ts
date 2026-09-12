// Rate limiting utility for contract calls
class RateLimiter {
  private lastCallTime = 0;
  private minInterval = 200; // Increased to 200ms between calls
  private circuitBreakerOpen = false;
  private circuitBreakerResetTime = 0;

  async waitForNextCall(): Promise<void> {
    const now = Date.now();

    // Check if circuit breaker is open
    if (this.circuitBreakerOpen) {
      const timeSinceReset = now - this.circuitBreakerResetTime;
      if (timeSinceReset < 5000) {
        // Wait 5 seconds for circuit breaker to reset
        const waitTime = 5000 - timeSinceReset;
        console.log(`Circuit breaker open, waiting ${waitTime}ms...`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
      this.circuitBreakerOpen = false;
    }

    const timeSinceLastCall = now - this.lastCallTime;
    if (timeSinceLastCall < this.minInterval) {
      const waitTime = this.minInterval - timeSinceLastCall;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    this.lastCallTime = now;
  }

  async delay(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Mark circuit breaker as open
  markCircuitBreakerOpen(): void {
    this.circuitBreakerOpen = true;
    this.circuitBreakerResetTime = Date.now();
    console.log('Circuit breaker marked as open, will wait 5 seconds');
  }
}

// Global rate limiter instance
export const rateLimiter = new RateLimiter();

// Helper function to wrap contract calls with rate limiting and retry logic
export async function withRateLimit<T>(
  fn: () => Promise<T>,
  delayMs: number = 200,
  maxRetries: number = 3
): Promise<T> {
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await rateLimiter.waitForNextCall();
      await rateLimiter.delay(delayMs);
      return await fn();
    } catch (error: any) {
      lastError = error;

      if (isRateLimitError(error)) {
        console.log(`Rate limit error on attempt ${attempt}, retrying...`);
        rateLimiter.markCircuitBreakerOpen();

        if (attempt < maxRetries) {
          // Wait longer between retries
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
          continue;
        }
      }

      // If it's not a rate limit error or we've exhausted retries, throw
      throw error;
    }
  }

  throw lastError;
}

// Helper function to check if error is rate limiting related
export function isRateLimitError(error: any): boolean {
  return (
    error?.message?.includes('circuit breaker') ||
    error?.message?.includes('rate limit') ||
    error?.message?.includes('too many requests') ||
    error?.code === -32603 // MetaMask circuit breaker error code
  );
}

// Helper function to wait for circuit breaker to reset
export async function waitForCircuitBreakerReset(): Promise<void> {
  console.log('Waiting for circuit breaker to reset...');
  await new Promise((resolve) => setTimeout(resolve, 5000));
  console.log('Circuit breaker reset, continuing...');
}
