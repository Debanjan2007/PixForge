import { Router } from 'express';
import { imageUploader , getImageById , getImageList , delimage , removeAllFiles} from '../controller/image.controller.js'

const router = Router()

router.put('/upload' , imageUploader)
router.get('/:id', getImageById)
router.get('/', getImageList)
router.delete('/:id' , delimage)
router.delete('/', removeAllFiles) // delete all images

export default router;