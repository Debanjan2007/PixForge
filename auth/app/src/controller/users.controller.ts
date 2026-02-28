import { catchAsync, sendSuccess, sendError } from 'devdad-express-utils'
import { User } from '../model/user.mogoose.model.js'
import type { Request, Response } from 'express'
import type { dbuser, user } from '../types/api.types.js'
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
        if (revokedToken) {
            console.log(`Revoked token found for user ${user.uid}, deleting from Redis. ${revokedToken}`);            
            const del = await client?.del(`token-${user.uid}`)
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
        return sendSuccess(res, null, "Account has been deleted successfully", 200)
    } catch (error) {
        console.log(error);
        return sendError(res, "internal server failure", 500, null)
    }
})
// validate the user for image processiing service
const validateUser = catchAsync(async (req: AuthRequest , res) => {
    if(!(req.user as dbuser)){
        return sendError(res , "User not found or user must be logedout" , 404 , null)
    }
    return sendSuccess(res , {user: req.user} , "User validation successfull" , 200)
})
export {
    reguser as registerUser,
    loginUser,
    logout,
    delacc,
    validateUser
}