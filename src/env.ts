import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    GOOGLE_ANALYTICS_ID: z.string(),
    ZOTERO_API_KEY: z.string(),
    REDIS_URL: z.string(),
    REDIS_TOKEN: z.string(),
  },
  client: {},
  // If you're using Next.js < 13.4.4, you'll need to specify the runtimeEnv manually
  runtimeEnv: {
    GOOGLE_ANALYTICS_ID: process.env.GOOGLE_ANALYTICS_ID,
    ZOTERO_API_KEY: process.env.ZOTERO_API_KEY,
    REDIS_URL: process.env.REDIS_URL,
    REDIS_TOKEN: process.env.REDIS_TOKEN,
  },
  // For Next.js >= 13.4.4, you only need to destructure client variables:
  // experimental__runtimeEnv: {
  //   NEXT_PUBLIC_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_PUBLISHABLE_KEY,
  // }
});
