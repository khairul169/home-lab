// Adapted from https://levelup.gitconnected.com/implementing-lru-cache-with-node-js-and-typescript-a7c8d3f6a63

// Define an interface for the cache items with key-value pairs and expiry time
interface CacheItem<T> {
  key: string;
  value: T;
  expiryTime: number;
}

// Create a generic LRU cache class with ttl support
class LRU<T> {
  // Define the maximum cache size and the cache data structure
  private readonly maxSize: number;
  private cache: Map<string, CacheItem<T>>;
  private checkIntervalHandler: NodeJS.Timeout | null = null;

  // Initialize the LRU cache with a specified maximum size and ttl
  constructor(maxSize: number, checkInterval: number = 3600) {
    this.maxSize = maxSize;
    this.cache = new Map<string, CacheItem<T>>();
    this.checkIntervalHandler = setInterval(
      this.check.bind(this),
      checkInterval * 1000
    );
  }

  destroy() {
    this.cache = new Map<string, CacheItem<T>>();
    if (this.checkIntervalHandler) {
      clearInterval(this.checkIntervalHandler);
    }
  }

  // Add an item to the cache, evicting the least recently used item if the cache is full
  set(key: string, value: T, ttl: number = 3600): void {
    const expiryTime = Date.now() + ttl * 1000;

    // find the least recently used item and remove it from the cache
    // get the list of keys in the cache and get the first one
    if (this.cache.size >= this.maxSize) {
      const lruKey = this.cache.keys().next().value;
      // remove the least recently used item from the cache
      this.cache.delete(lruKey);
    }

    this.cache.set(key, { key, value, expiryTime });
  }

  // Retrieve an item from the cache, and update its position as the most recently used item
  get(key: string): T | undefined {
    const item = this.cache.get(key);

    if (item && item.expiryTime > Date.now()) {
      this.cache.delete(key);
      this.cache.set(key, item);
      return item.value;
    } else {
      this.cache.delete(key);
      return undefined;
    }
  }

  // Check for expired caches and delete it
  check() {
    const now = Date.now();
    for (const [key, item] of this.cache) {
      if (item.expiryTime < now) {
        this.cache.delete(key);
      }
    }
  }

  // Remove an item from the cache by its key
  delete(key: string): void {
    this.cache.delete(key);
  }

  // Clear the cache
  clear(): void {
    this.cache.clear();
  }
}

export default LRU;
