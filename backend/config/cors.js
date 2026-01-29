export default function applyCors(req, res) {
    const allowedOrigins = process.env.AllowedOrigins?.split(',').map(origin => origin.trim()) || [];
    const origin = req.headers.origin;

    if (origin && allowedOrigins.includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    }

    if (req.method === "OPTIONS") {
        res.statusCode = 204;
        res.end();
        return true;
    }

    return false;
}
