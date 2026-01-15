import { Router } from 'express'
import { reisterUser , loginUser , logout , delacc} from '../controller/users.controller.js'
import { verifyJwt } from '../middleware/verifyjwt.middleware.js'

export const router = Router() 

// unsafe routes
router.post('/register' , reisterUser)
router.post('/login' , loginUser)

// safe routes
router.post('/logout', verifyJwt , logout)
router.delete('/delete-account', verifyJwt , delacc)