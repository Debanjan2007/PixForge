import express from 'express'
import { errorHandler } from "devdad-express-utils";
import { router as user} from './src/routes/user.routes.js'
import { router as healthcheck} from './src/routes/healthcheck.routes.js'
import cookieParser from 'cookie-parser';

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser());
app.use(errorHandler)
app.use('/api/v1/user', user)
app.use('/api/v1', healthcheck)

export default app