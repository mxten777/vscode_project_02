/**
 * Firebase Firestore 대체 Mock 서비스
 * 모든 데이터는 메모리에 저장됩니다 (새로고침 시 초기화)
 */
import type { Facility, Template, Inspection, AppUser } from '../types';
import {
  MOCK_FACILITIES,
  MOCK_TEMPLATES,
  MOCK_INSPECTIONS,
  MOCK_USERS,
} from './mockData';

// ── In-memory store ─────────────────────────────────────────────────────────
let facilities = [...MOCK_FACILITIES];
let templates = [...MOCK_TEMPLATES];
let inspections = [...MOCK_INSPECTIONS];
let users = [...MOCK_USERS];

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));
const uid = () => Math.random().toString(36).slice(2, 10);
const now = () => new Date().toISOString();

// ── Users ────────────────────────────────────────────────────────────────────
export const mockGetUserDoc = async (id: string): Promise<AppUser | null> => {
  await delay(100);
  return users.find((u) => u.uid === id) ?? null;
};

export const mockSetUserDoc = async (user: Omit<AppUser, 'createdAt'>) => {
  await delay(100);
  const idx = users.findIndex((u) => u.uid === user.uid);
  const full: AppUser = { ...user, createdAt: now() };
  if (idx >= 0) users[idx] = full;
  else users.push(full);
};

export const mockGetAllUsers = async (): Promise<AppUser[]> => {
  await delay(200);
  return [...users];
};

// ── Facilities ───────────────────────────────────────────────────────────────
export const mockGetFacilities = async (): Promise<Facility[]> => {
  await delay(300);
  return [...facilities].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

export const mockAddFacility = async (
  data: Omit<Facility, 'id' | 'createdAt'>
): Promise<string> => {
  await delay(400);
  const id = uid();
  facilities.push({ ...data, id, createdAt: now() });
  return id;
};

export const mockUpdateFacility = async (
  id: string,
  data: Partial<Omit<Facility, 'id' | 'createdAt'>>
) => {
  await delay(300);
  facilities = facilities.map((f) => (f.id === id ? { ...f, ...data } : f));
};

export const mockDeleteFacility = async (id: string) => {
  await delay(300);
  facilities = facilities.filter((f) => f.id !== id);
};

// ── Templates ─────────────────────────────────────────────────────────────────
export const mockGetTemplates = async (): Promise<Template[]> => {
  await delay(300);
  return [...templates].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

export const mockAddTemplate = async (
  data: Omit<Template, 'id' | 'createdAt'>
): Promise<string> => {
  await delay(400);
  const id = uid();
  templates.push({ ...data, id, createdAt: now() });
  return id;
};

export const mockUpdateTemplate = async (
  id: string,
  data: Partial<Omit<Template, 'id' | 'createdAt'>>
) => {
  await delay(300);
  templates = templates.map((t) => (t.id === id ? { ...t, ...data } : t));
};

export const mockDeleteTemplate = async (id: string) => {
  await delay(300);
  templates = templates.filter((t) => t.id !== id);
};

// ── Inspections ───────────────────────────────────────────────────────────────
export const mockCreateInspection = async (
  data: Omit<Inspection, 'id' | 'createdAt'>
): Promise<string> => {
  await delay(400);
  const id = uid();
  inspections.push({ ...data, id, createdAt: now() });
  return id;
};

export const mockUpdateInspection = async (
  id: string,
  data: Partial<Omit<Inspection, 'id' | 'createdAt'>>
) => {
  await delay(300);
  inspections = inspections.map((i) => (i.id === id ? { ...i, ...data } : i));
};

export const mockGetInspection = async (
  id: string
): Promise<Inspection | null> => {
  await delay(200);
  return inspections.find((i) => i.id === id) ?? null;
};

export const mockGetInspectionsByInspector = async (
  uid: string
): Promise<Inspection[]> => {
  await delay(300);
  return [...inspections]
    .filter((i) => i.inspectorId === uid)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const mockGetAllInspections = async (): Promise<Inspection[]> => {
  await delay(300);
  return [...inspections].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};
