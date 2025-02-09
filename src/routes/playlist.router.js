import {Router} from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

import { 
    creatPlayList,
    getUserPlayLists,
    getPlaylistById,
 } from "../controllers/playlist.controller.js";

 const router = Router();
 router.use(verifyJWT);


 router.route("/").post(
    // Use upload.none() if you are not uploading files.
    upload.none(),
    creatPlayList
);

router.route("/user/:userId").get( getUserPlayLists);

router.route("/:playlistId").get(getPlaylistById);


 export default router;