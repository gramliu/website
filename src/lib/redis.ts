import { Redis } from "@upstash/redis";
import { env } from "../env";

export const redisClient =
  env.REDIS_URL && env.REDIS_TOKEN
    ? new Redis({
        url: env.REDIS_URL,
        token: env.REDIS_TOKEN,
      })
    : null;
