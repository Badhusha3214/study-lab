import app from './app.js';
import { connectDB } from './config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/studylab';

async function start() {
  await connectDB(MONGO_URI);
  app.listen(PORT, () => console.log(`API server listening on port ${PORT}`));
}

start();
