import express from 'express'
import cookieParser from 'cookie-parser';
import {errorHandler} from 'devdad-express-utils'
import {validateUser} from './src/middleware/validateUser.middleware.js'
import router from './src/routes/api.routes.js'
import rateLimit from "express-rate-limit";
import cors from 'cors'
import {addJob} from './src/db/queue.connect.js'


// limit the request to 50 per 10 minute for each ip
const limit = rateLimit({
    windowMs: 1000 * 60 * 10,
    max: 100,
    message: "Too many requests from this IP, please try again after 10 minutes",
    standardHeaders: true,
    legacyHeaders: false,
})

const app = express()

app.use(express.urlencoded({extended: false}))
app.use(cookieParser());
app.use(express.json());
app.use(errorHandler);
app.use(cors({
    origin: "http://127.0.0.1:5500", // or your frontend URL
    credentials: true
}));
app.post("/storage-events", async (req, res) => {
    const record = req.body.Records?.[0];
    const key = record?.s3?.object?.key;
    await addJob('uploadImage' , key)
    res.sendStatus(200);
});
app.use(validateUser);
app.use(limit);
app.use('/api/v1/images', router)

export {
    app
}