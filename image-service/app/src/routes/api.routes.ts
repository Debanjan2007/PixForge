import { Router } from 'express';
import { imageUploader , getImageById } from '../controller/image.controller.js'
import multer from 'multer'

const storage = multer.memoryStorage()
const uploader = multer({storage: storage})
const router = Router()

router.post('/upload', uploader.single("pix") , imageUploader)
router.get('/:id', getImageById)

export default router;