import type { Context, Next } from "hono";
import LRU from "../lib/lruCache";

type CacheOptions = {
  ttl?: number;
  noCache?: boolean;
  public?: boolean;
  store?: boolean;
};

const caches = new LRU<string>(50);

const cache = (options: CacheOptions = {}) => {
  return (c: Context, next: Next) => {
    const ttl = options.ttl || 3600;

    const cacheControl = !options.noCache
      ? `public, max-age=${ttl}`
      : "no-cache";
    c.header("Cache-Control", cacheControl);

    return next();
  };
};

cache.key = (...keys: string[]) => {
  const key = keys.join(".");
  const data = cache.get(key);
  const set = (value: any, ttl: number = 3600) => cache.set(key, value, ttl);
  return { key, data, set };
};

cache.set = (key: string, value: any, ttl: number = 3600) => {
  caches.set(key, JSON.stringify(value), ttl);
};

cache.get = (key: string) => {
  const data = caches.get(key);
  return data ? JSON.parse(data) : null;
};

export default cache;
