import { randomUUID, timingSafeEqual } from "node:crypto";
import type { NextApiRequest, NextApiResponse } from "next";

export const MAX_MAILBOX_BODY_BYTES = 4 * 1024 * 1024;

type MailboxError =
  | "empty_payload"
  | "method_not_allowed"
  | "payload_too_large"
  | "storage_unavailable"
  | "unauthorized";

type MailboxResponse =
  | { success: true }
  | { success: false; error: MailboxError };

export type MailboxBodyChunk = string | Uint8Array | ArrayBuffer;

export type StoreMailboxBody = (
  pathname: string,
  body: Blob,
  contentType: string,
  token: string
) => Promise<void>;

export interface MailboxHandlerOptions {
  mailboxToken?: string;
  blobToken?: string;
  store: StoreMailboxBody;
  now?: () => Date;
  uuid?: () => string;
}

export class MailboxPayloadTooLargeError extends Error {
  constructor() {
    super("Mailbox payload exceeds the maximum size");
    this.name = "MailboxPayloadTooLargeError";
  }
}

export async function readMailboxBody(
  stream: AsyncIterable<MailboxBodyChunk>,
  maxBytes = MAX_MAILBOX_BODY_BYTES
): Promise<Buffer> {
  const chunks: Buffer[] = [];
  let totalBytes = 0;

  for await (const chunk of stream) {
    const buffer =
      typeof chunk === "string"
        ? Buffer.from(chunk)
        : chunk instanceof ArrayBuffer
          ? Buffer.from(chunk)
          : Buffer.from(chunk);

    totalBytes += buffer.byteLength;
    if (totalBytes > maxBytes) {
      throw new MailboxPayloadTooLargeError();
    }

    chunks.push(buffer);
  }

  return Buffer.concat(chunks, totalBytes);
}

export function mailboxTokensMatch(
  providedToken: string,
  expectedToken: string
): boolean {
  const provided = Buffer.from(providedToken);
  const expected = Buffer.from(expectedToken);
  const compareLength = Math.max(provided.length, expected.length);
  const paddedProvided = Buffer.alloc(compareLength);
  const paddedExpected = Buffer.alloc(compareLength);

  provided.copy(paddedProvided);
  expected.copy(paddedExpected);

  return (
    provided.length === expected.length &&
    timingSafeEqual(paddedProvided, paddedExpected)
  );
}

export function isMailboxAuthorized(
  authorizationHeader: string | undefined,
  expectedToken: string
): boolean {
  if (!authorizationHeader) {
    return false;
  }

  const match = /^Bearer ([^\s]+)$/.exec(authorizationHeader);
  return match ? mailboxTokensMatch(match[1], expectedToken) : false;
}

export function createMailboxPath(date: Date, uuid: string): string {
  const timestamp = date.toISOString().replace(/[:.]/g, "-");

  return `mailbox/${timestamp}-${uuid}.txt`;
}

function sendMailboxResponse(
  response: NextApiResponse<MailboxResponse>,
  statusCode: number,
  body: MailboxResponse
): void {
  response.setHeader("Cache-Control", "no-store");
  response.status(statusCode).json(body);
}

export async function handleMailboxRequest(
  request: NextApiRequest,
  response: NextApiResponse<MailboxResponse>,
  options: MailboxHandlerOptions
): Promise<void> {
  response.setHeader("Cache-Control", "no-store");

  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    sendMailboxResponse(response, 405, {
      success: false,
      error: "method_not_allowed",
    });
    return;
  }

  if (!options.mailboxToken || !options.blobToken) {
    sendMailboxResponse(response, 503, {
      success: false,
      error: "storage_unavailable",
    });
    return;
  }

  if (
    !isMailboxAuthorized(request.headers.authorization, options.mailboxToken)
  ) {
    response.setHeader("WWW-Authenticate", "Bearer");
    sendMailboxResponse(response, 401, {
      success: false,
      error: "unauthorized",
    });
    return;
  }

  const contentLength = request.headers["content-length"];
  if (
    typeof contentLength === "string" &&
    Number.isFinite(Number(contentLength)) &&
    Number(contentLength) > MAX_MAILBOX_BODY_BYTES
  ) {
    sendMailboxResponse(response, 413, {
      success: false,
      error: "payload_too_large",
    });
    return;
  }

  let body: Buffer;
  try {
    body = await readMailboxBody(request);
  } catch (error) {
    if (error instanceof MailboxPayloadTooLargeError) {
      sendMailboxResponse(response, 413, {
        success: false,
        error: "payload_too_large",
      });
      return;
    }

    sendMailboxResponse(response, 503, {
      success: false,
      error: "storage_unavailable",
    });
    return;
  }

  if (body.byteLength === 0) {
    sendMailboxResponse(response, 400, {
      success: false,
      error: "empty_payload",
    });
    return;
  }

  const contentTypeHeader = request.headers["content-type"];
  const contentType =
    typeof contentTypeHeader === "string" && contentTypeHeader.length > 0
      ? contentTypeHeader
      : "application/octet-stream";
  const uuid = options.uuid ? options.uuid() : randomUUID();
  const pathname = createMailboxPath(
    (options.now ?? (() => new Date()))(),
    uuid
  );
  const blobBytes = new Uint8Array(body.byteLength);
  blobBytes.set(body);

  try {
    await options.store(
      pathname,
      new Blob([blobBytes.buffer]),
      contentType,
      options.blobToken
    );
  } catch {
    console.error(
      JSON.stringify({
        event: "mailbox_write",
        pathname,
        bytes: body.byteLength,
        outcome: "failure",
      })
    );
    sendMailboxResponse(response, 503, {
      success: false,
      error: "storage_unavailable",
    });
    return;
  }

  console.info(
    JSON.stringify({
      event: "mailbox_write",
      pathname,
      bytes: body.byteLength,
      outcome: "success",
    })
  );
  sendMailboxResponse(response, 201, { success: true });
}
