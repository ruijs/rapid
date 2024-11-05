import crypto, { BinaryToTextEncoding } from "crypto";

export function getEncryptionIV(input: string) {
  const hash = crypto.createHash("sha512").update(input).digest("hex");
  return hash.substring(0, 12);
}

export function generatePubKeyFileContent(base64EncodedPubKey: string) {
  return `-----BEGIN PUBLIC KEY-----\n${base64EncodedPubKey}\n-----END PUBLIC KEY-----`;
}

const ENC_ALGORITHM: crypto.CipherGCMTypes = "aes-256-gcm";

// Decrypt data
export function decryptData(
  encryptedData: string,
  encryptedDataEncoding: BufferEncoding,
  decryptedDataEncoding: BufferEncoding,
  encryptionKey: string,
  encryptionIV: string,
  authTag: string,
) {
  const decipher = crypto.createDecipheriv(ENC_ALGORITHM, Buffer.from(encryptionKey, "base64"), encryptionIV);
  decipher.setAuthTag(Buffer.from(authTag, "base64"));
  const buff = Buffer.from(encryptedData, encryptedDataEncoding);
  return Buffer.concat([decipher.update(buff), decipher.final()]).toString(decryptedDataEncoding); // Decrypts data and converts to utf8
}

export function generateDigitalSignature(data: string, dataEncoding: BufferEncoding, privateKey: string): string {
  const sign = crypto.createSign("RSA-SHA256");
  const buffer = Buffer.from(data, dataEncoding);
  sign.update(buffer);
  return sign.sign(privateKey, "base64");
}

export function validateDigitalSignature(
  data: string,
  dataEncoding: BufferEncoding,
  signature: string,
  signatureEncoding: BinaryToTextEncoding,
  publicKey: string,
): boolean {
  const verify = crypto.createVerify("RSA-SHA256");
  const buffer = Buffer.from(data, dataEncoding);
  verify.update(buffer);
  return verify.verify(publicKey, signature, signatureEncoding);
}
