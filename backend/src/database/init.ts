import { createPool } from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const pool = createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'emploi_dynamique',
  multipleStatements: true
});

async function initializeDatabase() {
  try {
    // Read the schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Execute the schema
    await pool.query(schema);
    console.log('Database initialized successfully');

    // Create an admin user
    const adminEmail = 'admin@example.com';
    const adminPassword = 'admin123'; // In production, use a secure password
    const hashedPassword = await import('bcryptjs').then(bcrypt => 
      bcrypt.default.hash(adminPassword, 10)
    );

    await pool.query(
      'INSERT INTO users (email, password, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)',
      [adminEmail, hashedPassword, 'Admin', 'User', 'admin']
    );

    console.log('Admin user created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

initializeDatabase(); 