import NodeCache from 'node-cache'

import { env } from '@config/globals'

export class CacheService {
  private static cache: NodeCache = new NodeCache({ stdTTL: env.CACHE_TTL })

  /**
   * Get cache value and set if not provided
   *
   * @param {string} key
   * @param {object} storeController
   * @param {object} params
   * @returns {Promise<any>}
   */
  public get(key: string, storeController: any, params: any[] = []): Promise<any> {
    const value = CacheService.cache.get(key)

    if (value) {
      return Promise.resolve(value)
    }

    return storeController.getCachedContent(...params).then((res: any) => {
      CacheService.cache.set(key, res)
      return res
    })
  }

  public set(key: string | number, data: any) {
    CacheService.cache.set(key, data)
  }

  public delete(keys: string | number) {
    CacheService.cache.del(keys)
  }

  public getStats() {
    return CacheService.cache.getStats()
  }

  public getKeys() {
    return CacheService.cache.keys()
  }

  public flush() {
    CacheService.cache.flushAll()
  }
}
