import mongoose from "mongoose";
import type {imagemetadata} from '../types/image.types.js'

interface ImagesDocument extends mongoose.Document {
    imageId: string,
    fileId: string,
    contentType: string
    userId: mongoose.Types.ObjectId,
    processedUrl: string,
    status: string,
    metadata: imagemetadata
}

const imagesSchema = new mongoose.Schema(
    {
        imageId: { // unique id of the image same in s3 bucket
            type: String,
            unique: true,
        },
        fileId: { // get the fileid from the imagekit response
            type: String,
            default: null,
        },
        userId: {
            type: mongoose.Types.ObjectId,
            ref: 'User',
            required: true
        },
        contentType: {
            type: String,
            default: null
        },
        processedUrl: {
            type: String,
            default: null
        },
        status: {
            type: String,
            required: true,
            enum: ["processing","uploaded"]
        },
        metadata: {
            name: {
                type: String,
                default: "image"
            },
            versionInfo: {
                id: {
                    type: String,
                    default: null
                },
                name: {
                    type: String,
                    default: null
                }
            },
            filepath: {
                type: String,
                default: null
            },
            fileType: {
                type: String,
                default: null
            },
            dimensions: {
                width: {
                    type: Number,
                    default: 0
                },
                height: {
                    type: Number,
                    default: 0
                }
            },
            thumbnailUrl: {
                type: String,
                default: null
            }
        }
    }, {
        timestamps: true
    }
)

export const Images = mongoose.model<ImagesDocument>('Images', imagesSchema);