import { describe, expect, it } from "bun:test";
import type { NextApiRequest, NextApiResponse } from "next";
import {
  createMailboxPath,
  handleMailboxRequest,
  isMailboxAuthorized,
  MAX_MAILBOX_BODY_BYTES,
  type MailboxBodyChunk,
  MailboxPayloadTooLargeError,
  mailboxTokensMatch,
  readMailboxBody,
} from "./mailbox";

type ResponseState = {
  body: unknown;
  headers: Record<string, string>;
  statusCode: number;
};

type StoredWrite = {
  body: Blob;
  contentType: string;
  pathname: string;
  token: string;
};

function createResponse(): {
  response: NextApiResponse;
  state: ResponseState;
} {
  const state: ResponseState = {
    body: undefined,
    headers: {},
    statusCode: 200,
  };
  const response = {
    json(body: unknown) {
      state.body = body;
      return response;
    },
    setHeader(name: string, value: string) {
      state.headers[name.toLowerCase()] = value;
      return response;
    },
    status(statusCode: number) {
      state.statusCode = statusCode;
      return response;
    },
  } as unknown as NextApiResponse;

  return { response, state };
}

function createRequest(
  chunks: MailboxBodyChunk[],
  headers: Record<string, string | undefined> = {
    authorization: "Bearer mailbox-secret",
    "content-type": "text/plain",
  },
  method = "POST"
): NextApiRequest {
  const normalizedHeaders: Record<string, string> = {};
  for (const [name, value] of Object.entries(headers)) {
    if (typeof value === "string") {
      normalizedHeaders[name] = value;
    }
  }

  const request = {
    headers: normalizedHeaders,
    method,
    async *[Symbol.asyncIterator]() {
      for (const chunk of chunks) {
        yield chunk;
      }
    },
  };

  return request as NextApiRequest;
}

function createStore() {
  const writes: StoredWrite[] = [];
  const store = async (
    pathname: string,
    body: Blob,
    contentType: string,
    token: string
  ) => {
    writes.push({ pathname, body, contentType, token });
  };

  return { store, writes };
}

describe("mailbox authentication", () => {
  it("compares equal and unequal tokens without throwing on length differences", () => {
    expect(mailboxTokensMatch("secret", "secret")).toBe(true);
    expect(mailboxTokensMatch("secre", "secret")).toBe(false);
    expect(mailboxTokensMatch("secret7", "secret")).toBe(false);
    expect(mailboxTokensMatch("other", "secret")).toBe(false);
  });

  it("accepts only a single bearer token", () => {
    expect(isMailboxAuthorized("Bearer secret", "secret")).toBe(true);
    expect(isMailboxAuthorized(undefined, "secret")).toBe(false);
    expect(isMailboxAuthorized("Basic secret", "secret")).toBe(false);
    expect(isMailboxAuthorized("Bearer", "secret")).toBe(false);
    expect(isMailboxAuthorized("Bearer secret extra", "secret")).toBe(false);
  });
});

describe("mailbox body handling", () => {
  it("preserves chunked bodies and accepts the exact size limit", async () => {
    const body = Buffer.alloc(MAX_MAILBOX_BODY_BYTES, 97);
    const result = await readMailboxBody(
      (async function* () {
        yield body.subarray(0, 1024);
        yield body.subarray(1024);
      })()
    );

    expect(result.byteLength).toBe(MAX_MAILBOX_BODY_BYTES);
    expect(result.equals(body)).toBe(true);
  });

  it("rejects bodies larger than the size limit", async () => {
    const oversized = Buffer.alloc(MAX_MAILBOX_BODY_BYTES + 1, 97);

    await expect(
      readMailboxBody(
        (async function* () {
          yield oversized;
        })()
      )
    ).rejects.toBeInstanceOf(MailboxPayloadTooLargeError);
  });

  it("creates UTC, date-partitioned text paths", () => {
    expect(
      createMailboxPath(
        new Date("2026-08-24T08:00:00.123Z"),
        "00000000-0000-0000-0000-000000000000"
      )
    ).toBe(
      "mailbox/2026/08/24/2026-08-24T08-00-00-123Z-00000000-0000-0000-0000-000000000000.txt"
    );
  });
});

