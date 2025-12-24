import { Router } from 'express'
import { reisterUser , loginUser , imageUploader } from '../controller/users.controller.js'
import { verifyJwt } from '../middleware/verifyjwt.middleware.js'

export const router = Router() 
import { upload } from '../middleware/fileupload.middleware.js'

// unsafe routes
router.post('/register' , reisterUser)
router.post('/login' , loginUser)

// safe routes
router.post('/upload-image' , verifyJwt , upload.single('image') , imageUploader )