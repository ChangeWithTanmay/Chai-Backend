import { Router } from "express";
import {upload} from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { 
    registerUser, 
    loginUser, 
    logoutUser, 
    refereshAccessToken,
    changeCurrentPassword, 
    updateAccountDetails
} from "../controllers/user.controller.js";

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

router.route("/change-password").post(changeCurrentPassword);
router.route("/username-update").post(updateAccountDetails);


// https://youtu.be/7fjOw8ApZ1I?t=32298
// https://youtu.be/8k-kK3tsJFY?t=5571


export default router;