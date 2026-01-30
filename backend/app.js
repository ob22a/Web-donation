import http from 'http'
import url from 'url'
import 'dotenv/config'

import connectDB from './config/db.js';
import applyCors from './config/cors.js';
import { sendJson } from './utils/response.js';
import authRoutes from './routes/authRoutes.js';
import ngoRoutes from './routes/NGORoutes.js';
import campaignRoutes from './routes/campaignRoutes.js';
import donorRoutes from './routes/donorRoutes.js';
import donationRoutes from './routes/donationRoutes.js';

/**
 * Pre-register models to prevent MissingSchemaError during population.
 * 
 * Why this is necessary: When Mongoose populates references (e.g., Campaign.populate('ngo')),
 * it needs the schema to be registered. Importing models here ensures all schemas are loaded
 * before any route handlers attempt to use populate().
 */
import './models/User.js';
import './models/Donor.js';
import './models/NGO.js';
import './models/Campaign.js';
import './models/Donation.js';

/**
 * Parses JSON request body from incoming HTTP request.
 * 
 * Why custom parser instead of express.json(): This is a vanilla Node.js HTTP server,
 * not Express. We manually handle the stream-based request body parsing.
 * 
 * @param {http.IncomingMessage} req - The HTTP request object
 * @returns {Promise<Object>} Parsed JSON object or empty object on parse error
 */
function parseJSONBody(req) {
    return new Promise((resolve) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const parsed = JSON.parse(body);
                resolve(parsed);
            } catch (error) {
                // Return empty object on parse error to prevent crashes
                // Route handlers should validate required fields anyway
                resolve({});
            }
        })
    })
}

/**
 * Main HTTP server request handler.
 * 
 * Architecture: This uses a simple routing pattern where each route module
 * returns true if it handled the request, false otherwise. This allows for
 * sequential route checking without complex routing middleware.
 * 
 * Request flow:
 * 1. CORS preflight/options handled first
 * 2. Parse JSON body if Content-Type matches
 * 3. Extract pathname from URL
 * 4. Try each route handler in order until one matches
 * 5. Return 404 if no route matches
 */
const server = http.createServer(async (req, res) => {
    try {
        // Handle CORS preflight requests (OPTIONS) and set CORS headers
        const corsHandled = applyCors(req, res);
        if (corsHandled) return;

        // Initialize empty body, will be populated if JSON content detected
        req.body = {};
        const contentType = req.headers['content-type'] || '';

        // Only parse JSON body for methods that typically send data
        // This avoids unnecessary parsing for GET/OPTIONS requests
        if (contentType.includes('application/json') && (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH')) {
            req.body = await parseJSONBody(req);
        }

        const parsedUrl = url.parse(req.url, true);
        const { pathname } = parsedUrl;

        // Route handlers return true if they handled the request
        // Order matters: more specific routes should be checked first
        if (await authRoutes(req, res, pathname)) return;
        if (await ngoRoutes(req, res, pathname)) return;
        if (await campaignRoutes(req, res, pathname)) return;
        if (await donorRoutes(req, res, pathname)) return;
        if (await donationRoutes(req, res, pathname)) return;

        // No route matched - return 404
        return sendJson(res, 404, { message: 'Route Not Found' });
    } catch (error) {
        console.error('Server Error:', error);
        sendJson(res, 500, { message: 'Internal Server Error' });
    }
})

const PORT = process.env.PORT || 3000;

/**
 * Server startup: Connect to database first, then start listening.
 * 
 * Why async IIFE: We need to await the database connection before starting
 * the server. Using an async IIFE allows us to use await at the top level
 * without making the entire file a module with top-level await (which requires
 * specific Node.js configuration).
 */
(async () => {
    await connectDB();
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
})();