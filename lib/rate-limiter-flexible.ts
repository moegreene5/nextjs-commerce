import Redis from "ioredis";
import { RateLimiterRedis } from "rate-limiter-flexible";

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
});

export const signupRateLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: "signup",
  points: 5,
  duration: 600,
});

export const cartSessionLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: "rl_cart_session",
  points: 15,
  duration: 60,
  blockDuration: 60,
});

export const ipGlobalLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: "rl_ip_global",
  points: 50,
  duration: 60,
});
