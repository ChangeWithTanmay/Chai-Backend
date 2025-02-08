import { asyncHandeler } from "../utils/asyncHandler.js";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// ## << Create A new Playlist >>
const creatPlayList = asyncHandeler(async (req, res) => {
    // TODO: 
    // 1. req.body -> name, Description.
    // 2. create DB. 
    // 3. responce.


    
    const { name, description } = req.body;
    
    if ([name, description].some((field) => field.trim() === "")) {
        throw new ApiError(400, "All field are required");
    }
    console.log(req.user._id)

    const playlist = await Playlist.create({
        name,
        description,

    });

    return res
        .status(201)
        .json(
            new ApiResponse(
                200,
                {
                    playlist
                },
                "Playlist Successfully created.."
            ))

})


export {
    creatPlayList,
}