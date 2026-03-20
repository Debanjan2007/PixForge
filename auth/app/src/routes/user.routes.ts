import { Router } from 'express'
import { registerUser , loginUser , logout , delacc , validateUser} from '../controller/users.controller.js'
import { verifyJwt } from '../middleware/verifyjwt.middleware.js'

export const router = Router() 

// unsafe routes
router.post('/register' , registerUser)
router.post('/login' , loginUser)

// safe routes
router.use(verifyJwt)
router.post('/logout' , logout)
router.delete('/delete-account' , delacc)

// http communication with the image-service
router.post('/validate' , validateUser)