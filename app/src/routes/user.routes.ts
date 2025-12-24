import { Router } from 'express'
import { reisterUser } from '../controller/users.controller.js'

export const router = Router() 

router.post('/register' , reisterUser)