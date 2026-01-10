import { Router } from 'express'
import { reisterUser , loginUser , imageUploader , getImageById , getImageList , transformImageurl , logout , delacc} from '../controller/users.controller.js'
import { verifyJwt } from '../middleware/verifyjwt.middleware.js'
import { delimage , removeAllFiles }  from '../controller/image.controller.js'
import multer from 'multer'

export const router = Router() 

const storage = multer.memoryStorage()
const upload = multer({storage: storage})

// unsafe routes
router.post('/register' , reisterUser)
router.post('/login' , loginUser)

// safe routes
router.post('/upload-image' , verifyJwt , upload.single('image') , imageUploader )
router.get('/images/:id' , verifyJwt , getImageById)
router.get('/images' , verifyJwt , getImageList)
router.patch('/images/:id/transform' , verifyJwt , transformImageurl)
router.post('/logout', verifyJwt , logout)
router.delete('/delete-account', verifyJwt , delacc)
router.delete('/images/delete-image/:id', verifyJwt , delimage)
router.delete('/images/delete-all', verifyJwt , removeAllFiles)