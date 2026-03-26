import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '.env') });

import { FirestoreService } from './src/lib/firestore-service';

async function verifyFirestore() {
  console.log('--- FIRESTORE DIAGNOSTIC ---');
  console.log('Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
  
  try {
    const testWorker = {
      test: true,
      email: `diag_${Date.now()}@example.com`,
    };

    console.log('Attempting addDoc...');
    const added = await FirestoreService.addDocument<any>('workers', testWorker);
    console.log('Success! ID:', added.id);
  } catch (error: any) {
    console.log('--- ERROR DETAILS ---');
    console.log('Name:', error.name);
    console.log('Code:', error.code);
    console.log('Message:', error.message);
    if (error.code === 'not-found') {
      console.log('TIP: Check if "Firestore Database" is enabled in Firebase Console.');
    }
  }
  process.exit(0);
}

verifyFirestore();
