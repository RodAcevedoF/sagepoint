import { Client } from 'pg';

async function check(password: string, label: string) {
  const client = new Client({
    host: '127.0.0.1',
    port: 5432,
    user: 'user',
    password: password,
    database: 'sagepoint',
  });

  try {
    await client.connect();
    console.log(`✅ SUCCESS: Connected with '${label}' (password: ${password})`);
    await client.end();
    return true;
  } catch (err: any) {
    console.log(`❌ FAILED: Could not connect with '${label}' (password: ${password}) - ${err.message}`);
    await client.end();
    return false;
  }
}

async function main() {
  console.log('🔍 Database Credential Diagnostic');
  console.log('---------------------------------');
  
  const oldPass = await check('password', 'OLD');
  const newPass = await check('haster11', 'NEW');

  if (oldPass && !newPass) {
    console.log('\n⚠️  DIAGNOSIS: Container is STALE. It is still using the old password.');
    console.log('   ACTION: Run "docker-compose down -v" then "docker-compose up -d"');
  } else if (!oldPass && newPass) {
    console.log('\n✅ DIAGNOSIS: Password is correct (haster11). Problem might be elsewhere.');
  } else if (!oldPass && !newPass) {
    console.log('\n❌ DIAGNOSIS: Neither password works. Container might be down or not exposing port.');
  } else {
    console.log('\n❓ DIAGNOSIS: Both worked? That is weird.');
  }
}

main();
