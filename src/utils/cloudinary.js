import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uplodeOnCloudniary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        const responce = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        //file has been uplodaded successfully
        console.log("file uploaded on cloudniary ")
        return responce
    } catch (error) {
        fs.unlinkSync(localFilePath)
        return null
    }
}

export {uplodeOnCloudniary}