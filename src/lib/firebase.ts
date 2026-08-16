import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  query,
  where,
  serverTimestamp,
  orderBy,
  limit,
} from 'firebase/firestore';
import firebaseConfigJson from '../../firebase-applet-config.json';

// Initialize Firebase App with lazy initialization
const firebaseConfig = {
  projectId: firebaseConfigJson.projectId,
  appId: firebaseConfigJson.appId,
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  firestoreDatabaseId: firebaseConfigJson.firestoreDatabaseId || '(default)',
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Pre-seeded VIP clearance keys for J.A.R.V.I.S.
export const DEFAULT_STARK_KEYS = [
  {
    keyCode: 'UMANG-STARK-3000',
    label: 'Umang Rai Master Override',
    clearanceLevel: 'Level 10 - Omnipotent Master',
    owner: 'Umang Rai',
    isActive: true,
  },
  {
    keyCode: 'JARVIS-VIP-2026',
    label: 'Stark Tactical Protocol Pass',
    clearanceLevel: 'Level 9 - Tactical Command',
    owner: 'Stark Industries',
    isActive: true,
  },
  {
    keyCode: 'GENIUS-BILLIONAIRE-MK7',
    label: 'Avengers Tactical Clearance',
    clearanceLevel: 'Level 8 - Priority Combatant',
    owner: 'Avengers Initiative',
    isActive: true,
  },
  {
    keyCode: 'UMANG-DEV-KEY',
    label: 'Architect Developer Clearance',
    clearanceLevel: 'Level 10 - Full Access',
    owner: 'Umang Rai',
    isActive: true,
  },
  {
    keyCode: 'STARK-ARC-REACTOR',
    label: 'Arc Core Biometric Pass',
    clearanceLevel: 'Level 7 - Executive Operative',
    owner: 'Stark Security',
    isActive: true,
  },
];

// Initialize database with default keys if empty
export async function seedInitialStarkKeys(): Promise<void> {
  try {
    const keysCol = collection(db, 'stark_access_keys');
    const snap = await getDocs(keysCol);
    if (snap.empty) {
      for (const k of DEFAULT_STARK_KEYS) {
        await setDoc(doc(db, 'stark_access_keys', k.keyCode), {
          key_code: k.keyCode,
          label: k.label,
          clearance_level: k.clearanceLevel,
          owner: k.owner,
          is_active: true,
          uses_count: 0,
          created_at: new Date().toISOString(),
        });
      }
      console.log('[FIREBASE] Seeded initial Stark Access Clearance Keys into Firestore.');
    }
  } catch (err) {
    console.warn('[FIREBASE] Seed notice (offline or rules fallback):', err);
  }
}

// Verify an access key in Firestore
export async function verifyStarkAccessKey(keyCode: string): Promise<{
  isValid: boolean;
  clearanceLevel?: string;
  label?: string;
  message?: string;
}> {
  const cleanKey = keyCode.trim().toUpperCase();
  if (!cleanKey) {
    return { isValid: false, message: 'Please enter a valid key code.' };
  }

  // Check fallback local pre-seeded list first
  const localMatch = DEFAULT_STARK_KEYS.find((k) => k.keyCode === cleanKey);

  try {
    const docRef = doc(db, 'stark_access_keys', cleanKey);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const data = snap.data();
      if (data.is_active !== false) {
        // Log access in Firestore
        try {
          await addDoc(collection(db, 'access_logs'), {
            key_code: cleanKey,
            status: 'GRANTED',
            timestamp: new Date().toISOString(),
            clearance_level: data.clearance_level || 'Level 10',
          });
        } catch {
          // ignore log write errors
        }

        return {
          isValid: true,
          clearanceLevel: data.clearance_level || 'Level 9 Tactical Clearance',
          label: data.label || 'Stark Security Access Key',
        };
      } else {
        return { isValid: false, message: 'This clearance key has been revoked by Stark Security.' };
      }
    }

    if (localMatch) {
      // Key matches pre-seeded list
      return {
        isValid: true,
        clearanceLevel: localMatch.clearanceLevel,
        label: localMatch.label,
      };
    }

    return { isValid: false, message: 'Invalid Clearance Key. Verification failed against Stark Database.' };
  } catch (err) {
    console.error('[FIREBASE] Key verification error:', err);
    if (localMatch) {
      return {
        isValid: true,
        clearanceLevel: localMatch.clearanceLevel,
        label: localMatch.label,
      };
    }
    return { isValid: false, message: 'Firebase verification error. Check database link.' };
  }
}

// Generate & save a new guest/VIP key in Firestore
export async function generateFirebaseClearanceKey(applicantName: string = 'Authorized Operative'): Promise<{
  keyCode: string;
  clearanceLevel: string;
  label: string;
}> {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const randomId = Math.random().toString(36).substring(2, 6).toUpperCase();
  const keyCode = `JARVIS-VIP-${randomSuffix}-${randomId}`;
  const clearanceLevel = 'Level 8 - Tactical Guest Clearance';
  const label = `${applicantName}'s Stark Clearance Pass`;

  try {
    await setDoc(doc(db, 'stark_access_keys', keyCode), {
      key_code: keyCode,
      label,
      clearance_level: clearanceLevel,
      owner: applicantName,
      is_active: true,
      uses_count: 1,
      created_at: new Date().toISOString(),
    });

    await addDoc(collection(db, 'access_logs'), {
      key_code: keyCode,
      status: 'PROVISIONED_AND_GRANTED',
      timestamp: new Date().toISOString(),
      applicant: applicantName,
    });
  } catch (err) {
    console.warn('[FIREBASE] Key generation online sync warning:', err);
  }

  return {
    keyCode,
    clearanceLevel,
    label,
  };
}

// Log a holographic call in Firestore
export async function logCallToFirebase(callData: {
  contactName: string;
  handleOrNumber?: string;
  durationSeconds: number;
  status: string;
  category?: string;
}): Promise<void> {
  try {
    await addDoc(collection(db, 'call_logs'), {
      contact_name: callData.contactName,
      handle_or_number: callData.handleOrNumber || 'Encrypted Stark Link',
      duration_seconds: callData.durationSeconds,
      status: callData.status,
      category: callData.category || 'Tactical Comms',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('[FIREBASE] Call log sync notice:', err);
  }
}
