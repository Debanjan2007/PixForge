import { sendError , catchAsync } from 'devdad-express-utils'
import jwt from 'jsonwebtoken'
import type { dbuser } from '../controller/users.controller.js'
import { User } from '../model/user.mogoose.model.js'
import type { AuthRequest } from '../controller/users.controller.js'

interface JwtPayload { 
    uid : string ,
    username : string
}

export const verifyJwt = catchAsync(async (req : AuthRequest , res , next) => {
    try {
        const token = req.cookies.accessToken;
        if(!token || typeof(token) !== 'string'){
            return sendError(res , "Access token not found, please login again" , 401 , null)
        }
        const secret = process.env.JWT_AUTH as string ;
        const decoded = jwt.verify(token , secret) as JwtPayload ;
        if(!decoded){
            return sendError(res , "Invalid token" , 401 , null)
        }
        const user = await User.findOne({ uid : decoded.uid }) as unknown as dbuser;
        if(!user){
            return sendError(res , "User not found" , 404 , null)
        }
        req.user = user;
        return next();
    } catch (error) {
        console.log(error);        
        return sendError(res , "Internal server error" , 500 , null)
    }
})