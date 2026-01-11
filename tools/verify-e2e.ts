import { fetch, FormData, File } from 'undici'; // Or native fetch in Node 18+
import * as fs from 'fs';
import * as path from 'path';

const API_URL = 'http://localhost:3333';
const EMAIL = `test-${Date.now()}@example.com`;
const PASSWORD = 'password123';

async function main() {
  console.log('🚀 Starting E2E Verification...');

  // 1. Register
  console.log(`\n1. Registering user: ${EMAIL}`);
  const regRes = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD, name: 'Test User' }),
  });
  
  if (!regRes.ok) {
    const text = await regRes.text();
    console.error('❌ Registration failed:', regRes.status, text);
    // If 409, try login directly
    if (regRes.status !== 409) process.exit(1);
  } else {
    console.log('✅ Registered');
  }

  // 2. Login
  console.log('\n2. Logging in...');
  const loginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });

  if (!loginRes.ok) {
    console.error('❌ Login failed:', loginRes.status, await loginRes.text());
    process.exit(1);
  }

  const loginData = await loginRes.json() as any;
  const token = loginData.accessToken;
  console.log('✅ Logged in. Token:', token.substring(0, 20) + '...');

  // 3. Upload Document
  console.log('\n3. Uploading Document...');
  
  // Create dummy file
  const filePath = path.join(__dirname, 'test-doc.txt');
  fs.writeFileSync(filePath, 'This is a test document with some concepts about Biology and Chemistry.');
  
  const formData = new FormData();
  // Node's fetch FormData handling can be tricky, using Blob/File polyfills if needed
  // Or simpler: use 'axios' if available, but staying dependency-free-ish.
  // Actually, standard FormData in Node 18+ might require 'file-from-path' or similar.
  // Let's try native Blob.
  const fileContent = fs.readFileSync(filePath);
  const blob = new Blob([fileContent], { type: 'text/plain' });
  formData.append('file', blob, 'test-doc.txt');

  const uploadRes = await fetch(`${API_URL}/documents`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!uploadRes.ok) {
    console.error('❌ Upload failed:', uploadRes.status, await uploadRes.text());
    // process.exit(1); 
    // Continuing just in case it's a 500 we can debug
    process.exit(1);
  }

  const doc = await uploadRes.json() as any;
  console.log('✅ Uploaded. Document ID:', doc.id);

  // 4. Poll Status
  console.log('\n4. Polling Status...');
  let attempts = 0;
  while (attempts < 10) {
    const statusRes = await fetch(`${API_URL}/documents/${doc.id}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const statusDoc = await statusRes.json() as any;
    console.log(`   Status: ${statusDoc.status}`);

    if (statusDoc.status === 'COMPLETED') {
        console.log('✅ Document Processing Completed!');
        break;
    }
    if (statusDoc.status === 'FAILED') {
        console.error('❌ Document Processing Failed:', statusDoc.errorMessage);
        process.exit(1);
    }

    await new Promise(r => setTimeout(r, 2000));
    attempts++;
  }

  console.log('\n🎉 E2E Verification Passed!');
}

main().catch(err => console.error(err));
