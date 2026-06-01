const Redis = require('ioredis');
const logger = require('../utils/logger');

let redisClient;

const setupRedis = async () => {
  try {
    redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      }
    });

    redisClient.on('connect', () => {
      logger.info('Redis connected successfully');
    });

    redisClient.on('error', (error) => {
      logger.error('Redis connection error:', error);
    });

    return redisClient;
  } catch (error) {
    logger.error('Failed to setup Redis:', error);
    return null;
  }
};

const getRedisClient = () => redisClient;

module.exports = { setupRedis, getRedisClient };