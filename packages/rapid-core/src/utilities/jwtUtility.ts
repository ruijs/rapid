import { sign, verify, decode, Secret } from "jsonwebtoken";
import { encode as base64Encode } from "~/deno-std/encoding/base64";
import crypto from "crypto";

export function createJwt(payload: Record<string, any>, secret: Secret) {
  return sign(payload, secret, {
    algorithm: 'HS512',
  });
}

export function verifyJwt(token: string, secret: Secret) {
  return verify(token, secret, {
    algorithms: ['HS512'],
  });
}

export function decodeJwt(token: string) {
  return decode(token, { complete: true});
}

export async function generateJwtSecretKey() {
  const key = await crypto.subtle.generateKey(
    { name: "HMAC", hash: "SHA-512" },
    true,
    ["sign", "verify"],
  );
  
  const exportedKey = await crypto.subtle.exportKey("raw", key);
  return base64Encode(exportedKey);
}