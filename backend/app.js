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

/*
 These are added so that we can prevent MissingSchemaError when we populate this registers the schemas early 
 It is callled preregister model 
*/

import './models/User.js';
import './models/Donor.js';
import './models/NGO.js';
import './models/Campaign.js';
import './models/Donation.js';

/*
    Since this is pure node project we will use this to manually collect chunk of data to req.body
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
                // We reurn empty object when error and routes will catch that it's empty
                resolve({});
            }
        })
    })
}

/**
    This is our server 
    Architecture: This uses a simple routing pattern where each route module
    returns true if it handled the request, false otherwise. This is sequential route checking
 */
const server = http.createServer(async (req, res) => {
    try {
        const corsHandled = applyCors(req, res);
        if (corsHandled) return; // This means the status code is OPTIONS we don't need to compute anything else

        req.body = {};
        const contentType = req.headers['content-type'] || '';

        if (contentType.includes('application/json') && (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH')) {
            req.body = await parseJSONBody(req);
        }

        const parsedUrl = url.parse(req.url, true);
        const { pathname } = parsedUrl;

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

(async () => {
    await connectDB();
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
})();