import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth } from './config';

const provider = new GoogleAuthProvider();

// Whitelist of authorized emails - STRICT
const AUTHORIZED_EMAILS = [
  'magv.1287@gmail.com',
  'gcgv25@gmail.com'
];

export function isAuthorizedUser(email: string): boolean {
  return AUTHORIZED_EMAILS.includes(email.toLowerCase());
}

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    // Immediate whitelist check - fail fast
    if (!isAuthorizedUser(user.email || '')) {
      await firebaseSignOut(auth);
      throw new Error('Acceso no autorizado. Esta aplicación es privada.');
    }
    
    return user;
  } catch (error: any) {
    console.error('Error during sign in:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error during sign out:', error);
    throw error;
  }
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
