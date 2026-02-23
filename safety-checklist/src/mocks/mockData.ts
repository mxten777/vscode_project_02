import type { Facility, Template, Inspection, AppUser } from '../types';

export const MOCK_ADMIN: AppUser = {
  uid: 'mock-admin-001',
  email: 'admin@demo.com',
  displayName: '관리자 김민준',
  role: 'admin',
  createdAt: '2024-01-01T00:00:00.000Z',
};

export const MOCK_INSPECTOR: AppUser = {
  uid: 'mock-inspector-001',
  email: 'inspector@demo.com',
  displayName: '점검자 홍길동',
  role: 'inspector',
  createdAt: '2024-01-01T00:00:00.000Z',
};

export const MOCK_USERS: AppUser[] = [MOCK_ADMIN, MOCK_INSPECTOR];

export const MOCK_FACILITIES: Facility[] = [
  {
    id: 'f1',
    name: '서울강남초등학교',
    type: '학교',
    address: '서울시 강남구 테헤란로 1길 10',
    managerName: '김교장',
    phone: '02-1234-5678',
    createdAt: '2024-03-01T00:00:00.000Z',
  },
  {
    id: 'f2',
    name: '강남구청',
    type: '공공시설',
    address: '서울시 강남구 학동로 426',
    managerName: '이담당',
    phone: '02-3423-5678',
    createdAt: '2024-03-05T00:00:00.000Z',
  },
  {
    id: 'f3',
    name: '삼성동 주상복합 신축현장',
    type: '공사현장',
    address: '서울시 강남구 삼성동 159-1',
    managerName: '박현장',
    phone: '010-9876-5432',
    createdAt: '2024-03-10T00:00:00.000Z',
  },
];

export const MOCK_TEMPLATES: Template[] = [
  {
    id: 't1',
    name: '학교 안전점검',
    description: '학교 시설 안전점검 표준 양식 (교육부 기준)',
    items: [
      { id: 'item_1', title: '소화기 위치 및 상태 확인', type: 'checkbox' },
      { id: 'item_2', title: '비상구 및 대피로 확보 여부', type: 'checkbox' },
      { id: 'item_3', title: '전기 배선 상태 이상 없음', type: 'checkbox' },
      { id: 'item_4', title: '계단 난간 고정 상태 확인', type: 'checkbox' },
      { id: 'item_5', title: '화장실 위생 상태 양호', type: 'checkbox' },
      { id: 'item_6', title: '냉난방 기기 작동 상태 정상', type: 'checkbox' },
      { id: 'item_7', title: '특이사항 메모', type: 'text' },
      { id: 'item_8', title: '점검 참여 인원 수', type: 'number' },
    ],
    createdAt: '2024-02-01T00:00:00.000Z',
  },
  {
    id: 't2',
    name: '공사현장 안전점검',
    description: '건설현장 안전관리 점검 양식 (고용노동부 기준)',
    items: [
      { id: 'item_1', title: '안전모 착용 여부 확인', type: 'checkbox' },
      { id: 'item_2', title: '추락 방지망 설치 상태 양호', type: 'checkbox' },
      { id: 'item_3', title: '가설 비계 안전 상태 확인', type: 'checkbox' },
      { id: 'item_4', title: '중장비 작업 반경 표시 확인', type: 'checkbox' },
      { id: 'item_5', title: '전기 안전 (임시 배전반 접지)', type: 'checkbox' },
      { id: 'item_6', title: '화기 작업 허가서 보유 확인', type: 'checkbox' },
      { id: 'item_7', title: '현장 근로자 수', type: 'number' },
      { id: 'item_8', title: '위험 요소 및 특이사항', type: 'text' },
    ],
    createdAt: '2024-02-05T00:00:00.000Z',
  },
  {
    id: 't3',
    name: '공공시설 안전점검',
    description: '공공시설 정기 안전점검 표준 양식',
    items: [
      { id: 'item_1', title: '건물 외벽 균열 여부 없음', type: 'checkbox' },
      { id: 'item_2', title: '소방 설비 정상 작동 확인', type: 'checkbox' },
      { id: 'item_3', title: 'CCTV 작동 상태 이상 없음', type: 'checkbox' },
      { id: 'item_4', title: '주차장 안전 시설 확인', type: 'checkbox' },
      { id: 'item_5', title: '엘리베이터 점검 기록 확인', type: 'checkbox' },
      { id: 'item_6', title: '특이사항', type: 'text' },
    ],
    createdAt: '2024-02-10T00:00:00.000Z',
  },
];

export const MOCK_INSPECTIONS: Inspection[] = [
  {
    id: 'i1',
    facilityId: 'f1',
    templateId: 't1',
    inspectorId: 'mock-inspector-001',
    inspectorName: '점검자 홍길동',
    facilityName: '서울강남초등학교',
    templateName: '학교 안전점검',
    date: '2024-11-15',
    status: 'submitted',
    results: [
      { itemId: 'item_1', value: true },
      { itemId: 'item_2', value: true },
      { itemId: 'item_3', value: false },
      { itemId: 'item_4', value: true },
      { itemId: 'item_5', value: true },
      { itemId: 'item_6', value: true },
      { itemId: 'item_7', value: '3층 복도 전구 2개 교체 필요' },
      { itemId: 'item_8', value: 3 },
    ],
    photos: [],
    createdAt: '2024-11-15T09:30:00.000Z',
  },
  {
    id: 'i2',
    facilityId: 'f3',
    templateId: 't2',
    inspectorId: 'mock-inspector-001',
    inspectorName: '점검자 홍길동',
    facilityName: '삼성동 주상복합 신축현장',
    templateName: '공사현장 안전점검',
    date: '2024-11-20',
    status: 'in_progress',
    results: [
      { itemId: 'item_1', value: true },
      { itemId: 'item_2', value: true },
    ],
    photos: [],
    createdAt: '2024-11-20T14:00:00.000Z',
  },
  {
    id: 'i3',
    facilityId: 'f2',
    templateId: 't3',
    inspectorId: 'mock-inspector-001',
    inspectorName: '점검자 홍길동',
    facilityName: '강남구청',
    templateName: '공공시설 안전점검',
    date: '2024-11-22',
    status: 'submitted',
    results: [
      { itemId: 'item_1', value: true },
      { itemId: 'item_2', value: true },
      { itemId: 'item_3', value: true },
      { itemId: 'item_4', value: false },
      { itemId: 'item_5', value: true },
      { itemId: 'item_6', value: 'B2 주차장 유도등 1개 불량 확인됨' },
    ],
    photos: [],
    createdAt: '2024-11-22T11:00:00.000Z',
  },
];
