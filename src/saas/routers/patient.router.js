import { Router } from "express";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { upload } from "../../middlewares/multer.middleware.js";

import {
    createPatient,
} from "../controllers/patient.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/register").post(
    upload.none(), createPatient
);


export default router;