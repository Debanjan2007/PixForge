import express from 'express'
import { errorHandler } from "devdad-express-utils";
import { router as user} from './src/routes/user.routes.js'
import { router as healthcheck} from './src/routes/healthcheck.routes.js'

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use('/api/v1/user', user)
app.use('/api/v1', healthcheck)
app.use(errorHandler)

export default app