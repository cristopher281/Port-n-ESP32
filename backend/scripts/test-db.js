import dotenv from 'dotenv'
import { testConnection } from '../src/config/database.js'

dotenv.config()

async function run() {
  try {
    await testConnection()
    console.log('Database test succeeded')
    process.exit(0)
  } catch (err) {
    console.error('Database test failed:', err.message)
    process.exit(1)
  }
}

run()
