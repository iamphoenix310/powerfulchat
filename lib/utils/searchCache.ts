export interface CacheEntry<V> {
  value: V
  expiry: number
}

export class SearchCache<K, V> {
  private cache = new Map<K, CacheEntry<V>>()
  constructor(private ttlMs: number = 3600_000) {}

  get(key: K): V | undefined {
    const entry = this.cache.get(key)
    if (!entry) return undefined
    if (Date.now() > entry.expiry) {
      this.cache.delete(key)
      return undefined
    }
    return entry.value
  }

  set(key: K, value: V): void {
    this.cache.set(key, { value, expiry: Date.now() + this.ttlMs })
  }
}
