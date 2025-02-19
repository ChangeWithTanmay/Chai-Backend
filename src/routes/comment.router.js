import {Router} from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

import {
    createNewComment,
} from "../controllers/comment.controller.js";


const router= Router();

router.use(verifyJWT);

router.route("/:videoId").post(
    upload.none(),
    createNewComment
)


export default router;