import { ApiError } from "../utils/ApiError.js";
import { asyncHandeler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";


export const verifyJWT = asyncHandeler(async(req, _, next)=>{
    // res is meny time not use. that is resion use _
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace(" Bearer", "")
    
        if (!token) {
            throw new ApiError(401, "Unanthorized request")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user){
            // NEXT_VIDEO: discuss about frontend
            throw new ApiError(401, "Invalid Access Token")
        }
    
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }

})


// https://youtu.be/8k-kK3tsJFY?t=3749