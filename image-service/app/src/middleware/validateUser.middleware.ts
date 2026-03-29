import { sendError } from 'devdad-express-utils'
import type { Request, Response, NextFunction } from 'express'
import axios from 'axios'
import type { dbuser } from '../types/api.types.js'
export type AuthRequest = Request & { user?: dbuser };

const validateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization']
    const tokenFromHeader = Array.isArray(authHeader) ? authHeader[0]?.split(' ')[1] : authHeader?.split(' ')[1];
    const token = req.cookies.accessToken || tokenFromHeader;
    if (!token) {
        return sendError(res, "AccessToken not found", 404, null)
    }
    const servicetype : string = process.env.SERVICE_TYPE as string
    let url : string = ""
    if(servicetype === "local") {
        url =`${req.protocol}://${req.hostname}:5600/api/v1/user/validate`
    }else{
        url =`${req.protocol}://auth:5600/api/v1/user/validate`
    }
    axios({
        method: 'get',
        url: url,
        headers: {
            Cookie: `accessToken=${token}`
        },
        withCredentials: true
    }).then((data) => {
        if(data.data.success === true){
            req.user = data.data.data.user
            next()
        }else{
            return sendError(res, "User has loged out already", 401, {err : data.data.message})
        }
    })
        .catch((err) => {
            console.log("User validation failed", err);
            if (err.status === 404) {
                return sendError(res, "User has loged out already or account deleted", 404, {cause : err})
            } else {
                return sendError(res, "User validation failed", 500, {cause : err})
            }
        })
}
export {
    validateUser
}