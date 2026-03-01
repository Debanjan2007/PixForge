import mongoose from "mongoose";
import type { imagemetadata } from '../types/image.types.js'

interface ImagesDocument extends mongoose.Document {
    tempUrl: string, // temporary url from minIO 
    url: string, // unsigned url from imagekit 
    metadata: imagemetadata
}

const imagesSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            unique: true,
        },
        tempUrl: {
            type: String,
            required: true
        },
        url: {
            type: String
        },
        metadata: {
            name: String,
            versionInfo: {
                id: String,
                name: String
            },
            filepath: String,
            fileType: String,
            dimensions: {
                width: Number,
                height: Number
            },
            thumbnailUrl: String
        }
    }, {
    timestamps: true
}
)

export const Images = mongoose.model<ImagesDocument>('Images', imagesSchema);