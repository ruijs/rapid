import { RpdCert } from "../LicensePluginTypes";
import { decryptData, getEncryptionIV, validateDigitalSignature, generatePubKeyFileContent } from "./cryptoHelper";

export function extractCertLicense(encryptionKey: string, deployId: string, cert: RpdCert) {
  const iv = getEncryptionIV(deployId);
  const signature = cert.sig;
  const pub = generatePubKeyFileContent(cert.pub);
  const valid = validateDigitalSignature(cert.lic, "base64", signature, "base64", pub);
  if (!valid) {
    throw new Error("Certification validate failed.");
  }

  try {
    const licenseText = decryptData(cert.lic, "base64", "utf-8", encryptionKey, iv, cert.tag);
    return JSON.parse(licenseText);
  } catch (ex) {
    throw new Error("Certification parse failed.", {
      cause: ex,
    });
  }
}
