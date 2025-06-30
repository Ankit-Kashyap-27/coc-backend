import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.models.js"
import { uplodeOnCloudniary } from "../utils/cloudinary.js"
import { ApiResponce } from "../utils/ApiResponce.js"

const registerUser = asyncHandler(async (req, res) => {

    // Get user details from frontend
    //validation - not empty
    //Check if User already exists : Username, email
    //check for image , check for avatar 
    //uplode the to cloudinary , avatar 
    //create user object - create entry in DB
    //remove password and refress token field from resonse 
    //check for user creation
    // return res



    const { fullName, email, username, password } = req.body
    console.log("email:", email)

    if ([fullName, email, username, password].some((field) => field?.trim() === "")) {

        throw new ApiError(400, "all fields are required")
    }
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (existedUser) {
        throw new ApiError(409, "User with email or username alreday exist  ")
    }


    console.log(req.files);


    const avatarLocalPath = req.files?.avatar[0]?.path;

    //  const coverImageLocalPath = req.files?.coverImage[0]?.path

    let coverImageLocalPath;

    if (req.files, Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avtar file is required ")
    }


    const avatar = await uplodeOnCloudniary(avatarLocalPath)
    const coverImage = await uplodeOnCloudniary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avtar file is required ")
    }


    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "something went wrong while  regestring the user")
    }

    return res.status(201).json(
        new ApiResponce(200, createdUser, "user regestered successfully ")
    )

})


export { registerUser, }