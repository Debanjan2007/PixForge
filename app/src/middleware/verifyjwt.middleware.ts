import { sendError , catchAsync } from 'devdad-express-utils'
import jwt from 'jsonwebtoken'
import type { dbuser } from '../types/api.types.js'
import { User } from '../model/user.mogoose.model.js'
import type { AuthRequest } from '../controller/users.controller.js'
import type { JwtPayload } from '../types/api.types.js'
import { client } from '../db/redis.db.connect.js'


export const verifyJwt = catchAsync(async (req : AuthRequest , res , next) => {
    try {
        const token = req.cookies.accessToken;
        if(!token || typeof(token) !== 'string'){
            return sendError(res , "Access token not found, please login again" , 401 , null)
        }
        const secret : string | undefined = process.env.JWT_AUTH as string ;
        if(!secret){
            throw new Error("JWT_SECRET not found in env variables")
        }
        const decoded = jwt.verify(token , secret) as JwtPayload ;
        if(!decoded){
            return sendError(res , "Invalid token" , 401 , null)
        }   
        const tokenfromredis : string | null | undefined = await client?.get(`token-${decoded.uid}`)
        console.log(tokenfromredis);        
        if(tokenfromredis){
            return sendError(res , "User has already been loged out" , 401 , null )
        }
        const user = await User.findOne({ uid : decoded.uid }) as unknown as dbuser;
        if(!user){
            return sendError(res , "User not found please sign up first" , 404 , null)
        }
        if(user.isLogedin === false){
            return sendError(res , "User has been loged out" , 400 , null)
        }
        req.user = user;
        return next();
    } catch (error) {
        console.log(error);        
        const errorMessage = error instanceof Error ? error.message : null;
        return sendError(res, "Authentication failed", 401 , errorMessage);
    }
})