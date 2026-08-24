import { put } from "@vercel/blob";
import type { NextApiRequest, NextApiResponse } from "next";
import { env } from "../../src/env";
import { handleMailboxRequest } from "../../src/server/mailbox";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(
  request: NextApiRequest,
  response: NextApiResponse
): Promise<void> {
  return handleMailboxRequest(request, response, {
    mailboxToken: env.MAILBOX_TOKEN,
    blobToken: env.BLOB_READ_WRITE_TOKEN,
    store: async (pathname, body, contentType, token) => {
      await put(pathname, body, {
        access: "private",
        contentType,
        token,
      });
    },
  });
}
