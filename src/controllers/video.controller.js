import { asyncHandeler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
    uploadOnCloudinary,
    uploadVideoCloudinary,
    deleteOnCloudinary
} from "../utils/cloudinary.js";
import { Video } from "../models/video.model.js";
import mongoose, { isValidObjectId } from "mongoose";



// # << PUBLISH A VIDEO >>

const publishAVideo = asyncHandeler(async (req, res) => {
    // TODO: get video, upload to cloudinary, create video
    // 1. check title & description coming or not
    // 2. Check video for Youtube video.
    const { title, description } = req.body;
    if ([title, description].some((field) => field.trim() === "")) {
        throw new ApiError(400, "All field are required");
    }

    // 2#. Ckheck video, for youtube.
    const videoFileLocalPath = req.files?.videoFile[0]?.path;

    // 3# Inetialy 'Thumbnail' is not coming than.
    let thumbnailLocalPath;
    if (
        req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length > 0
    ) {
        thumbnailLocalPath = req.files?.thumbnail[0]?.path;
    }
    // console.log(thumbnailLocalPath)

    // 3#. Upload videoFile
    const videoFile = await uploadVideoCloudinary(videoFileLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    // 4#. videoFile is comming or not.
    if (!videoFile) {
        throw new ApiError(400, "Video File is Require.");
    }

    // 5#. Find video Duration.
    console.log(videoFile?.url);
    console.log(videoFile?.duration);

    // 6#. Find video Owner -> req.user
    const findOwner = req.user?._id.toString();
    console.log(findOwner);

    // 6#. Create video object - create entry in db (MongoDB NO-SQL)

    const video = await Video.create({
        title,
        description,
        duration: videoFile.duration,
        videoFile: videoFile.url,
        thumbnail: thumbnail?.url || "",
        owner: findOwner
    })

    // check data is save or not.
    if (!video) {
        throw new ApiError(500, "Database error: Failed to video upload data.")
    }

    // 7#. return Responce(res)
    return res
        .status(201)
        .json(new ApiResponse(200, video, "Video Created Successfully"))

})

// # << Edit Video >>

const getVideoById = asyncHandeler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: get video by id
    // '67a34b2de2eef98aec361745'

    // Find Database using videoID
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Invalid User Id")
    }
    console.log(video?.videoFile);
    return res
        .status(200)
        .json(new ApiResponse(
            200,
            {
                videoURL: video?.videoFile
            },
            "Video find successfully."
        ));
})

// # << UPDATE VIDEO DESCRIPTION, TITLE & THUMBNAIL >>

const updateVideo = asyncHandeler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;

    if (!title && !description) {
        throw new ApiError(400, "Title & Description is required.");
    }

    if (!videoId) {
        throw new ApiError(503, "Invalid User Id");
    }

    // Access DataBase and collect oldThumbnail.
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(503, "Invalid User Id")
    }
    const oldThumbnailUrl = video?.thumbnail;

    // Upload New Thumbnail
    const newThumbnailPath = req.file?.path;
    console.log(req.file?.path);

    const newThumbnail = await uploadOnCloudinary(newThumbnailPath);
    console.log(newThumbnail)

    if (!newThumbnail) {
        throw new ApiError(500, "New Thumbnail is Not found.");
    }


    // check user and owner same or not.
    if (video?.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this video || User Authntication problem")
    }


    // Update in Database
    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title: title,
                description: description,
                thumbnail: newThumbnail?.url
            }
        },
        { new: true }
    )

    if (!updatedVideo) {
        throw new ApiError(500, "Database error: Failed to update video data.");
    }

    // Delete previous Thumbnail
    const deletedThumbnail = await deleteOnCloudinary(oldThumbnailUrl);

    console.log("Resently deleted image is:", oldThumbnailUrl)

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            {
                video: updatedVideo, deletedThumbnail: oldThumbnailUrl
            },
            "Video Updated Successfully"
        ))

})

// <## Delete video>
const deleteVideo = asyncHandeler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId) {
        throw new ApiError(400, "Missing require fields: videoID");
    }
    // Find video detiles using video id. | MongoDB
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Invalid User Id || Service is un avalabe");
    }

    // check video owner & login user same or not.
    if (video?.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this video || User Authntication problem");
    }

    // Delete video from MongoDB
    const delVideo = await Video.findByIdAndDelete(videoId);

    if (!delVideo) {
        throw new ApiError(500, "Failed to delete the video in DB || Internal Server Error");
    }


    // Delete Video and Thumbnail from Cloudinary

    const delVideoFileOnCloudinary = await deleteOnCloudinary(video?.videoFile);
    const delThumbnailOnCloudinary = await deleteOnCloudinary(video?.thumbnail);
    if (!delVideoFileOnCloudinary) {
        throw new ApiError(500, "Internal Server Error, video file can't deleted");
    }
    if (!delThumbnailOnCloudinary) {
        throw new ApiError(500, "Internal Server Error, Thumbnail can't deletd");
    }

    // Status message
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    deletedVideoUrl: video?.videoFile
                },
                "Video deleted succesfully"
            )
        )
});


// # Video Public &  Private.
const togglePublishStatus = asyncHandeler(async (req, res) => {
    
    const { videoId } = req.params;
    if (!videoId) {
        throw new ApiError(503, "Invalid User Id")
    }

    if (!isValidObjectId(videoId)) {
        throw new Error("Invalid video ID");
    }

    const video = await Video.findById(videoId);
    // check user and owner same or not.
    if (video?.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this video || User Authntication problem")
    }

    // Change Touggle
    // video.isPublished = !video.isPublished;

    const updateVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                isPublished: !video.isPublished
            }
        },

        { new: true }
    )
    if(!updateVideo){
        throw new ApiError(503,"Internal Server Error || video Public Not Successfully");
        
    }
    // View Video status
    const videoStatus = await Video.aggregate([
        {
            $match: {
                _id:new mongoose.Types.ObjectId(video._id)
            }
        },
        {
            $project: {
                _id: 1,
                isPublished: 1,
                status: { $cond: { if: "$isPublished", then: "Public", else: "Private" } }
            }
        }
    ])

    // res  -> return
    return res
        .status(200)
        .json(new ApiResponse(200, {
            videoStatus
        }, "Toggle Updated Successfully.."))

})

export {
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
}