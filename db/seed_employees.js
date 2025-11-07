require('dotenv').config();
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.PG_CONN });
const SALT_ROUNDS = 12;

async function seed() {
  const employees = [
    { username: 'emp_jane', password: 'ChangeMe!123' },
    { username: 'emp_john', password: 'ChangeMe!123' }
  ];
  for (const e of employees) {
    const hash = await bcrypt.hash(e.password, SALT_ROUNDS);
    await pool.query(
      'INSERT INTO users (username, password_hash, role) VALUES ($1,$2,$3) ON CONFLICT (username) DO NOTHING',
      [e.username, hash, 'employee']
    );
  }
  console.log('Employees seeded');
  await pool.end();
}

seed();
