import { Router } from 'express';
import { imageUploader , getImageById , getImageList , delimage} from '../controller/image.controller.js'
import multer from 'multer'

const storage = multer.memoryStorage()
const uploader = multer({storage: storage})
const router = Router()

router.post('/upload', uploader.single("pix") , imageUploader)
router.get('/:id', getImageById)
router.get('/', getImageList)
router.delete('/:id' , delimage)

export default router;