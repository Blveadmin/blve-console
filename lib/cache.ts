// lib/cache.ts - Redis optional fallback
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
} catch (error) {
  console.warn('⚠️ Redis initialization failed:', error.message)
}

// Fallback in-memory cache (for development/local testing)
const memoryCache = new Map<string, any>()
const CACHE_TTL = 300000 // 5 minutes in ms

export async function getCache<T>(key: string): Promise<T | null> {
  try {
    // Try Redis first if available
    if (redisClient) {
      const data = await redisClient.get<T>(key)
      if (data) return data
    }
    
    // Fallback to memory cache
    const cached = memoryCache.get(key)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.value
    }
    
    return null
  } catch (error) {
    console.warn('Cache get failed:', error)
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
      if (memoryCache.has(key)) {
        const cached = memoryCache.get(key)
        if (cached && Date.now() - cached.timestamp >= CACHE_TTL) {
          memoryCache.delete(key)
        }
      }
    }, ttl * 1000)
  } catch (error) {
    console.warn('Cache set failed:', error)
  }
}

export async function deleteCache(key: string): Promise<void> {
  try {
    if (redisClient) {
      await redisClient.del(key)
    }
    memoryCache.delete(key)
  } catch (error) {
    console.warn('Cache delete failed:', error)
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

export async function setCachedOrgDashboard(slug: string, data: any) {
  const cacheKey = `org:dashboard:${slug}`
  await setCache(cacheKey, data, 300) // 5 minute cache
}

export async function invalidateOrgCache(slug: string) {
  const cacheKey = `org:dashboard:${slug}`
  await deleteCache(cacheKey)
}