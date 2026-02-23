// ─── User & Auth ────────────────────────────────────────────────────────────
export type UserRole = 'admin' | 'inspector';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: string;
}

// ─── Facility ────────────────────────────────────────────────────────────────
export type FacilityType = '학교' | '공공시설' | '공사현장';

export interface Facility {
  id: string;
  name: string;
  type: FacilityType;
  address: string;
  managerName: string;
  phone: string;
  createdAt: string;
}

// ─── Template ────────────────────────────────────────────────────────────────
export type CheckItemType = 'checkbox' | 'text' | 'number';

export interface CheckItem {
  id: string;
  title: string;
  type: CheckItemType;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  items: CheckItem[];
  createdAt: string;
}

// ─── Inspection ──────────────────────────────────────────────────────────────
export type InspectionStatus = 'in_progress' | 'submitted';

export interface InspectionResult {
  itemId: string;
  value: string | boolean | number;
}

export interface Inspection {
  id: string;
  facilityId: string;
  templateId: string;
  inspectorId: string;
  inspectorName: string;
  facilityName: string;
  templateName: string;
  date: string;
  status: InspectionStatus;
  results: InspectionResult[];
  photos: string[];
  createdAt: string;
}
