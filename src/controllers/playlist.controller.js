import { asyncHandeler } from "../utils/asyncHandler.js";
import { Playlist } from "../models/playlist.model.js";
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
  const userPlaylist = await Playlist.aggregate([
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

  if (!userPlaylist) {
    throw new ApiError(404, "No Have User Id");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        userPlaylist,
      },
      "User Playlistfind Successfully.."
    )
  );
});

export { 
    creatPlayList, 
    getUserPlayLists 
};
