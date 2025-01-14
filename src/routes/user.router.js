import { Router } from "express";
import {registerUser} from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js";

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


// https://youtu.be/7fjOw8ApZ1I?t=32298
// https://youtu.be/7fjOw8ApZ1I?t=32298


export default router;