import express from 'express'
import cookieParser from 'cookie-parser';
import { errorHandler } from 'devdad-express-utils'
import { validateUser } from './src/middleware/validateUser.middleware.js'
import multer from 'multer'

const storage = multer.memoryStorage()
const upload = multer({storage: storage}) //using buffer for the data

const app = express() 


app.use(express.urlencoded({ extended: false }))
app.use(cookieParser());
app.use(errorHandler);
app.use(validateUser);

app.get('/' , (req , res) => {
    return res.send("ok")
})

export {
    app
}