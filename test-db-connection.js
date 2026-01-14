const { Client } = require('pg');

const client = new Client({
  host: '127.0.0.1',
  port: 5440,
  user: 'user',
  password: 'haster11',
  database: 'sagepoint',
});

async function testConnection() {
  try {
    await client.connect();
    console.log('✓ Connection successful');
    const res = await client.query('SELECT current_database(), current_user');
    console.log('Database:', res.rows[0].current_database);
    console.log('User:', res.rows[0].current_user);
    await client.end();
  } catch (err) {
    console.error('✗ Connection failed:', err.message);
    console.error('Full error:', err);
    process.exit(1);
  }
}

testConnection();
