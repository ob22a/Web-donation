import { getAllNGOs, getNGOById, updateNGO, uploadNgoBanner } from "../controllers/NGOController.js";
import { auth } from "../middleware/authMiddleware.js";

export default async function ngoRoutes(req,res,pathname){
    if(req.method === 'GET' && pathname === '/api/ngo'){
        await getAllNGOs(req,res);
        return true;
    }
    if(req.method === 'GET' && pathname.startsWith('/api/ngo/')){
        await getNGOById(req,res);
        return true;
    }
    if(req.method === 'PUT' && pathname === '/api/ngo'){
        if(!auth(req,res)) return false;
        await updateNGO(req,res);
        return true;
    }
    if (req.method === "POST" && pathname.startsWith("/api/ngo/banner/")) {
        if (!auth(req, res)) return true;

        const id = pathname.split("/").filter(Boolean)[3];
        req.params = { id };

        await uploadNgoBanner(req, res);
        return true;
    }
    return false;
}