import { catchAsync, sendError, sendSuccess } from 'devdad-express-utils'
import type { Request, Response } from 'express'
import type { dbuser, user } from '../types/api.types.js'
import type { AuthRequest } from './users.controller.js'
import { User } from '../model/user.mogoose.model.js'
import { publisher } from '../db/redis.db.connect.js'

const delimage = catchAsync(async (req: AuthRequest, res: Response) => {
    try {
        const user = req.user as dbuser;
        const imageId: string | undefined = req.params.id
        if (typeof imageId === undefined) {
            return sendError(res, "Please paste the imageid", 400, null)
        }
        const ImagenotExist = await User.aggregate([
            {
                $match: {
                    "uid": user.uid
                }
            },
            {
                $unwind: {
                    path: "$image",
                    includeArrayIndex: "imageindex"
                }
            }, {
                $match: {
                    "image.fieldId": imageId
                },
            }, {
                $project: {
                    image: 1
                }
            }
        ]);
        if (!ImagenotExist || typeof ImagenotExist === null || ImagenotExist.length <= 0) {
            return sendError(res, "Image doesnot exist please verify the image id", 400, null);
        }
        await User.updateOne( // updating image array by deleting the required image from db
            { uid: user.uid },
            {
                $pull: {
                    image: { fieldId: imageId }
                }
            }
        )
        await publisher?.add('delimage', { fieldId: imageId }, {
            attempts: 5,
            backoff: {
                type: 'exponential',
                delay: 2000
            }
        })
        return sendSuccess(res, null, "Image deleted successfully", 200)
    } catch (error) {
        console.log(error);
        sendError(res, "internal server error", 500, null)
    }
})
export {
    delimage
}