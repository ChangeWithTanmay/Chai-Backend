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


export { 
    createNewComment,
 };
