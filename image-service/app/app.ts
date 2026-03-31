import express from 'express'
import cookieParser from 'cookie-parser';
import { errorHandler } from 'devdad-express-utils'
import { validateUser } from './src/middleware/validateUser.middleware.js'
import router from './src/routes/api.routes.js'
import rateLimit from "express-rate-limit";

// limit the request to 50 per 10 minute for each ip
const limit = rateLimit({
    windowMs: 1000 * 60 * 10 ,
    max: 50 ,
    message: "Too many requests from this IP, please try again after 10 minutes",
    standardHeaders: true,
    legacyHeaders: false,
})

const app = express()

app.use(express.urlencoded({ extended: false }))
app.use(cookieParser());
app.use(errorHandler);
app.use(validateUser);
app.use(limit);
app.use('/api/v1/images',router)

export {
    app
}