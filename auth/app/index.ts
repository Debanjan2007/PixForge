import app from './app.js'
import { connectDB } from 'devdad-express-utils'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { connectToClient } from './src/db/redis.db.connect.js'

const __filename = fileURLToPath(import.meta.url)
export const __dirname = path.dirname(__filename)
// load the .env file located in src/
dotenv.config({ path: path.join(__dirname, '.env') })


const port = 5600;
console.log(path.join(__dirname, '.env'));

connectDB().then(async () => {
    await connectToClient()
    app.listen(port, () => {
        console.log(`Server is running at http://localhost:${port}`);
    })
}).catch((err) => {
    console.error('Startup failed:', err);
    process.exit(1);
})