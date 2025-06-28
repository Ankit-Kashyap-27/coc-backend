import mongoose, { Schema } from "mongoose";
import mongooseAggregatepaginate from "mongoose-aggregate-paginate-v2";

const VideoSchema = new Schema(
    {
        videoFile: {
            type: String, //Cloudinary URL
            required: true

        },

        thumbnail: {
            type: String, //Cloudinary URL
            required: true

        },
        tittle: {
            type: String, //Cloudinary URL
            required: true

        },

        description: {
            type: String,
            required: true

        },

        duration: {
            type: Number,
            required: true

        },

        views: {
            type: Number,
            default: 0
        },

        isPublished: {
            type: Boolean,
            default: true
        },

        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"

        }


    }, {
    timestamps: true
})

VideoSchema.plugin(mongooseAggregatepaginate)

export const Video = mongoose.model("Video", VideoSchema)