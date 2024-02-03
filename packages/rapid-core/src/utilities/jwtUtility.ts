
export function getJWTKey() {
  return "";
}

export async function createJWT(payload: Record<string, any>) {
  return "";
}

export async function verifyJWT(jwt: string) {
  return {};
}

export async function decodeJWT(jwt: string) {
  return { header: {}, payload: {}, signature: {} };
}