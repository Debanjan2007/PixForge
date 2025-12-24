import { Router } from 'express'
import { sendSuccess } from 'devdad-express-utils'


export const router = Router() 

router.get('/heathcheck' , (req , res) => {
    sendSuccess(res , null , "Healthcheck OK" , 200)
})