import mongoose from "mongoose";
import type {imagemetadata} from '../types/image.types.js'

interface ImagesDocument extends mongoose.Document {
    imageId: string,
    rawFilepath: string,
    userId: mongoose.Types.ObjectId,
    processedUrl: string,
    metadata: imagemetadata
}

const imagesSchema = new mongoose.Schema(
    {
        imageId: {
            type: String,
            unique: true,
            required: true
        },
        // rawFilepath: {
        //     type: String,
        //     required: true
        // },
        userId: {
            type: mongoose.Types.ObjectId,
            ref: 'User',
            required: true
        },
        processedUrl: {
            type: String,
        },
        metadata: {
            name: {
                type: String,
            },
            versionInfo: {
                id: {
                    type: String,
                },
                name: {
                    type: String,
                }
            },
            filepath: {
                type: String,
            },
            fileType: {
                type: String,
            },
            dimensions: {
                width: {
                    type: Number,
                },
                height: {
                    type: Number,
                }
            },
            thumbnailUrl: {
                type: String,
            }
        }
    }, {
        timestamps: true
    }
)

export const Images = mongoose.model<ImagesDocument>('Images', imagesSchema);