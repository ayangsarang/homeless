// Edge Runtime 호환: Web Crypto API 사용
const TOKEN_SALT = "jiyoon-yahak-static-salt-v1";
export const AUTH_COOKIE = "yahak-admin";

async function sha256(input: string): Promise<string> {
  const buf = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function tokenForPassword(password: string): Promise<string> {
  return sha256(password + TOKEN_SALT);
}

export async function verifyToken(
  token: string | undefined,
  password: string | undefined,
): Promise<boolean> {
  if (!token || !password) return false;
  const expected = await tokenForPassword(password);
  return token === expected;
}
