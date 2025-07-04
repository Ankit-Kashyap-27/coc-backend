import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponce } from "../utils/ApiResponce.js"
import jwt from 'jsonwebtoken';



const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        console.log(accessToken, refreshToken, "1")
        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "something went wrong while generating refresh and access token")
    }
}


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
    // const avatarLocalPath = (Array.isArray(req?.files?.avatar) && req.files.avatar.length > 0)
    //     ? req.files.avatar[0].path
    //     : null;

    //  const coverImageLocalPath = req.files?.coverImage[0]?.path

    let coverImageLocalPath;

    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }


    if (!avatarLocalPath) {
        throw new ApiError(400, "Avtar file is required ")
    }


    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

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

const loginUser = asyncHandler(async (req, res) => {

    //rew.body -> data
    //username or email 
    //find the user
    //password check
    //access the refresh token
    //send cookie

    const { email, username, password } = req.body
    if (!username && !email) {
        throw new ApiError(400, "username or password is required")
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(404, "User dosen't exist")
    }

    const isPasswordValide = await user.isPasswordCorrect(password)

    if (!isPasswordValide) {
        throw new ApiError(401, "invalid  user credentials")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)


    console.log(accessToken, refreshToken, "2")
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json(
        new ApiResponce(
            200, {
            user: loggedInUser, accessToken, refreshToken
        },
            "User logged in successfully"
        )
    )

})

const logOutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id, {
        refreshToken: undefined
    },
        { new: true }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponce(200, {}, "USer logged Out"))
})

const refreshAccessToken = asyncHandler(async (req, res,) => {
    const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }
    try {

        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET

        )

        const user = await User.findById(decodedToken?._id)
        if (!user) {
            throw new ApiError(401, "Invalide refresh token")
        }


        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "refreshToken is expired or used")
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponce(200,
                    {
                        accessToken,
                        refreshToken: newRefreshToken
                    }),
                "access tocan refressed successfully"
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "invalide reffress Token")
    }
})


export { registerUser, logOutUser, loginUser ,refreshAccessToken }   