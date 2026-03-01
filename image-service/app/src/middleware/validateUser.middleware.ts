import { sendError } from 'devdad-express-utils'
import type { Request, Response, NextFunction } from 'express'
import axios from 'axios'

const validateUser = async (req: Request, res: Response, next: NextFunction) => {
    // console.log(req);    
    const authHeader = req.headers['authorization'];
    console.log(req.headers);    
    const tokenFromHeader = Array.isArray(authHeader) ? authHeader[0]?.split(' ')[1] : authHeader?.split(' ')[1];
    const token = req.cookies.accessToken || tokenFromHeader;
    console.log("token is: ",token);    
    if (!token) {
        return sendError(res, "AccessToken not found", 501, null)
    }
    console.log(req.hostname, req.httpVersion, req.protocol, req.path);
    const url = `${req.protocol}://${req.hostname}:5600/api/v1/user/validate`
    console.log(url);
    axios({
        method: 'post',
        url: url,
        headers: {
            Cookie: `accessToken=${token}`
        },
        withCredentials: true
    }).then((data) => {
        if(data.data.success === true){
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