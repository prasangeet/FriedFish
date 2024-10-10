import admin from 'firebase-admin';
import { join } from 'path';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

const serviceAccount = JSON.parse(readFileSync(join(__dirname, 'serviceAccountKey.json'), 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET
});

const db = admin.firestore();
const bucket = admin.storage().bucket();
const auth = admin.auth(); 

console.log('Firebase Storage Bucket:', process.env.FIREBASE_STORAGE_BUCKET);

export { admin, db, bucket, auth };