import { Router } from 'express';
import { imageUploader } from '../controller/image.controller.js'

const router = Router()

router.post('/upload',imageUploader)

export default router;