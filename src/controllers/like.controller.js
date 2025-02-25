import { Like } from "../models/like.model.js";
import { Comment } from "../models/comment.model.js";
import { asyncHandeler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose, { isValidObjectId } from "mongoose";

// #Toggle Video Like
const toggleVideoLike = asyncHandeler(async (req, res) => {
    // Todo
    // 1. Find value in req.param;
    // 2. if value is comming or not.
    // 3. check comming value is mongoose object is NOT.
    const { videoId } = req.params;
    if (!videoId) {
        throw new ApiError(400, "You cannot provide Videoid, Please check request link.")
    }

    // Validate if videoId is a proper MongoDB ObjectId
    if (!isValidObjectId(videoId)) {
        throw new ApiError(404, "It is not video id");
    }

    // 4. Chack video like already have not.
    const alreadylike = await Like.findOne({
        video: videoId,
        likedBy: req.user._id
    });

    // video is not Liked, than create Like.
    if (!alreadylike) {
        const like = await Like.create({
            video: videoId,
            likedBy: req.user._id
        })

        if (!like) {
            throw new ApiError(500, "Database Error || Please try again")
        }

        return res
            .status(201)
            .json(
                new ApiResponse(
                    200,
                    like,
                    "Video is Like Successfully.."
                )
            );
    }
    else {
        // Video already Like, than Delete like.
        // Remove Like Document.
        const unLike = await Like.findByIdAndDelete(alreadylike._id);

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    unLike,
                    "Video is Unlike Successfully"
                )
            );
    }
});


// # Toggle Comment Like.
const toggleCommentLike = asyncHandeler(async (req, res) => {
    // TODO: TOGGLE COMMENT
    // 1. get Comment Id -> Params.
    // 2. Params Come or not.
    // 3. Comment Id is Valid or not. -> DataBase.
    // 4. If Comment is valid, comming or not.
    // 5. check Already comment like or not.
    // 6. No like, than create like.
    // 7. Like is present than Delete.


    const { commentId } = req.params;
    if (!commentId) {
        throw new ApiError(400, "Please Enter videoId, Please check requst Link");
    }

    // Validate if videoId is a proper MongoDB ObjectId
    if (!isValidObjectId(commentId)) {
        throw new ApiError(404, "It is not valid comment id.");
    }

    // check comment is Already like or not.
    const alreadyLikedComment = await Like.findOne({
        comment: commentId,
        likedBy: req.user?._id,
    });


    // If Like Not has, Than Create Document.
    if (!alreadyLikedComment) {
        const like = await Like.create({
            comment: commentId,
            likedBy: req.user?._id,
        });

        return res
            .status(201)
            .json(
                new ApiResponse(
                    200,
                    like,
                    "Comment is Successfully Like."
                )
            );
    }
    else {
        // If Like Already Like, than click -> Delete Documnt
        const like = await Like.findByIdAndDelete(alreadyLikedComment._id);

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    like,
                    "Comment like Successfully deleted || Comment is Unlike."
                )
            );
    }

});

// ## Toggle Tweet Like.
const toggleTweetLike = asyncHandeler(async (req, res) => {
    const { tweetId } = req.params;
    if (!tweetId) {
        throw new ApiError(400, "Please enter Tweet id, please check your request URL.");
    }
    // check tweet id is valid mongoDB.
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(404, "Invalid tweet Object id.");
    }

    // tweet is Already Like or not. check in DB.
    const alreadyTweet = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user?._id
    })

    // Logic if like, condition convert unlike.
    if (!alreadyTweet) {
        // Tweet Already not like.
        const like = await Like.create({
            tweet: tweetId,
            likedBy: req.user?._id
        });

        if (!like) {
            throw new ApiError(500, "DB error, Please re-try || Tweet not like, DB Proble,");
        }

        return res
            .status(201)
            .json(
                new ApiResponse(
                    200,
                    like,
                    "Tweet Like Successfully Like.."
                )
            );
    } else {
        const like = await Like.findByIdAndDelete(alreadyTweet._id);
        if (!like) {
            throw new ApiError(500, "DB error, Tweet Like not deleted.");
        }

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    like,
                    "Tweet Like Successfully Deleted"
                )
            );
    }
});


// ## Get Like All video
const getLikedVideos = asyncHandeler(async (req, res) => {
    // const likedVideo = await Like.aggrigation
});


export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
};