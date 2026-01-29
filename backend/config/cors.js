const allowedOrigins = process.env.AllowedOrigins?.split(',').map(origin => origin.trim()) || []; // just in case env was not loaded or is empty by mistake

export default function applyCors(req, res) {
    const origin = req.headers.origin;

    if (allowedOrigins.includes(origin)) res.setHeader("Access-Control-Allow-Origin", origin);

    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
    );

    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
    ); // what the client can send in the headers

    res.setHeader("Access-Control-Allow-Credentials", "true"); // we're able to send cookies from the client

    // Preflight requst meaning if the brower is checking whether you are allowed to make the request 
    // This is dne before every reqest for saftey 
    if (req.method === "OPTIONS") {
        res.writeHead(204); // used when successfull response but no content
        res.end();
        return true; // We return true so that no additional processing is needed for the preflight reques / header = OPTIONS
    }

    return false;
}
