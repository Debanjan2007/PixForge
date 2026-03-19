import { Router } from 'express';
import { imageUploader } from '../controller/image.controller.js'
import multer from 'multer'

const storage = multer.memoryStorage()
const uploader = multer({storage: storage})
const router = Router()

router.post('/upload', uploader.single("pix") , imageUploader)

export default router;