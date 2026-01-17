import express from 'express'
import cookieParser from 'cookie-parser';
import { errorHandler } from 'devdad-express-utils'

const app = express() 

app.use(express.urlencoded({ extended: false }))
app.use(cookieParser());
app.use(errorHandler);

export {
    app
}