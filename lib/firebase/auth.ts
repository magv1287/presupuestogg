import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut,
  User as FirebaseUser 
} from 'firebase/auth';
import { auth } from './config';

const ALLOWED_EMAILS = process.env.NEXT_PUBLIC_ALLOWED_EMAILS?.split(',') || [
  'gcgv25@gmail.com',
  'magv.1287@gmail.com'
];

export const isEmailAllowed = (email: string | null): boolean => {
  if (!email) return false;
  return ALLOWED_EMAILS.includes(email.toLowerCase());
};

export const signInWithGoogle = async (): Promise<FirebaseUser | null> => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // CRITICAL: Validate email
    if (!isEmailAllowed(user.email)) {
      await firebaseSignOut(auth);
      throw new Error(
        `Acceso denegado. Solo los usuarios autorizados pueden acceder a esta aplicación.`
      );
    }

    return user;
  } catch (error: any) {
    console.error('Error during sign in:', error);
    throw error;
  }
};

export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error during sign out:', error);
    throw error;
  }
};