describe("handleMailboxRequest", () => {
  it("stores the raw body and returns only success", async () => {
    const { response, state } = createResponse();
    const { store, writes } = createStore();

    await handleMailboxRequest(
      createRequest([Buffer.from("hello "), Buffer.from("mailbox")]),
      response,
      {
        mailboxToken: "mailbox-secret",
        blobToken: "blob-secret",
        now: () => new Date("2026-08-24T08:00:00.123Z"),
        store,
        uuid: () => "00000000-0000-0000-0000-000000000000",
      }
    );

    expect(state.statusCode).toBe(201);
    expect(state.body).toEqual({ success: true });
    expect(state.headers["cache-control"]).toBe("no-store");
    expect(writes).toHaveLength(1);
    expect(writes[0]?.contentType).toBe("text/plain");
    expect(writes[0]?.token).toBe("blob-secret");
    expect(await writes[0]?.body.text()).toBe("hello mailbox");
    expect(writes[0]?.pathname).toContain("mailbox/2026/08/24/");
  });

  it("rejects invalid credentials before reading or storing the body", async () => {
    const { response, state } = createResponse();
    const { store, writes } = createStore();
    const request = createRequest([Buffer.from("should not be read")], {
      authorization: "Bearer wrong",
    });

    await handleMailboxRequest(request, response, {
      mailboxToken: "mailbox-secret",
      blobToken: "blob-secret",
      store,
    });

    expect(state.statusCode).toBe(401);
    expect(state.body).toEqual({ success: false, error: "unauthorized" });
    expect(state.headers["www-authenticate"]).toBe("Bearer");
    expect(writes).toHaveLength(0);
  });

  it("returns the documented validation and configuration errors", async () => {
    const cases = [
      {
        body: [],
        expectedStatus: 400,
        expectedBody: { success: false, error: "empty_payload" },
        headers: { authorization: "Bearer mailbox-secret" },
        options: { mailboxToken: "mailbox-secret", blobToken: "blob-secret" },
      },
      {
        body: [Buffer.from("too large")],
        expectedStatus: 413,
        expectedBody: { success: false, error: "payload_too_large" },
        headers: {
          authorization: "Bearer mailbox-secret",
          "content-length": String(MAX_MAILBOX_BODY_BYTES + 1),
        },
        options: { mailboxToken: "mailbox-secret", blobToken: "blob-secret" },
      },
      {
        body: [Buffer.from("payload")],
        expectedStatus: 503,
        expectedBody: { success: false, error: "storage_unavailable" },
        headers: { authorization: "Bearer mailbox-secret" },
        options: { mailboxToken: undefined, blobToken: "blob-secret" },
      },
    ];

    for (const testCase of cases) {
      const { response, state } = createResponse();
      const { store } = createStore();

      await handleMailboxRequest(
        createRequest(testCase.body, testCase.headers),
        response,
        { ...testCase.options, store }
      );

      expect(state.statusCode).toBe(testCase.expectedStatus);
      expect(state.body).toEqual(testCase.expectedBody);
    }
  });

  it("rejects non-POST requests", async () => {
    const { response, state } = createResponse();
    const { store } = createStore();

    await handleMailboxRequest(createRequest([], {}, "GET"), response, {
      mailboxToken: "mailbox-secret",
      blobToken: "blob-secret",
      store,
    });

    expect(state.statusCode).toBe(405);
    expect(state.body).toEqual({
      success: false,
      error: "method_not_allowed",
    });
    expect(state.headers.allow).toBe("POST");
  });

  it("returns storage_unavailable when the Blob write fails", async () => {
    const { response, state } = createResponse();

    await handleMailboxRequest(
      createRequest([Buffer.from("payload")]),
      response,
      {
        mailboxToken: "mailbox-secret",
        blobToken: "blob-secret",
        store: async () => {
          throw new Error("simulated failure");
        },
      }
    );

    expect(state.statusCode).toBe(503);
    expect(state.body).toEqual({
      success: false,
      error: "storage_unavailable",
    });
  });
});
