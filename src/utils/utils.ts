import redisClient from '../config/redis';
import { config } from '../config/constants/enviroment';

export async function getFromCache(key: string) {
  const cachedData = await redisClient.get(key);
  if (cachedData) {
    return JSON.parse(cachedData);
  }
  return null;
}

export async function setToCache(key: string, data: any) {
  await redisClient.set(key, JSON.stringify(data), 'EX', config.cacheExpiry);
}

export function logSuccessMessage(message: string) {
  console.log(message);
}

export async function clearCache(keys: string[]) {
  for (const key of keys) {
    await redisClient.del(key);
  }
}