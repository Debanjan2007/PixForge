import { catchAsync, sendSuccess, sendError } from 'devdad-express-utils'
import { User } from '../model/user.mogoose.model.js'
import fs from 'fs'
import { imagekitClient } from '../../index.js'
import type { Request, Response } from 'express'
import type { dbuser, user } from '../types/api.types.js'
import type { imagemetadata } from '../types/image.types.js'
import { transformImage } from '../utils/image.transform.js'
import type { imagetransformoptions } from '../types/image.types.js'
import { client } from '../db/redis.db.connect.js'

export type AuthRequest = Request & { user?: dbuser };
const genaccessToken = async function (uid: string): Promise<string | null | undefined> {
    try {
        const user: dbuser | null = await User.findOne({ uid: uid })
        if (!user) {
            return null;
        }
        const accessToken = await user.genToken();
        return accessToken;
    } catch (error) {
        console.log(error);
        return undefined;
    }
}

// please delete the token-uid from redis while logging in again 

const reguser = catchAsync(async (req: Request, res: Response) => {
    try {
        if (req.body === null || req.body === undefined) {
            return sendError(res, "Please provide user details", 400, null)
        }
        const userDetails: user = req.body;
        if (typeof (userDetails.username) !== 'string' || typeof (userDetails.password) !== 'string') {
            return sendError(res, "username or password is not a string", 400, null)
        }
        const user = await User.create(userDetails)
        user.isLogedin = true
        await user.save({ validateBeforeSave: false })
        const accessToken = await genaccessToken(user.uid)
        console.log(accessToken);
        if (accessToken === null) {
            return sendError(res, "User not found", 404, null)
        } else if (accessToken === undefined) {
            return sendError(res, "Internal server error could not generate token", 500, null)
        }
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        })
        return sendSuccess(
            res, {
            accessToken, user
        }, "User registered successfully", 201)
    } catch (error) {
        console.log(error);
        return sendError(
            res, "Internal server error", 500, error
        )
    }
})
// login user 
const loginUser = catchAsync(async (req: Request, res: Response) => {
    try {
        const userDetails: user = req.body;
        if (typeof (userDetails.username) !== 'string' || typeof (userDetails.password) !== 'string') {
            return sendError(res, "username or password is not a string", 400, null)
        }
        const user: dbuser | null = await User.findOne({ username: userDetails.username }).select('-password -image')
        if (!user) {
            return sendError(res, "User not found", 404, null)
        }
        user.isLogedin = true
        const revokedToken = await client?.get(`token-${user.uid}`)
        console.log("holla : ", revokedToken);
        if (revokedToken) {
            console.log("got user");
            const del = await client?.del(`token-${user.uid}`)
            console.log(del);
        }
        await user.save({ validateBeforeSave: false })
        const accessToken = await genaccessToken(user.uid)
        if (accessToken === null) {
            return sendError(res, "User not found", 404, null)
        } else if (accessToken === undefined) {
            return sendError(res, "Internal server error could not generate token", 500, null)
        }
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        })
        return sendSuccess(
            res, {
            accessToken, user
        }, "User logged in successfully", 200
        )

    } catch (error) {
        console.log(error);
        return sendError(
            res, "Internal server error", 500, error
        )
    }
})
// upload image
const imageUploader = catchAsync(async (req: AuthRequest, res: Response) => {
    console.log(req.file?.path)
    try {
        if (!req.file) {
            return sendError(res, "No file uploaded", 400, null)
        }
        console.log(req.file.buffer);
        if (!imagekitClient || imagekitClient === null) {
            throw new Error("Imagekitclient not found")
        }
        // @ts-ignore
        const {name , url , fileId , versionInfo ,  filePath , fileType , height , width , thumbnailUrl}   = await imagekitClient.upload({
            file: req.file.buffer,
            fileName: req.file.originalname
        })      
        const metadata: imagemetadata = {
            name: name,
            versionInfo: {
                id: `${versionInfo?.id || ''}`,
                name: `${versionInfo?.name || ''}`
            },
            filepath: `${filePath}`,
            fileType: `${fileType}`,
            dimensions: {
                width: width ? width : 0,
                height: height ? height : 0
            },
            thumbnailUrl: `${thumbnailUrl}`
        }
        const user = req.user;
        if (!user || !user.uid) {
            return sendError(res, "User not authenticated", 401, null)
        }
        await User.findOneAndUpdate(
            { uid: user.uid },
            {
                $push: {
                    image: {
                        url: url,
                        fieldId: fileId,
                        metadata: metadata
                    }
                }
            },
            { new: true }
        )
        return sendSuccess(res, { url: url, id: fileId }, "Image uploaded successfully", 200)
    } catch (error) {
        console.log(error);
        return sendError(res, "Internal server error", 500, null)
    }
})
// get image by id
const getImageById = catchAsync(async (req: Request, res: Response) => {
    try {
        const imageId: string | undefined = req.params.id;
        if (!imageId || typeof (imageId) !== 'string') {
            return sendError(res, "Invalid image id", 400, null)
        }
        // getting image from mongoDB by its fieldID 
        const image = await User.aggregate([
            {
                $unwind: {
                    path: "$image",
                    includeArrayIndex: "imageIndex",
                }
            }, {
                $match: {
                    "image.fieldId": imageId
                }
            }, {
                $project: {
                    image: 1,
                }
            }
        ]);
        if (!image) {
            return sendError(res, "Image not found", 404, null)
        }
        return sendSuccess(res, image[0].image, "Image fetched successfully from db", 200)
    } catch (error) {
        console.log(error);
        return sendError(res, "Internal server error", 500, null)
    }
})
// get images in list with pagination
const getImageList = catchAsync(async (req: AuthRequest, res: Response) => {
    try {
        const page: number = req.query.page ? parseInt(req.query.page as string) : 1;
        const limit: number = req.query.limit ? parseInt(req.query.limit as string) : 10;
        const user = req.user as dbuser;
        const images = await User.aggregate([
            {
                $match: {
                    "uid": user.uid,
                },
            }
            , {
                $unwind: {
                    path: "$image",
                    includeArrayIndex: "imageIndex",
                }
            }, {
                $skip: (page - 1) * limit
            }
            , {
                $project: {
                    image: 1
                }
            }, {
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
// transform image
const transformImageurl = catchAsync(async (req: AuthRequest, res: Response) => {
    if (req.body === undefined || req.body === null) {
        return sendError(res, "Transformation are not there please give transformations", 404, null)
    }
    if (!req.params.id) {
        return sendError(res, "image id is not mentioned", 404, null)
    }
    try {
        const t: imagetransformoptions = req.body;
        const imageId = req.params.id
        const user = req.user as dbuser
        const image = await User.aggregate([
            {
                $match: {
                    "uid": user.uid
                }
            },
            {
                $unwind: {
                    path: "$image",
                    includeArrayIndex: "imageIndex",
                }
            }, {
                $match: {
                    "image.fieldId": imageId
                }
            }, {
                $project: {
                    image: 1,
                }
            }
        ])
        const transformedImage = transformImage(t, image[0].image.url)
        user?.transformedImages?.push({ url: transformedImage })
        await user.save({ validateBeforeSave: false })
        return sendSuccess(res, transformedImage, "Image transformation done", 200)
    } catch (error) {
        return sendError(res, "Internal server error", 500, null)
    }
})
// log out securely
const logout = catchAsync(async (req: AuthRequest, res: Response) => {
    const user = req.user as dbuser
    try {
        user.isLogedin = false
        await user.save({ validateBeforeSave: false })
        const accessToken = req.cookies.accessToken;
        const rediskey: string = `token-${req.user?.uid}`
        await client?.set(rediskey, accessToken, {
            EX: 60 * 60 * 24
        })
        res.clearCookie(accessToken)
        return sendSuccess(res, null, "user logout successfull", 200)
    } catch (error) {
        console.log(error);
        return sendError(res, "internal server error", 500, null)
    }
})
// delete account
const delacc = catchAsync(async (req: AuthRequest, res: Response) => {
    try {
        const user = req.user as dbuser;
        const accessToken = req.cookies.accessToken;
        res.clearCookie(accessToken)
        await User.findByIdAndDelete(user._id)
        return sendSuccess(res, null, "Accoint has been deleted successfully", 200)
    } catch (error) {
        console.log(error);
        return sendError(res, "internal server failure", 500, null)
    }
})
export {
    reguser as reisterUser,
    loginUser,
    imageUploader,
    getImageById,
    getImageList,
    transformImageurl,
    logout,
    delacc
}