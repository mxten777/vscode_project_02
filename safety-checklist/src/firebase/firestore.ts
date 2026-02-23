import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db, IS_MOCK } from './config';
import type { Facility, Template, Inspection, AppUser } from '../types';
import {
  mockGetUserDoc, mockSetUserDoc, mockGetAllUsers,
  mockGetFacilities, mockAddFacility, mockUpdateFacility, mockDeleteFacility,
  mockGetTemplates, mockAddTemplate, mockUpdateTemplate, mockDeleteTemplate,
  mockCreateInspection, mockUpdateInspection, mockGetInspection,
  mockGetInspectionsByInspector, mockGetAllInspections,
} from '../mocks/mockFirestore';

// ─── Helpers ────────────────────────────────────────────────────────────────
const toDate = (val: unknown): string => {
  if (!val) return new Date().toISOString();
  if (val instanceof Timestamp) return val.toDate().toISOString();
  return String(val);
};

// ─── Users ───────────────────────────────────────────────────────────────────
export const createUserDoc = async (user: Omit<AppUser, 'createdAt'>) => {
  if (IS_MOCK) return;
  await updateDoc(doc(db, 'users', user.uid), {
    ...user,
    createdAt: serverTimestamp(),
  }).catch(() =>
    addDoc(collection(db, 'users'), { ...user, createdAt: serverTimestamp() })
  );
};

export const setUserDoc = async (user: Omit<AppUser, 'createdAt'>) => {
  if (IS_MOCK) return mockSetUserDoc(user);
  await setDoc(doc(db, 'users', user.uid), {
    ...user,
    createdAt: serverTimestamp(),
  });
};

export const getUserDoc = async (uid: string): Promise<AppUser | null> => {
  if (IS_MOCK) return mockGetUserDoc(uid);
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  const d = snap.data();
  return { ...d, uid: snap.id, createdAt: toDate(d.createdAt) } as AppUser;
};

export const getAllUsers = async (): Promise<AppUser[]> => {
  if (IS_MOCK) return mockGetAllUsers();
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map((d) => ({
    ...d.data(),
    uid: d.id,
    createdAt: toDate(d.data().createdAt),
  })) as AppUser[];
};

// ─── Facilities ───────────────────────────────────────────────────────────────
export const addFacility = async (data: Omit<Facility, 'id' | 'createdAt'>) => {
  if (IS_MOCK) return mockAddFacility(data);
  const ref = await addDoc(collection(db, 'facilities'), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const updateFacility = async (id: string, data: Partial<Omit<Facility, 'id' | 'createdAt'>>) => {
  if (IS_MOCK) return mockUpdateFacility(id, data);
  await updateDoc(doc(db, 'facilities', id), data);
};

export const deleteFacility = async (id: string) => {
  if (IS_MOCK) return mockDeleteFacility(id);
  await deleteDoc(doc(db, 'facilities', id));
};

export const getFacilities = async (): Promise<Facility[]> => {
  if (IS_MOCK) return mockGetFacilities();
  const q = query(collection(db, 'facilities'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    ...d.data(),
    id: d.id,
    createdAt: toDate(d.data().createdAt),
  })) as Facility[];
};

// ─── Templates ────────────────────────────────────────────────────────────────
export const addTemplate = async (data: Omit<Template, 'id' | 'createdAt'>) => {
  if (IS_MOCK) return mockAddTemplate(data);
  const ref = await addDoc(collection(db, 'templates'), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const updateTemplate = async (id: string, data: Partial<Omit<Template, 'id' | 'createdAt'>>) => {
  if (IS_MOCK) return mockUpdateTemplate(id, data);
  await updateDoc(doc(db, 'templates', id), data);
};

export const deleteTemplate = async (id: string) => {
  if (IS_MOCK) return mockDeleteTemplate(id);
  await deleteDoc(doc(db, 'templates', id));
};

export const getTemplates = async (): Promise<Template[]> => {
  if (IS_MOCK) return mockGetTemplates();
  const q = query(collection(db, 'templates'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    ...d.data(),
    id: d.id,
    createdAt: toDate(d.data().createdAt),
  })) as Template[];
};

// ─── Inspections ──────────────────────────────────────────────────────────────
export const createInspection = async (data: Omit<Inspection, 'id' | 'createdAt'>) => {
  if (IS_MOCK) return mockCreateInspection(data);
  const ref = await addDoc(collection(db, 'inspections'), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const updateInspection = async (id: string, data: Partial<Omit<Inspection, 'id' | 'createdAt'>>) => {
  if (IS_MOCK) return mockUpdateInspection(id, data);
  await updateDoc(doc(db, 'inspections', id), data);
};

export const getInspection = async (id: string): Promise<Inspection | null> => {
  if (IS_MOCK) return mockGetInspection(id);
  const snap = await getDoc(doc(db, 'inspections', id));
  if (!snap.exists()) return null;
  const d = snap.data();
  return { ...d, id: snap.id, createdAt: toDate(d.createdAt) } as Inspection;
};

export const getInspectionsByInspector = async (uid: string): Promise<Inspection[]> => {
  if (IS_MOCK) return mockGetInspectionsByInspector(uid);
  const q = query(
    collection(db, 'inspections'),
    where('inspectorId', '==', uid),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    ...d.data(),
    id: d.id,
    createdAt: toDate(d.data().createdAt),
  })) as Inspection[];
};

export const getAllInspections = async (): Promise<Inspection[]> => {
  if (IS_MOCK) return mockGetAllInspections();
  const q = query(collection(db, 'inspections'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    ...d.data(),
    id: d.id,
    createdAt: toDate(d.data().createdAt),
  })) as Inspection[];
};
