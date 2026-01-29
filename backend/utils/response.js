export function sendJson(res, status, data, cookies = []) {
  if (res.headersSent) return;

  const headers = {
    "Content-Type": "application/json",
  };

  if (cookies.length) {
    headers["Set-Cookie"] = cookies;
  }

  res.writeHead(status, headers);
  res.end(JSON.stringify(data));
}