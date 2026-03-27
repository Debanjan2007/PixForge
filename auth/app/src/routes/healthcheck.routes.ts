import { Router } from 'express'
import { sendSuccess } from 'devdad-express-utils'


export const router = Router() 

router.get('/healthcheck' , (req , res) => {
    sendSuccess(res , null , "Healthcheck OK" , 200)
})