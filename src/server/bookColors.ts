import axios from "axios";
import { getColor } from "colorthief";
import rgbHex from "rgb-hex";
import { redisClient } from "../lib/redis";

export interface BookColor {
  fgColor: string;
  bgColor: string;
  hasValidImage: boolean;
}

interface HashBookColor extends BookColor, Record<string, unknown> {}

export async function getImageColors(imageUrl: string): Promise<BookColor> {
  if (redisClient) {
    const cachedResponse = await redisClient.hgetall<HashBookColor>(imageUrl);
    if (cachedResponse) {
      const { fgColor, bgColor, hasValidImage } = cachedResponse;
      return {
        fgColor,
        bgColor,
        // Older cache entries only stored colors, so treat a missing flag as valid.
        hasValidImage: hasValidImage ?? true,
      };
    }
  }

  try {
    const { data } = await axios.get(imageUrl, {
      responseType: "arraybuffer",
    });

    const imageData = `data:image/jpeg;base64,${Buffer.from(
      data,
      "binary"
    ).toString("base64")}`;

    const rgb = await getColor(imageData);
    const fgColor = getForegroundColor(rgb);
    const bgColor = `#${rgbHex(rgb[0], rgb[1], rgb[2])}`;

    if (redisClient) {
      await redisClient.hset(imageUrl, {
        fgColor,
        bgColor,
        hasValidImage: true,
      });
    }

    return {
      fgColor,
      bgColor,
      hasValidImage: true,
    };
  } catch {
    console.error(`Failed to download image for ${imageUrl}`);

    if (redisClient) {
      await redisClient.hset(imageUrl, {
        fgColor: "#000",
        bgColor: "#fff",
        hasValidImage: false,
      });
    }

    return {
      fgColor: "#000",
      bgColor: "#fff",
      hasValidImage: false,
    };
  }
}

export function getForegroundColor(rgb: [number, number, number]) {
  const [r, g, b] = rgb;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#000" : "#fff";
}

export function getForegroundColorFromHex(hex: string): string {
  const cleanHex = hex.replace("#", "");
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return getForegroundColor([r, g, b]);
}
