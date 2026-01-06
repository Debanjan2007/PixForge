import app from './app.js'
import { connectDB, getDBStatus } from 'devdad-express-utils'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { connectImageKit } from './src/utils/imagekit.conf.js'
import { connectToClient } from './src/db/redis.db.connect.js'
import type ImageKit from 'imagekit'

const __filename = fileURLToPath(import.meta.url)
export const __dirname = path.dirname(__filename)
// load the .env file located in src/
dotenv.config({ path: path.join(__dirname, '.env') })

export let imagekitClient : ImageKit | null = null

const port = 5600;
connectDB().then(async () => {
    const dbStatus = getDBStatus()
    console.log(`Mongodb connected on ${dbStatus.host}`);
    await connectToClient(process.env.REDIS_URL as string, process.env.REDIS_PASS as string)
    app.listen(port, () => {
        imagekitClient = connectImageKit(process.env.IMAGEKIT_PUBLIC_KEY as string , process.env.IMAGEKIT_PRIVATE_KEY as string , process.env.IMAGEKIT_END_POINT as string)
        console.log(`Server is running at http://localhost:${port}`);
    })
}).catch((err) => {
    console.error('Startup failed:', err);
    process.exit(1);
})