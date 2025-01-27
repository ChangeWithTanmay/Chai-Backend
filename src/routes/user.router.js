import { Router } from "express";
import {upload} from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { 
    registerUser, 
    loginUser, 
    logoutUser, 
    refereshAccessToken,
    changeCurrentPassword, 
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory,
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

// only verify person, can change & access. That is reasion. I am use "varifyJWT"
router.route("/logout").post(verifyJWT, logoutUser)
// Refresh Access Token
router.route("/refresh-token").post(refereshAccessToken)

router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/username-update").post(verifyJWT,updateAccountDetails);

router.route("/current-user").get(verifyJWT,  getCurrentUser);

router.route("/update-account-details").patch(verifyJWT,  updateAccountDetails);

// UPLOAD COME FOR MULTER MIDDLE-WARE, THAT IS REASION. I AM USE UPLOAD. upload.single -> means upload only a single image.
router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar);

router.route("/cover-mage").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);

// Here username is important, beacuse /channel/wow.contai
router.route("/chanel/:username").get(verifyJWT,  getUserChannelProfile);

router.route("/history").get(verifyJWT,  getWatchHistory);

router.route()

export default router;