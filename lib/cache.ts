// lib/cache.ts - Redis optional with safe typing
let redisClient: any = null

try {
  // Only initialize Redis if credentials exist
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    const { Redis } = require('@upstash/redis')
    redisClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
    console.log('✅ Redis cache initialized')
  } else {
    console.warn('⚠️ Redis not configured - using fallback memory cache')
  }
} catch (err) {
  // Type-safe error handling for unknown errors
  if (err instanceof Error) {
    console.warn('⚠️ Redis initialization failed:', err.message)
  } else {
    console.warn('⚠️ Redis initialization failed with unknown error:', err)
  }
}

// Fallback in-memory cache (for development/local testing)
const memoryCache = new Map<string, { value: any; timestamp: number }>()
const CACHE_TTL = 300000 // 5 minutes in ms

export async function getCache<T>(key: string): Promise<T | null> {
  try {
    // Try Redis first if available (no generic type parameter on .get())
    if (redisClient) {
      const data = await redisClient.get(key)
      if (data !== null && data !== undefined) return data as T
    }
    
    // Fallback to memory cache
    const cached = memoryCache.get(key)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.value as T
    }
    
    return null
  } catch (err) {
    if (err instanceof Error) {
      console.warn('Cache get failed:', err.message)
    }
    return null
  }
}

export async function setCache(key: string, value: any, ttl: number = 300): Promise<void> {
  try {
    // Try Redis first if available
    if (redisClient) {
      await redisClient.set(key, value, { ex: ttl })
      return
    }
    
    // Fallback to memory cache
    memoryCache.set(key, {
      value,
      timestamp: Date.now()
    })
    
    // Auto-expire after TTL
    setTimeout(() => {
      const cached = memoryCache.get(key)
      if (cached && Date.now() - cached.timestamp >= CACHE_TTL) {
        memoryCache.delete(key)
      }
    }, ttl * 1000)
  } catch (err) {
    if (err instanceof Error) {
      console.warn('Cache set failed:', err.message)
    }
  }
}

export async function deleteCache(key: string): Promise<void> {
  try {
    if (redisClient) {
      await redisClient.del(key)
    }
    memoryCache.delete(key)
  } catch (err) {
    if (err instanceof Error) {
      console.warn('Cache delete failed:', err.message)
    }
  }
}

// Org dashboard caching
export async function getCachedOrgDashboard(slug: string) {
  const cacheKey = `org:dashboard:${slug}`
  const cached = await getCache(cacheKey)
  
  if (cached) {
    return { ...cached, fromCache: true }
  }
  
  return null
}

export async function setCachedOrgDashboard(slug: string,  any) {
  const cacheKey = `org:dashboard:${slug}`
  await setCache(cacheKey, data, 300) // 5 minute cache
}

export async function invalidateOrgCache(slug: string) {
  const cacheKey = `org:dashboard:${slug}`
  await deleteCache(cacheKey)
}