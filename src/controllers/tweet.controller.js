import { Tweet } from "../models/tweet.model.js";
import { asyncHandeler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose, { isValidObjectId } from "mongoose";


// 1. Creat Tweet 
const addTweet = asyncHandeler(async (req, res) => {
    const { content } = req.body;
    if (!content) {
        throw new ApiError(400, "Content is not comming..")
    }

    // Create New Tweet in DB.
    const tweet = await Tweet.create({
        content,
        owner: req?.user._id
    });

    if (!tweet) {
        throw new ApiError(500, "Tweet Successfully not created.");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    tweet
                },
                "Tweet Successfully created."
            )
        )
});


// 2. now User All Tweets
const nowUserAllTweets = asyncHandeler(async (req, res) => {
    const userId = req.user?._id;

    if (!userId) {
        throw new ApiError(400, "You are not not Loging || Plase Login again")
    }

    const tweet = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $project: {
                _id: 1,
                owner: 1,
                content: 1,
            }
        }
    ])

    if (!tweet) {
        throw new ApiError(500, "DataBase Error..");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    tweets: tweet
                },
                "Tweets comming Successfully.."
            )
        )
});



// 3. Id to find user All Tweets
const userIdToAllTweets = asyncHandeler(async (req, res) => {
    const { userId } = req.params;
    if (!userId) {
        throw new ApiError(400, "You are not provide userId, plase check your link");
    }

    const tweet = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $project: {
                _id: 1,
                owner: 1,
                content: 1,
            }
        }
    ])

    if (!tweet) {
        throw new ApiError(500, "DataBase Error..");
    }

    return res
        .status(200)
        .json(200,
            new ApiResponse(
                200,
                {
                    tweets: tweet
                },
                "Tweets comming Successfully.."
            )
        )
});


// 4. Update Tweet
const updateTweet = asyncHandeler(async (req, res) => {
    const {tweetId} = req.params;
    const { content } = req.body;

    if (!tweetId) {
        throw new ApiError(400, "Invalid tweet id..");
    }

    if (!content) {
        throw new ApiError(400, "Invalid content, please enter content..");
    }

    const varifyTweet = await Tweet.findById(tweetId);
    if (!varifyTweet) {
        throw new ApiError(404, "Tweet Id doesnot exist.");
    }


    // if playlist owner and req.user._id same or not.
    if (varifyTweet?.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(401, "Unathorize Access, You cannot be deleted.");
    }


    // Update in DB.
    const tweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: {
                content
            }
        },
        { new: true }
    );


    if (!tweet) {
        throw new ApiError(500, "Tweets is not updated.");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    tweet
                },
                "Tweet updated Successfully.."
            )
        )
});


// 5. Delete Tweet
const deleteTweet = asyncHandeler(async (req, res) => {
    const {tweetId} = req.params;
    if (!tweetId) {
        throw new ApiError(400, "You are not not Loging || Plase Login again")
    }

    // check tweetId is valid or not
    const varifyTweet = await Tweet.findById(tweetId);
    if (!varifyTweet) {
        throw new ApiError(404, "Tweet Id doesnot exist.");
    }

    // if playlist owner and req.user._id same or not.
    if (varifyTweet?.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(401, "Unathorize Access, You cannot be deleted.");
    }

    // Tweet delete in DB
    const tweet = await Tweet.findByIdAndDelete(tweetId)
    if (!tweet) {
        throw new ApiError(500, "Tweet connot deleted successfully || Plaese retry again.")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Tweet deleted successfully."
            )
        )

});



export {
    addTweet,
    nowUserAllTweets,
    userIdToAllTweets,
    updateTweet,
    deleteTweet,
}