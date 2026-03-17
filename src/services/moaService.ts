import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  addDoc, 
  serverTimestamp, 
  getDoc,
  query,
  where,
  onSnapshot,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { MOA, AuditLog, UserProfile } from '../types';

export const logAction = async (
  operation: AuditLog['operation'],
  moaId: string,
  moaName: string,
  details: string
) => {
  const user = auth.currentUser;
  if (!user) return;

  await addDoc(collection(db, 'audit_logs'), {
    userName: user.displayName || user.email,
    userEmail: user.email,
    operation,
    moaId,
    moaName,
    timestamp: new Date().toISOString(),
    details
  });
};

export const createMOA = async (moaData: Partial<MOA>) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const moaRef = await addDoc(collection(db, 'moas'), {
    ...moaData,
    isDeleted: false,
    createdBy: user.uid,
    updatedBy: user.uid,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  await logAction('insert', moaRef.id, moaData.companyName || '', `Created MOA for ${moaData.companyName}`);
  return moaRef.id;
};

export const updateMOA = async (moaId: string, moaData: Partial<MOA>) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const moaRef = doc(db, 'moas', moaId);
  await updateDoc(moaRef, {
    ...moaData,
    updatedBy: user.uid,
    updatedAt: new Date().toISOString()
  });

  await logAction('edit', moaId, moaData.companyName || '', `Updated MOA details`);
};

export const softDeleteMOA = async (moaId: string, companyName: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const moaRef = doc(db, 'moas', moaId);
  await updateDoc(moaRef, {
    isDeleted: true,
    updatedBy: user.uid,
    updatedAt: new Date().toISOString()
  });

  await logAction('delete', moaId, companyName, `Soft deleted MOA`);
};

export const recoverMOA = async (moaId: string, companyName: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const moaRef = doc(db, 'moas', moaId);
  await updateDoc(moaRef, {
    isDeleted: false,
    updatedBy: user.uid,
    updatedAt: new Date().toISOString()
  });

  await logAction('recover', moaId, companyName, `Recovered MOA`);
};
