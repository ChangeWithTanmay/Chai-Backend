import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    addTweet,
    nowUserAllTweets,
    userIdToAllTweets,
    updateTweet,
    deleteTweet,
} from "../controllers/Tweet.controller.js";

const router = Router();
router.use(verifyJWT);

router.route("/")
    .post(upload.none(), addTweet)
    .get(nowUserAllTweets);

router.route("/:userId").get(userIdToAllTweets);

router.route("/:tweetId")
.patch(upload.none(), updateTweet)
.delete(deleteTweet);



export default router;