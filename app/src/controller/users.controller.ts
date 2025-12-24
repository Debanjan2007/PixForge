import { catchAsync , sendSuccess , sendError } from 'devdad-express-utils'
import mongoose from 'mongoose'
import { User } from '../model/user.mogoose.model.js'

interface user {
    username : string ,
    password : string
}

const genaccessToken = async function(uid : string) : Promise<string | null | undefined>{
    try {
        const user = await User.findOne({uid : uid})        
        if(!user){
            return null ;
        }    
        const accessToken = await user.genToken() ;
        console.log(accessToken);        
        return accessToken ;
    } catch (error) {
            console.log(error);        
            return undefined ;
    }
}

const reguser = catchAsync(async (req , res) => {
    try {
        if(req.body === null || req.body === undefined){
            return sendError(res , "Please provide user details" , 400 , null)
        }
        const userDetails : user = req.body ;
        if(typeof(userDetails.username) !== 'string' || typeof(userDetails.password) !== 'string'){
            return sendError(res , "username or password is not a string" , 400 , null)
        }
        const user = await User.create(userDetails)
        const accessToken = await genaccessToken(user.uid)
        console.log(accessToken);        
        if(accessToken === null){
            return sendError(res , "User not found" , 404 , null)
        }else if(accessToken === undefined){
            return sendError(res , "Internal server error could not generate token" , 500 , null)
        }
        return sendSuccess(res , { accessToken , user } , "User registered successfully" , 201)
    } catch (error) {
        console.log(error);        
        return sendError(res , "Internal server error" , 500 , error)
    }
})


export {
    reguser as reisterUser
}