import { Router } from "express";
import { registerUser, loginUser, logoutUser, refereshAccessToken } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
);

router.route("/login").post(loginUser)

// Secured routes

router.route("/logout").post(verifyJWT, logoutUser)
// Refresh Access Token
router.route("/refresh-token").post(refereshAccessToken)



// https://youtu.be/7fjOw8ApZ1I?t=32298
// https://youtu.be/8k-kK3tsJFY?t=5571


export default router;