import { asyncHandeler } from "../utils/asyncHandler.js";
import { Playlist } from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose, { isValidObjectId } from "mongoose";

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

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user._id,
    });

    return res.status(201).json(
        new ApiResponse(
            200,
            {
                playlist,
            },
            "Playlist Successfully created.."
        )
    );
});

// ## << get user playlists >>
const getUserPlayLists = asyncHandeler(async (req, res) => {
    const { userId } = req.params;
    if (!userId) {
        throw new ApiError(503, "Invalid user id");
    }

    // ## Write aggregation Pipeline
    const userPlaylists = await Playlist.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId),
            },
        },
        {
            $project: {
                _id: 1,
                name: 1,
                description: 1,
                videos: 1,
                owner: 1,
            },
        },
    ]);

    if (!userPlaylists) {
        throw new ApiError(404, "No Have User Id");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                userPlaylists,
            },
            "User Playlistfind Successfully.."
        )
    );
});

// # << GET PLAYLIST BY ID>>

const getPlaylistById = asyncHandeler(async (req, res) => {
    //TODO: get playlist by id
    const { playlistId } = req.params;
    if (!playlistId) {
        throw new ApiError(503, "Data is not come, Invalid Playlist ID");
    }

    // Find _id from Playlist Database.
    const getPlayList = await Playlist.findById(playlistId);
    if (!getPlayList) {
        throw new ApiError(403, "No have, This Playlist  not exist..");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                getPlayList
            },
            "Playlist find successfully.."
        )
    );
});

// ADD VIDEO IN PLAYLIST
const addVideoToPlaylist = asyncHandeler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (!playlistId || !videoId) {
        throw new ApiError(400, "PlaylistId & video is required.");
    }

    const varifyVideoID = await Video.findById(videoId);
    if (!varifyVideoID) {
        throw new ApiError(404, "Video doesnot exist.");
    }

    // varify Playlist
    const varifyPlaylist = await Playlist.findById(playlistId);
    if (!varifyPlaylist) {
        throw new ApiError(404, "Playlist Id doesnot exist.");
    }

    // Playlist Have Video

    const playlistAllVideo = varifyPlaylist.videos.map(
        (id) => {
            if (id.toString() === varifyVideoID?._id.toString()) {
                throw new ApiError(400, "Video Id is already exist..");
            }
        }
    )



    // updatePlaylist in DB.

    const updatePlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $push: {
                videos: varifyVideoID?._id,
            },
        },
        { new: true }

    );

    // Update playlist is comming or not.
    if (!updatePlaylist) {
        throw new ApiError(500, "Database Error: Failed to video upload data.");
    }

    // Return
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    playlist: updatePlaylist,
                },
                "Playlist Updated Successfully.."
            )
        );
});


// Remove Video form Playlist
const removeVideoToPlaylist = asyncHandeler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (!playlistId || !videoId) {
        throw new ApiError(400, "PlaylistId & video is required.");
    }

    // varify Video ID
    const varifyVideoID = await Video.findById(videoId);
    if (!varifyVideoID) {
        throw new ApiError(404, "Video doesnot exist.");
    }

    // varify Playlist
    const varifyPlaylist = await Playlist.findById(playlistId);
    if (!varifyPlaylist) {
        throw new ApiError(404, "Playlist Id doesnot exist.");
    }

    // Playlist Have Video

    const playlistAllVideo = varifyPlaylist.videos.map(
        (id) => {
            if (id.toString() !== varifyVideoID?._id.toString()) {
                throw new ApiError(400, "Video Id is not exist..");
            }
        }
    )



    // Delete video in Aggrigaation pipeline.
    const deletedVideoInPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: {
                videos: videoId
            }
        },
        { new: true }
    );
    if (!deletedVideoInPlaylist) {
        throw new ApiError(500, "Database error: Failed to video upload data.")
    }

    // Return 
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                playlist: deletedVideoInPlaylist,
            },
            "Playlist to delete video successfully.."
        )
    )
})


// Delete Playlist
const deletePlaylist = asyncHandeler( async(req,res)=> {
    const {playlistId}=req.params;
    if(!playlistId){
        throw new ApiError(400, "Playlist is not found.");
    }

    // find playlist have in Playlist Schema.
    const varifyPlaylist = await Playlist.findById(playlistId);
    if (!varifyPlaylist) {
        throw new ApiError(404, "Playlist Id doesnot exist.");
    }
    console.log("Varify Playlist:", varifyPlaylist?.owner.toString())
    console.log("req.user Id",req.user?._id.toString())
    // if playlist owner and req.user._id same or not.
    if(varifyPlaylist?.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(401, "Unathorize Access, You cannot be deleted."); 
    }

    // Delete value
    const playlistDelete = await Playlist.findByIdAndDelete(playlistId)
    if(!playlistDelete){
        throw new ApiError(500,  "Database Error: Failed to video upload data.")
    }

    // Return
    return res
    .status(200)
    .json(
        200,
        "Playlist deleted successfully.."
    )
})


// Updated Playlist
const updatePlaylist = asyncHandeler( async(req, res) => {
    const {name, description} = req.body;
    const { playlistId } = req.params;

    if(!name || !description){
        throw new ApiError(400,"name & Playlist is require..")
    }

    // find playlist have in Playlist Schema.
    const varifyPlaylist = await Playlist.findById(playlistId);
    if (!varifyPlaylist) {
        throw new ApiError(404, "Playlist Id doesnot exist.");
    }

    // if playlist owner and req.user._id same or not.
    if(varifyPlaylist?.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(401, "Unathorize Access, You can't deleted."); 
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set:{
                name,
                description
            }
        },
        {
            new: true
        }
        
    )

    if(!updatedPlaylist){
        throw new ApiError(500, "Playlist is not Exist || Database Server error");
    }

    // return
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                playlist: updatedPlaylist
            },
            "Playlist Updated Successfully.."
        )
    )
    
})

export {
    creatPlayList,
    getUserPlayLists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoToPlaylist,
    deletePlaylist,
    updatePlaylist,
};
