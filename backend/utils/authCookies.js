export function createAuthCookie(token) {
  return [
    `token=${token}`,
    "HttpOnly",
    "Path=/",
    "SameSite=Strict",
    "Max-Age=604800" // 7 days
  ]
    .join("; ");
}
