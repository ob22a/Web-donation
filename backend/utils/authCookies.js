export function createAuthCookie(token) {
  const isProd = process.env.NODE_ENV === "production";

  return [
    `token=${token}`,
    "HttpOnly",
    "Path=/",
    "SameSite=Strict",
    isProd ? "Secure" : "",
    "Max-Age=604800" // 7 days
  ]
    .filter(Boolean)
    .join("; ");
}
