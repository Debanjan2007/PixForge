import express from 'express'
import { errorHandler } from "devdad-express-utils";
import { router as user} from './src/routes/user.routes.js'
import { router as healthcheck} from './src/routes/healthcheck.routes.js'
import cookieParser from 'cookie-parser';
import cors  from 'cors'
import { rateLimit } from 'express-rate-limit'

const app = express()

const limit = rateLimit({
    windowMs: 1000 * 60 * 10 , // 10 minutes
    max: 50 , // maximum 50 requests per windowMs
    message: "Too many requests from this IP, please try again after 10 minutes",
    standardHeaders: true,
    legacyHeaders: false,
})

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser());
app.use(cors({
    origin: true, // or your frontend URL now i am just accepting any request from anywhere
    credentials: true
}));
app.use(errorHandler)
app.use('/api/v1/user', user)
app.use('/api/v1', healthcheck)

export default app