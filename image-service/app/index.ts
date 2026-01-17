import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { app } from './app.js'
import { connectDB } from 'devdad-express-utils'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.join(__dirname, '.env') }) 
const port = process.env.PORT

connectDB()
.then(() => {
    app.listen(port , () => {
        console.log(`Image processing service is now running on ${port}`);        
    })
})
.catch((err) => {
    console.error(`Image processing start up failed ${err}`);    
    process.exit(1)
})