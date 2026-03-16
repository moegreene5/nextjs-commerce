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
