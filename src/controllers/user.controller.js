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


// # AccessToken and RefreshToken method
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    // Use -> Jwt
    // Step 1: Database থেকে user খুঁজে বের করা
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found"); // যদি user না থাকে
    }

    // Step 2: Access token এবং refresh token তৈরি করা
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Step 3: Refresh token database-এ save করা
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // Step 4: Tokens return করা
    return { accessToken, refreshToken };


  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token"
    );
  }
};

// #Register User Steps

const registerUser = asyncHandeler(async (req, res) => {
  // 1. Get User detils from Frontend | Postman
  // 2. Validation - not empty
  // 3. check if user already exists: username, email
  // 4. Check for images, check for avatar
  // 5. Upload Image Cloudinary, avatar
  // 6. Create user object - create entry in db(MongoDB No-sql)
  // 7. Remove password and refresh token field from responce.
  // 8. Check for user creation.
  // 9. return Responce(res).

  // 1#. Get User detils from Front-end.

  const { fullName, email, username, password } = req.body;
  // console.log("email:", email);

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

  const existUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existUser) {
    throw new ApiError(409, "User with email and username already exists");
  }
  // console.log(req.files)

  // 4#. Check for images, check for avatar

  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  // Here coverImage is Not Comeing, than came error.  Next three line is solve this problem.
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files?.coverImage[0]?.path;
  }

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

// << Login User >>

const loginUser = asyncHandeler(async (req, res) => {
  // TO-DO
  // req body -> data (req body sai Data ley ayo.)
  // username or  email nahi aya too error vajo.
  // username or email -> login
  // find the user.
  // password check.
  // Access and referesh Token -> user
  // Send cookie.

  // 1#. req body -> data (req body sai Data ley ayo.)
  const { email, username, password } = req.body;
  console.log(email);


  // 2#. username or  email nahi aya too error vajo.
  if (!email && !username) {
    throw new ApiError(400, "username & email is required.");
  }

  // Here is an alternative of above code based on login discuss.
  // if (!(email || username)) {
  //   throw new ApiError(400, "username & email is required.");
  // }


  // 3#. username or email -> login
  const user = await User.findOne({
    // findOne is mongoDB finction.
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  // 4#. Password is check
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  // 5#. Access and referesh Token -> user
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

  // 6#. Send cookie.
  // Filter which Data, User not return.
  // Far sai DataBase mai call kaiya hai. But eish ko update karka-bhi kam ho sakta hai.
  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

  // sending cookies.
  const options = {
    httpOnly: true,
    secure: true
    // kya farak parta hai: eish cookie ko, Front-end sai koivi chenge nahi karsakta. only chenge for back-end. Dakh sakta but modify nahi karsakta.
  }

  console.log(options);

  return res
  .status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .json(
      new ApiResponse(
          200, 
          {
              user: loggedInUser, accessToken, refreshToken
          },
          "User logged In Successfully"
      )
  )


});

// # LogOutUser
const logoutUser = asyncHandeler(async(req,res)=>{
  // cookie -> clear
  // refreshToken -> reset
  // own Middleware
  await User.findByIdAndUpdate(
    req.user._id, // DataBase to find -> user id
    {
       $set: {
          refreshToken: undefined
       }
       // kaya kaya update karna hai
    },
    {
      new: true
      // return new updated value
    }
  )
// 2#. cookie -> clear
  const options = {
    httpOnly: true,
    secure: true
    // kya farak parta hai: eish cookie ko, Front-end sai koivi chenge nahi karsakta. only chenge for back-end. Dakh sakta but modify nahi karsakta.
  }

  return res
  .status(200)
  .clearCookie("accessToken", options)
  .clearCookie("refreshToken")
  .json(new ApiResponse(200, {}, "User logged Out"))
})

export { 
  registerUser, 
  loginUser,
  logoutUser,
};
