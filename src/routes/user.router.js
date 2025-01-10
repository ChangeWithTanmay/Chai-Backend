import { Router } from "express";
import {registerUser} from "../controllers/user.controller.js";

const router = Router();

router.route("/register").post(registerUser);


// https://youtu.be/7fjOw8ApZ1I?t=30330

export default router;