import { Redis } from '@upstash/redis'

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!
})

// Cache TTL constants (in seconds)
const TTL = {
  SHORT: 60,      // 1 minute
  MEDIUM: 300,    // 5 minutes
  LONG: 3600,     // 1 hour
  DAY: 86400      // 24 hours
}

// Generic cache functions
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get<T>(key)
    return data
  } catch (error) {
    console.error('Redis get error:', error)
    return null
  }
}

export async function setCache(key: string, value: any, ttl: number = TTL.MEDIUM): Promise<void> {
  try {
    await redis.set(key, value, { ex: ttl })
  } catch (error) {
    console.error('Redis set error:', error)
  }
}

export async function deleteCache(key: string): Promise<void> {
  try {
    await redis.del(key)
  } catch (error) {
    console.error('Redis delete error:', error)
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
  await setCache(cacheKey, data, TTL.MEDIUM)
}

// Clear org cache when transactions occur
export async function invalidateOrgCache(slug: string) {
  const cacheKey = `org:dashboard:${slug}`
  await deleteCache(cacheKey)
}