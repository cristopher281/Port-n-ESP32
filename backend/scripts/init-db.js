import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

async function initializeDatabase() {
    let connection;

    try {
        console.log('Connecting to MySQL...');

        // Create connection
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            multipleStatements: true
        });

        console.log('✓ Connected to MySQL');

        // Read SQL file
        const sqlFile = path.join(__dirname, 'init-db.sql');
        const sql = await fs.readFile(sqlFile, 'utf8');

        console.log('Executing SQL script...');

        // Execute SQL
        await connection.query(sql);

        console.log('✓ Database initialized successfully');
        console.log('✓ Tables created: devices, sensor_readings');
        console.log('✓ Sample device inserted');

    } catch (error) {
        console.error('✗ Database initialization failed:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

initializeDatabase();
