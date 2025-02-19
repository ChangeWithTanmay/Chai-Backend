import { Comment } from "../models/comment.model.js";
import { asyncHandeler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";

// ## Create New Comment

const createNewComment = asyncHandeler(async (req, res) => {
  // TODO
  // 1. Input Content in User
  // 2. Check Value is comming or not.
  // 3. Create a Comment in DB.
  // 4. If check comment succssfully created or not.
  // 5. return.

  const { content } = req.body;
  const { videoId } = req.params;

  if (!content) {
    throw new ApiError(400, "Please enter Comment, field is required.");
  }

  if (!videoId) {
    throw new ApiError(
      400,
      "Video id is not comming, please cheack request URL"
    );
  }

  // Video is valid or not
  const isvalidVideo = await Video.findById(videoId);
  if (!isvalidVideo) {
    throw new ApiError(404, "Video is not found.");
  }

  const comment = await Comment.create({
    content,
    video: isvalidVideo._id,
    owner: req.user._id,
  });

  return res.status(201).json(
    new ApiResponse(
      200,
      {
        comment,
      },
      "Video Comment Created Successfully.."
    )
  );
});

// ## Update Comment
const updateComment = asyncHandeler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  if (!content || !commentId) {
    throw new ApiError(400, "Content & Comment value is required.");
  }

  // Comment is valid or not
  const isvalidComment = await Comment.findById(commentId);
  if (!isvalidComment) {
    throw new ApiError(404, "Video is not found.");
  }

  // Check Comment owner same than Update.
  if (req.user._id.toString() !== isvalidComment.owner.toString()) {
    throw new ApiError(404, "Do not Update, this Comment.");
  }

  const comment = await Comment.findByIdAndUpdate(
    isvalidComment._id.toString(),
    {
      $set: {
        content,
      },
    },
    {
      new: true,
    }
  );

  if (!comment) {
    throw new ApiError(500, "DataBase Error | Please try again.");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        comment,
      },
      "Video comment Successfully Update."
    )
  );
});

// ## Delete Comment

const deleteComment = asyncHandeler(async (req, res) => {
  const { commentId } = req.params;
  if (!commentId) {
    throw new ApiError(400, "Feild is required please check Request URL");
  }

  // Comment is valid or not
  const isvalidComment = await Comment.findById(commentId);
  if (!isvalidComment) {
    throw new ApiError(404, "Video is not found.");
  }

  // findout Video owner
  const video = await Video.findById(isvalidComment.video);
  if (!video) {
    throw new ApiError(404, "Invalid Video");
  }

  // Check Login user and comment owner is same & not || Login user and video owner is Same & not.
  if (
    req.user._id.toString() !== isvalidComment.owner.toString() ||
    req.user._id.toString() !== video.owner.toString()
  ) {
    throw new ApiError(
      403,
      "You can't be deleted, You are not video owner || comment owner"
    );
  }

  // Now Delete.
  const delComment = await Comment.findByIdAndDelete(
    isvalidComment._id.toString(),
    { new: true }
  );

  if (!delComment) {
    throw new ApiError(500, "delComment Not be deleted.");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        result: delComment,
      },
      "Comment Deleted Successfully"
    )
  );
});




export { 
    createNewComment, 
    updateComment, 
    deleteComment,
};
