import { catchAsync, sendError, sendSuccess } from 'devdad-express-utils'
import type { Request, Response } from 'express'
import mongoose from 'mongoose'
import { uploadObjectinBucket } from '../utils/bucketPutObject.util.js'
import { addJob } from '../db/queue.connect.js'
import { fileTypeFromBuffer } from "file-type";
import { imageExtensions } from '../constants/image.types.constant.js'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import {s3client} from "../../index.js";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { Images } from '../model/images.model.js'
import type { AuthRequest } from '../middleware/validateUser.middleware.js'
import { client } from '../db/redis.db.connect.js'
import type { dbuser } from "../types/api.types.js";

// image uploading
const imageUploader = catchAsync(async (req: AuthRequest , res: Response) => {
    if(!req.file || !req.file.buffer){
        return sendError(res , "Please upload an image" , 400 , null)
    }
    const fileReult = await fileTypeFromBuffer(req.file.buffer)
    if(!fileReult){
        return sendError(res , "Please upload an image" , 400 , null)
    }
    if (!imageExtensions.includes(fileReult.ext)){
        return sendError(res , "Not a image" , 400 , null)
    }
    // upload object to minio
    const fileUpload = await uploadObjectinBucket(process.env.BUCKET_NAME as string , req.file.buffer , fileReult.ext)
    if(!fileUpload){
        return sendError(res , "Something went wrong while uploading image" , 500 , null)
    }
    const rawFileSignedUrl = await getSignedUrl(s3client , new GetObjectCommand({
        Bucket: process.env.BUCKET_NAME as string,
        Key: fileUpload.uniqueKey
    }), { expiresIn: 3600 }) // signed url valid for 1 hour
    const userId = new mongoose.Types.ObjectId(req.user?._id) // reference to user id
    const image = await Images.create({
        imageId: fileUpload.uniqueKey,
        rawFileSignedUrl: rawFileSignedUrl,
        userId: userId,
        contentType: fileUpload.contentType
    })
    const jobContent = { // jobcontent to get the url from imagekit and save it in db
        fileId: fileUpload.uniqueKey,
        userId: image._id,
    }
    await addJob('uploadImage' , jobContent) // adding job to the controller for async task
    console.log(`Job added to queue successfully`)
    return sendSuccess(res , image , "Image uploaded successfully" , 200)
})

// get image by id
const getImageById = catchAsync(async (req: Request, res: Response) => {
    try {
        const imageId: string | undefined = req.params.id as string;
        const redisImage = await client.get(`image-${imageId}`)
        if(redisImage){
            return sendSuccess(res, redisImage ,  "Image fetched successfully from db", 200)
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
        if(!imageData[0].processedUrl || typeof (imageData[0].processedUrl) === null){
            image = {
                imageId: imageData[0].imageId,
                fileId: imageData[0].fileId,
                url:imageData[0].rawFileSignedUrl,
                metadata: imageData[0].metadata
            }
        }else {
            image = {
                imageId: imageData[0].imageId,
                fileId: imageData[0].fileId,
                url:imageData[0].processedUrl,
                metadata: imageData[0].metadata
            }
        }
        await client.set(`image-${imageId}` , JSON.stringify(image))
        return sendSuccess(res, image ,  "Image fetched successfully from db", 200)
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
        const images : any[] = await Images.aggregate([
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
        console.log(images);
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
        await Images.deleteOne({ imageId: imageId })
        await addJob("deleteImage",  imageData )
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
        console.log("User is :",user)
        const images = await Images.deleteMany({ userId: user._id })
        console.log(images)
        if(!images.acknowledged){
            return sendError(res , "Something went wrong" , 500 , null)
        }
        await addJob("deleteAllImages" , images)
        return sendSuccess(res , null , "All images have been delted" , 200 )
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
    getImageById ,
    getImageList ,
    delimage,
    removeAllFiles,
    // transformImageurl,
}
