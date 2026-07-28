import { createHmac, timingSafeEqual } from "node:crypto";

const SIGNATURE_PREFIX = "sha256=";
const DEFAULT_MAX_AGE_MS = 5 * 60 * 1000;

type SignatureInput = {
  body: string;
  secret: string;
  timestamp: string;
};

export function createWebhookSignature(input: SignatureInput) {
  const digest = createHmac("sha256", input.secret)
    .update(`${input.timestamp}.${input.body}`, "utf8")
    .digest("hex");

  return `${SIGNATURE_PREFIX}${digest}`;
}

export function verifyWebhookSignature(
  input: SignatureInput & {
    signature: string | null;
    now?: number;
    maxAgeMs?: number;
  },
) {
  if (!input.signature || !/^\d+$/.test(input.timestamp)) return false;

  const timestampMs = Number(input.timestamp) * 1000;
  const now = input.now ?? Date.now();
  const maxAgeMs = input.maxAgeMs ?? DEFAULT_MAX_AGE_MS;

  if (!Number.isSafeInteger(timestampMs) || Math.abs(now - timestampMs) > maxAgeMs) {
    return false;
  }

  const expected = createWebhookSignature(input);
  const actualBuffer = Buffer.from(input.signature, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");

  return (
    actualBuffer.length === expectedBuffer.length &&
    timingSafeEqual(actualBuffer, expectedBuffer)
  );
}
