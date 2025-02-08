import {Router} from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

import { 
    creatPlayList,
 } from "../controllers/playlist.controller.js";

 const router = Router();
 router.use(verifyJWT);


 router.route("/").post(creatPlayList);

 export default router;