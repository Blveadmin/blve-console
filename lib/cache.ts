// lib/cache.ts - Safe lazy initialization (prevents module-level crashes)
let redisClient: any = null
let redisInitialized = false

function initializeRedis() {
  if (redisInitialized) return
  redisInitialized = true

  try {
    // Only initialize if env vars exist (safe for Vercel without Redis)
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      const { Redis } = require('@upstash/redis')
      redisClient = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
      console.log('✅ Redis cache initialized')
    } else {
      console.warn('⚠️ Redis not configured - using memory cache')
    }
  } catch (err) {
    if (err instanceof Error) {
      console.warn('⚠️ Redis init failed:', err.message)
    }
  }
}

// Fallback in-memory cache
const memoryCache = new Map<string, { value: any; timestamp: number }>()
const CACHE_TTL = 300000 // 5 minutes

export async function getCache<T>(key: string): Promise<T | null> {
  initializeRedis()
  
  try {
    if (redisClient) {
      const data = await redisClient.get(key)
      if (data !== null && data !== undefined) return data as T
    }
    
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
  initializeRedis()
  
  try {
    if (redisClient) {
      await redisClient.set(key, value, { ex: ttl })
      return
    }
    
    memoryCache.set(key, { value, timestamp: Date.now() })
    
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
  initializeRedis()
  
  try {
    if (redisClient) await redisClient.del(key)
    memoryCache.delete(key)
  } catch (err) {
    if (err instanceof Error) {
      console.warn('Cache delete failed:', err.message)
    }
  }
}

export async function getCachedOrgDashboard(slug: string) {
  const cacheKey = `org:dashboard:${slug}`
  const cached = await getCache(cacheKey)
  return cached ? { ...cached, fromCache: true } : null
}

export async function setCachedOrgDashboard(slug: string, data: unknown) {
  const cacheKey = `org:dashboard:${slug}`
  await setCache(cacheKey, data, 300)
}

export async function invalidateOrgCache(slug: string) {
  const cacheKey = `org:dashboard:${slug}`
  await deleteCache(cacheKey)
}
