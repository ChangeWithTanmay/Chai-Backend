import {Router} from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

import { 
    creatPlayList,
    getUserPlayLists,
 } from "../controllers/playlist.controller.js";

 const router = Router();
 router.use(verifyJWT);


 router.route("/").post(
    // Use upload.none() if you are not uploading files.
    upload.none(),
    creatPlayList
);

router.route("/:userId").get( getUserPlayLists)

 export default router;