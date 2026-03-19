import { sendError } from 'devdad-express-utils'
import type { Request, Response, NextFunction } from 'express'
import axios from 'axios'
import type { dbuser } from '../types/api.types.js'
export type AuthRequest = Request & { user?: dbuser };

const validateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    // console.log(req);    
    const authHeader = req.headers['authorization'];
    const tokenFromHeader = Array.isArray(authHeader) ? authHeader[0]?.split(' ')[1] : authHeader?.split(' ')[1];
    const token = req.cookies.accessToken || tokenFromHeader;
    if (!token) {
        return sendError(res, "AccessToken not found", 404, null)
    }
    const url = `${req.protocol}://${req.hostname}:5600/api/v1/user/validate`
    axios({
        method: 'post',
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
            return sendError(res, "User has loged out already", 401, null)
        }
    })
        .catch((err) => {
            if (err.status === 404) {
                return sendError(res, "User has loged out already or account deleted", 404, null)
            } else {
                return sendError(res, "User validation failed", 500, null)
            }
        })
}
export {
    validateUser
}