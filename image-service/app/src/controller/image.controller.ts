import {catchAsync, sendError, sendSuccess} from 'devdad-express-utils'
import type {Request, Response} from 'express'
import mongoose from 'mongoose'
import {uploadObjectinBucket} from '../utils/bucketPutObject.util.js'
import {addJob} from '../db/queue.connect.js'
import {Images} from '../model/images.model.js'
import type {AuthRequest} from '../middleware/validateUser.middleware.js'
import {client} from '../db/redis.db.connect.js'
import type {dbuser} from "../types/api.types.js";
import {imageExtensions} from "../constants/image.types.constant.js";

// image uploading
const imageUploader = catchAsync(async (req: AuthRequest, res: Response) => {
    const user = req.user as dbuser
    const bucket = process.env.BUCKET_NAME as string
    const filetype = req.query.filetype as string
    const extension = filetype.split("/")
    imageExtensions.includes(extension[1] as string) ? null : sendError(res, "File type is not supported", 400, null)
    try {
        const userId = new mongoose.Types.ObjectId(user._id)
        // generate presigned url in s3
        const {presignedUrl , uniqueKey} = await uploadObjectinBucket(bucket , user.uid )
        // create db document
        const image = await Images.create({
            userId: userId,
            status: "processing",
            imageId: uniqueKey,
        })
        // return the presigned url
        const signedurl = presignedUrl.replace("minio:9000" , "localhost:9000")
        return sendSuccess(res, {image: image , presignedUrl: signedurl }, "Image upload url generated successfully", 200)
    } catch (error) {
        console.log(error)
        return sendError(res, "Internal server error while image upload", 500, null)
    }
})

// get image by id
const getImageById = catchAsync(async (req: Request, res: Response) => {
    try {
        const imageId: string | undefined = req.params.id as string;
        const redisImage = await client.get(`image-${imageId}`)
        if (redisImage) {
            return sendSuccess(res, redisImage, "Image fetched successfully from db", 200)
        }
        if (!imageId || typeof (imageId) !== 'string') {
            return sendError(res, "Invalid image id", 400, null)
        }
        // getting image from mongoDB by its fieldID
        const imageData = await Images.aggregate([
            {
                $match: {
                    "imageId": imageId
                }
            }
        ]);
        if (!imageData) {
            return sendError(res, "Image not found", 404, null)
        }
        let image: {} | null = null
        if (!imageData[0].processedUrl || typeof (imageData[0].processedUrl) === null) {
            return sendError(res, "Can't get the url , try again later", 404, null)
        } else {
            image = {
                imageId: imageData[0].imageId,
                fileId: imageData[0].fileId,
                url: imageData[0].processedUrl,
                metadata: imageData[0].metadata
            }
        }
        await client.set(`image-${imageId}`, JSON.stringify(image))
        return sendSuccess(res, image, "Image fetched successfully from db", 200)
    } catch (error) {
        console.log(error);
        return sendError(res, "Internal server error", 500, null)
    }
})
// get images in a list with pagination
const getImageList = catchAsync(async (req: AuthRequest, res: Response) => {
    try {
        const page: number = req.query.page ? parseInt(req.query.page as string) : 1;
        const limit: number = req.query.limit ? parseInt(req.query.limit as string) : 10;
        const user = req.user as dbuser;
        const userId = new mongoose.Types.ObjectId(user._id)
        const images: any[] = await Images.aggregate([
            {
                $match: {
                    "userId": userId,
                },
            }
            , {
                $skip: (page - 1) * limit
            }
            , {
                $limit: limit
            }
        ])
        if (!images) {
            return sendError(res, "No images found", 404, null);
        }
        return sendSuccess(res, images, "Images fetched successfully", 200)
    } catch (error) {
        console.log(error);
        sendError(res, "Internal server error", 500, null);
    }
})
// delete image by id
const delimage = catchAsync(async (req: Request, res: Response) => {
    try {
        const imageId: string | undefined = req.params.id as string
        if (typeof imageId === undefined) {
            return sendError(res, "Please paste the imageid", 400, null)
        }
        const imageData = await Images.aggregate([
            {
                $match: {
                    "imageId": imageId
                }
            }
        ]);
        await Images.deleteOne({imageId: imageId})
        await addJob("deleteImage", imageData)
        return sendSuccess(res, null, "Image deleted successfully", 200)
    } catch (error) {
        console.log(error);
        sendError(res, "internal server error", 500, null)
    }
})

// delete all images of a user
const removeAllFiles = catchAsync(async (req: AuthRequest, res: Response) => {
    try {
        const user = req.user as dbuser
        console.log("User is :", user)
        const images = await Images.deleteMany({userId: user._id})
        console.log(images)
        if (!images.acknowledged) {
            return sendError(res, "Something went wrong", 500, null)
        }
        await addJob("deleteAllImages", images)
        return sendSuccess(res, null, "All images have been delted", 200)
    } catch (error) {
        console.log(error);
        return sendError(res, "Something went wrong", 500, null)
    }
})

// // transform image
// const transformImageurl = catchAsync(async (req: AuthRequest, res: Response) => {
//     if (req.body === undefined || req.body === null) {
//         return sendError(res, "Transformation are not there please give transformations", 404, null)
//     }
//     if (!req.params.id) {
//         return sendError(res, "image id is not mentioned", 404, null)
//     }
//     try {
//         const t: imagetransformoptions = req.body;
//         const imageId = req.params.id
//         const user = req.user as dbuser
//         const image = await User.aggregate([
//             {
//                 $match: {
//                     "uid": user.uid
//                 }
//             },
//             {
//                 $unwind: {
//                     path: "$image",
//                     includeArrayIndex: "imageIndex",
//                 }
//             }, {
//                 $match: {
//                     "image.fieldId": imageId
//                 }
//             }, {
//                 $project: {
//                     image: 1,
//                 }
//             }
//         ])
//         const transformedImage = transformImage(t, image[0].image.url)
//         user?.transformedImages?.push({ url: transformedImage })
//         await user.save({ validateBeforeSave: false })
//         return sendSuccess(res, transformedImage, "Image transformation done", 200)
//     } catch (error) {
//         return sendError(res, "Internal server error", 500, null)
//     }
// })
export {
    imageUploader,
    getImageById,
    getImageList,
    delimage,
    removeAllFiles,
    // transformImageurl,
}
