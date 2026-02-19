import { RateLimiterRedis } from "rate-limiter-flexible";
import { redis } from "./redis";

export const signupRateLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: "signup",
  points: 5,
  duration: 600,
});
