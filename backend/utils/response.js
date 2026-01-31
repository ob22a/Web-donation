export function sendJson(res, status, data, cookies = []) {
  if (res.headersSent) return;

  res.setHeader("Content-Type", "application/json");

  if (cookies.length) {
    res.setHeader("Set-Cookie", cookies);
  }

  res.statusCode = status;
  res.end(JSON.stringify(data));
}
