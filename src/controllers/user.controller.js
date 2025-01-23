import { asyncHandeler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary, deleteOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"

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

// # << Register User Steps >>

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

// # << Login User >>

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

// # << LogOutUser >>

const logoutUser = asyncHandeler(async (req, res) => {
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


// # << Refresh Token >>

const refereshAccessToken = asyncHandeler(async (req, res) => {
  // Todo
  // 1. Cookie -> find Access Refresh Token || Body -> find Access Token(Mobile app).
  // 2. check incomeing cookie is coming is not.
  // 3. Refresh token varifying -> jwt. decodedToken form.
  // 4. MongoDb to Access user Detials.

  // 1#. Cookie -> find Access Refresh Token || Body -> find Access Token(Mobile app).
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
  console.log("incomingRefreshToken:", incomingRefreshToken);

  // 2#. check incomeing cookie is coming is not.
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unathorized Request");
  }

  // 3#. Use Try and catch -> using try and catch.
  try {

    // 4#. Token is varify -> jwt. decodedToken form.
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRCT
    )

    if (!decodedToken) {
      throw new ApiError(403, "Refresh token mismatch. Please log in again.");
    }
    // console.log("DecodedToken",decodedToken);

    // When Created refreshToken finction "../models/user.model.js". I am only return "_id: this._id" value. 
    // Useing _id esily access user all detils.

    // 5#. MongoDb to Access user Detials.
    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid Refresh token");
    }


    // 6#. Maching User refreshToken and incomeingRefreshToken.
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used")
    }

    // 7#. Genarate Access token and This token save in Database.
    // console.log("User id:", user?._id)

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);


    // 8#. Set Options.

    const options = {
      httpOnly: true,
      secure: true
    }

    return res
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken: accessToken,
            refreshToken: refreshToken
          },
          "Access token refreshed"
        )
      )

  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Refresh token");
  }



})

// ## CHENGE PASSWORD

const changeCurrentPassword = asyncHandeler(async (req, res) => {
  // 1#. req.body to recive new & old password.
  const { oldPassword, newPassword } = req.body;

  // 2#. User id have or not.
  const user = await User.findById(req.user?._id);

  // 3#. check password carect or not.
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

   // 4#. if possword is coming and not.
   if(!isPasswordCorrect){
    throw new ApiError(400, "Invalid password.")
   }

   //5. Updata password.
   user.password = newPassword;

   //6. Sava -> user.
   await user.save({
    validateBeforeSave: false
   })

   //7. res -> return
  return res
  .status(200)
  .json(new ApiResponse(200,"Password chenge successfully"));
});

// ## GET CURRENT USER

const getCurrentUser = asyncHandeler(async(req, res) =>{
  return res
  .status(200)
  .json(200, req.user, "Current user fatched successfully")
})


// ## UPDATE ACCOUNT DETAILS

const updateAccountDetails = asyncHandeler(async (req, res) => {
  const { email,fullName} = req.body;
  console.log(email);

  if(!fullName || !email){
    throw new ApiError(400, "All fields are  required");
  }
  console.log(fullName);
  console.log(req.user?._id)

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        fullName,
        email: email
      }
    },
    {new: true}
  ).select("-password")
  // using select -> don't select password fiels মানে শুধু password বাদ দেওয়া।  
  return res
  .status(200)
  .json(new ApiResponse(200, user, "Accunt details updated successfully."))
});


// ## UPDATE AVATAR
const updateUserAvatar = asyncHandeler(async(req, res) =>{
  // 1.# req to find Local path.
  const avatarLocalPath = req.file?.path;

  // 2# Avatar is comming and Not.
  if(!avatarLocalPath){
    throw new ApiError(400, "Avater file is missing");
  }
  // 3# New Avatar Image -> Upload in cloudinary 
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if(!avatar.url){
    throw new ApiError(400, "Error while uploading on avatar")
  }
  // 4# Database(Schema) User to find `_id`
  const loggedInUser = await User.findById(user._id);


  // 6#  New Avater Update in Database.
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        avatar: avatar.url
      }
    },
    {
      new: true
    }
  ).select("-password")
  // select("-password") -> means with-out password. Data Save. 

    // 5# Privious Avatar Delete in Cloudinary.
    const deleteImageUrl = await deleteOnCloudinary(loggedInUser.avatar);

    if(!deleteImageUrl){
      throw new ApiError(500, "ailed to delete the image due to a server error. Please try again later.")
    }

  return res
  .status(200)
  .json(new ApiResponse(
    200, 
    {
      user: user, deleteImageUrl
    },
    "Avater Updated successfully."
  ))

})


const updateUserCoverImage = asyncHandeler(async(req, res) =>{
  const coverImageLocalPath = req.file?.path;

  if(!coverImageLocalPath){
    throw new ApiError(400, "Cover Image file is missing");
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if(!coverImage.url){
    throw new ApiError(400, "Error while uploading on cover Image")
  }

    // 4# Database(Schema) User to find `_id`
    const loggedInUser = await User.findById(user?._id);


  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        coverImage: coverImage.url
      }
    },
    {
      new: true
    }
  ).select("-password")

    // 5# Privious Avatar Delete in Cloudinary.
    const deleteImageUrl = await deleteOnCloudinary(loggedInUser?.coverImage);

    if(!deleteImageUrl){
      throw new ApiError(500, "ailed to delete the image due to a server error. Please try again later.")
    }

  return res
  .status(200)
  .json(new ApiResponse(
    200, 
    {
      user: user, deletedCoverImage: deleteImageUrl
    }, 
    "Cover Image Updated successfully."))

})

export {
  registerUser,
  loginUser,
  logoutUser,
  refereshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,

};
