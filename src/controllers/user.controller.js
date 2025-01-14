import { asyncHandeler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

/*
const registerUser = asyncHandeler(async (req, res) => {
 return res.status(200).json({
    message: "Appy",
    });
  });
  */


// #Register User Steps

// 1. Get User detils from Frontend | Postman
// 2. Validation - not empty
// 3. check if user already exists: username, email
// 4. Check for images, check for avatar
// 5. Upload Image Cloudinary, avatar
// 6. Create user object - create entry in db(MongoDB No-sql)
// 7. Remove password and refresh token field from responce.
// 8. Check for user creation.
// 9. return Responce(res).

const registerUser = asyncHandeler(async (req, res) => {

  // 1#. Get User detils from Front-end.

  const { fullName, email, username, password } = req.body;
  console.log("email:", email);

  // 2#. Validation - not empty

  /* if(fullName === ""){
     throw new ApiError(400, "fullname  is required"); 
   } */

  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All field are required");
  }

  // 3#. check if user already exists: username, email

  const existUser = User.findOne({
    $or: [{ username }, { email }],
  });

  if (existUser) {
    throw new ApiError(409, "User with email and username already exists");
  }

  // 4#. Check for images, check for avatar

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar image is required");
  }

  // 5#. Upload Image Cloudinary, avatar

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar image is required");
  }

  // 6#. Create user object - create entry in db(MongoDB No-SQL)

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  // 7#. Remove password and refresh token field from responce.

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // 8#. Check for user creation.

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  // 9#. return Responce(res).

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User Register Successfully"));
});

export { registerUser };
