import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Bundle, SharedDocument } from '../types';

const SHARED_COLLECTION = 'shared';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const STORAGE_PREFIX = 'share:';

export const getLocalShareId = (projectId: string): string | null =>
  localStorage.getItem(STORAGE_PREFIX + projectId);

export const clearLocalShareId = (projectId: string) =>
  localStorage.removeItem(STORAGE_PREFIX + projectId);

export const createShareLink = async (
  projectId: string,
  ownerId: string,
  projectName: string,
  bundles: Bundle[],
  shareId: string = crypto.randomUUID()
): Promise<SharedDocument> => {
  const now = Date.now();
  const shared: SharedDocument = {
    id: shareId,
    projectId,
    ownerId,
    projectName,
    bundles,
    createdAt: now,
    expiresAt: now + SEVEN_DAYS_MS,
    updatedAt: now,
  };
  await setDoc(doc(db, SHARED_COLLECTION, shareId), shared);
  localStorage.setItem(STORAGE_PREFIX + projectId, shareId);
  return shared;
};

export const updateShareLink = async (
  shareId: string,
  projectName: string,
  bundles: Bundle[]
): Promise<{ updatedAt: number; expiresAt: number }> => {
  const now = Date.now();
  await setDoc(
    doc(db, SHARED_COLLECTION, shareId),
    { projectName, bundles, updatedAt: now, expiresAt: now + SEVEN_DAYS_MS },
    { merge: true }
  );
  return { updatedAt: now, expiresAt: now + SEVEN_DAYS_MS };
};

export const revokeShareLink = async (
  shareId: string,
  projectId: string
): Promise<void> => {
  await deleteDoc(doc(db, SHARED_COLLECTION, shareId));
  localStorage.removeItem(STORAGE_PREFIX + projectId);
};

const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> =>
  Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('TIMEOUT')), ms)
    ),
  ]);

export const getSharedDocument = async (
  shareId: string
): Promise<SharedDocument | null> => {
  const snapshot = await withTimeout(
    getDoc(doc(db, SHARED_COLLECTION, shareId)),
    10000
  );
  if (!snapshot.exists()) return null;
  const data = snapshot.data() as SharedDocument;
  if (data.expiresAt < Date.now()) {
    deleteDoc(doc(db, SHARED_COLLECTION, data.id)).catch(() => {});
    return null;
  }
  return data;
};

export const getShareUrl = (shareId: string): string =>
  `${window.location.origin}/shared/${shareId}`;
