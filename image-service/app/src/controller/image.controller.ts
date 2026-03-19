import { catchAsync, sendError, sendSuccess } from 'devdad-express-utils'
import type { Request, Response } from 'express'
import type { dbuser } from '../types/api.types.js'
import { uploadObjectinBucket } from '../utils/bucketPutObject.util.js'
import { addJob } from '../db/queue.connect.js'
import { fileTypeFromBuffer } from "file-type";
import { imageExtensions } from '../constants/image.types.constant.js'

// image uploading
const imageUploader = catchAsync(async (req: Request , res: Response) => {
    console.log(`Req coming into this function and req:`)
    console.log(req.file)
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
    const fileUpload = await uploadObjectinBucket(process.env.BUCKET_NAME as string , req.file.buffer , fileReult.ext)
    if(!fileUpload){
        return sendError(res , "Something went wrong while uploading image" , 500 , null)
    }
    await addJob('uploadImage' , fileUpload.uniqueKey) // adding job to the controller for async task
    console.log(`Job added to queue successfully`)
    return sendSuccess(res , fileUpload , "Image uploaded successfully" , 200)
})

// const delimage = catchAsync(async (req: AuthRequest, res: Response) => {
//     try {
//         const user = req.user as dbuser;
//         const imageId: string | undefined = req.params.id
//         if (typeof imageId === undefined) {
//             return sendError(res, "Please paste the imageid", 400, null)
//         }
//         const ImagenotExist = await User.aggregate([
//             {
//                 $match: {
//                     "uid": user.uid
//                 }
//             },
//             {
//                 $unwind: {
//                     path: "$image",
//                     includeArrayIndex: "imageindex"
//                 }
//             }, {
//                 $match: {
//                     "image.fieldId": imageId
//                 },
//             }, {
//                 $project: {
//                     image: 1
//                 }
//             }
//         ]);
//         if (!ImagenotExist || typeof ImagenotExist === null || ImagenotExist.length <= 0) {
//             return sendError(res, "Image doesnot exist please verify the image id", 400, null);
//         }
//         await User.updateOne( // updating image array by deleting the required image from db
//             { uid: user.uid },
//             {
//                 $pull: {
//                     image: { fieldId: imageId }
//                 }
//             }
//         )
//         await publisher?.add('delimage', { fieldId: imageId }, {
//             attempts: 5,
//             backoff: {
//                 type: 'exponential',
//                 delay: 2000
//             }
//         })
//         return sendSuccess(res, null, "Image deleted successfully", 200)
//     } catch (error) {
//         console.log(error);
//         sendError(res, "internal server error", 500, null)
//     }
// })

// const removeAllFiles = catchAsync(async (req: AuthRequest, res: Response) => {
//     try {
//         const user = req.user as dbuser
//         const images = await User.aggregate([
//             {
//                 $match: {
//                     "uid" : user.uid
//                 }
//             },
//             {
//                 $project : {
//                     image: 1
//                 }
//             }
//         ])
//         console.log(images[0].image);        
//         await User.updateOne(
//             { uid: user.uid },
//                 {
//                     $set : {
//                         image: []
//                     }
//                 }
//         )
//         publisher?.add('delAllimage' , { imagesArray : images[0].image})
//         return sendSuccess(res , null , "All images have been delted" , 200 )
//     } catch (error) {
//         console.log(error);        
//         return sendError(res, "Something went wrong", 500, null)
//     }
// })

// get image by id
// const getImageById = catchAsync(async (req: Request, res: Response) => {
//     try {
//         const imageId: string | undefined = req.params.id;
//         if (!imageId || typeof (imageId) !== 'string') {
//             return sendError(res, "Invalid image id", 400, null)
//         }
//         // getting image from mongoDB by its fieldID 
//         const image = await User.aggregate([
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
//         ]);
//         if (!image) {
//             return sendError(res, "Image not found", 404, null)
//         }
//         return sendSuccess(res, image[0].image, "Image fetched successfully from db", 200)
//     } catch (error) {
//         console.log(error);
//         return sendError(res, "Internal server error", 500, null)
//     }
// })
// // get images in list with pagination
// const getImageList = catchAsync(async (req: AuthRequest, res: Response) => {
//     try {
//         const page: number = req.query.page ? parseInt(req.query.page as string) : 1;
//         const limit: number = req.query.limit ? parseInt(req.query.limit as string) : 10;
//         const user = req.user as dbuser;
//         const images = await User.aggregate([
//             {
//                 $match: {
//                     "uid": user.uid,
//                 },
//             }
//             , {
//                 $unwind: {
//                     path: "$image",
//                     includeArrayIndex: "imageIndex",
//                 }
//             }, {
//                 $skip: (page - 1) * limit
//             }
//             , {
//                 $project: {
//                     image: 1
//                 }
//             }, {
//                 $limit: limit
//             }
//         ])
//         if (!images) {
//             return sendError(res, "No images found", 404, null);
//         }
//         return sendSuccess(res, images, "Images fetched successfully", 200)
//     } catch (error) {
//         console.log(error);
//         sendError(res, "Internal server error", 500, null);
//     }
// })
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
    // delimage,
    // removeAllFiles,
    imageUploader,
    // transformImageurl,
    // getImageList ,
    // getImageById
}
