import app from './app.js'
import { connectDB, getDBStatus } from 'devdad-express-utils'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
export const __dirname = path.dirname(__filename)
// load the .env file located in src/
dotenv.config({ path: path.join(__dirname, '.env') })


const port = 5600;
connectDB().then(async () => {
    const dbStatus = getDBStatus()
    console.log(`Mongodb connected on ${dbStatus.host}`);
    app.listen(port, () => {
        console.log(`Server is running at http://localhost:${port}`);
    })
}).catch((err) => {
    console.error('Startup failed:', err);
    process.exit(1);
})