import dotenv from 'dotenv';
dotenv.config();

import { sequelize } from './config/database';

// Import models so Sequelize registers them before sync.
// Adjust paths if your model filenames are different.
import './models/User';
import './models/Post';
import './models/Flag';
import './models/ModerationLog';
import './models/AIAnalysis';
import './models/Community';

async function main() {
  try {
    console.log('Connecting to DB and synchronizing schema (alter: true)...');
    await sequelize.authenticate();
    // alter:true will create missing tables and make minor column adjustments - good for demo
    await sequelize.sync({ alter: true });
    console.log('Database synchronized successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Sync failed:', err);
    process.exit(1);
  }
}

main();
