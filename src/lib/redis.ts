import { Redis } from "@upstash/redis";
import { env } from "../env";

export const redisClient = new Redis({
  url: env.REDIS_URL,
  token: env.REDIS_TOKEN,
});
