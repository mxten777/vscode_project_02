# 시설 안전점검 디지털 체크리스트 시스템

> 학교·공공시설·공사현장 현장 점검자가 모바일로 점검하고,  
> 결과를 자동으로 PDF 보고서로 생성하는 공공기관 납품용 웹 애플리케이션 (MVP)

---

## 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [기술 스택](#2-기술-스택)
3. [프로젝트 폴더 구조](#3-프로젝트-폴더-구조)
4. [화면 구성 및 기능](#4-화면-구성-및-기능)
5. [사용자 권한](#5-사용자-권한)
6. [데이터 구조 (Firestore)](#6-데이터-구조-firestore)
7. [환경 설정](#7-환경-설정)
8. [개발 환경 실행](#8-개발-환경-실행)
9. [Firebase 설정](#9-firebase-설정)
10. [보안 규칙](#10-보안-규칙)
11. [최초 관리자 계정 설정](#11-최초-관리자-계정-설정)
12. [Vercel 배포](#12-vercel-배포)
13. [Mock 모드 (개발용)](#13-mock-모드-개발용)
14. [향후 고도화 계획](#14-향후-고도화-계획)

---

## 1. 프로젝트 개요

### 배경

기존 종이 기반 안전점검 방식의 문제점을 해결하기 위한 디지털 전환 솔루션입니다.

| 기존 방식 | 디지털 전환 후 |
|---|---|
| 종이 체크리스트 직접 작성 | 모바일 웹앱으로 즉시 점검 |
| 사진 별도 촬영 후 수동 첨부 | 점검 중 사진 등록 및 자동 연동 |
| 수기 보고서 작성 (시간 소요) | 점검 완료 즉시 PDF 자동 생성 |
| 분실·훼손 위험 | 클라우드 영구 보관 |
| 조회·통계 불가 | 대시보드에서 실시간 현황 파악 |

### 대상 시설

- **학교**: 교육부 기준 안전점검 항목 적용
- **공공시설**: 구청·주민센터 등 공공청사
- **공사현장**: 고용노동부 기준 건설현장 안전점검

### 개발 목표

- **2주 내** 개발 가능한 MVP 구조
- 향후 **공공기관 납품** 가능한 확장성 있는 아키텍처
- 현장 점검자가 **스마트폰만으로** 완결되는 UX

---

## 2. 기술 스택

### 프론트엔드

| 구분 | 라이브러리 | 버전 | 용도 |
|---|---|---|---|
| 프레임워크 | React | 19 | UI 컴포넌트 |
| 빌드 도구 | Vite | 7 | 개발 서버 / 번들링 |
| 언어 | TypeScript | 5 | 타입 안전성 |
| 스타일 | TailwindCSS | 3 | 유틸리티 CSS |
| 라우팅 | React Router | 7 | 페이지 전환 |
| 폼 관리 | React Hook Form | 7 | 폼 상태 / 유효성 검사 |
| 서버 상태 | TanStack Query | 5 | 비동기 데이터 캐싱 |
| 아이콘 | Heroicons | 2 | UI 아이콘 |
| PDF 생성 | jsPDF | 2 | 점검 보고서 출력 |

### 백엔드 (Firebase)

| 서비스 | 용도 |
|---|---|
| Firebase Authentication | 이메일/비밀번호 로그인, 사용자 인증 |
| Firestore Database | 시설·템플릿·점검 데이터 저장 |
| Firebase Storage | 점검 현장 사진 파일 저장 |

### 배포

| 서비스 | 용도 |
|---|---|
| Vercel | 프론트엔드 정적 배포 / CI·CD |
| Firebase Hosting | 대체 배포 옵션 |

---

## 3. 프로젝트 폴더 구조

```
safety-checklist/
├── public/                         # 정적 파일
├── src/
│   ├── main.tsx                    # 앱 진입점
│   ├── App.tsx                     # 전체 라우팅 + 권한 보호 (ProtectedRoute)
│   ├── index.css                   # TailwindCSS 기반 전역 스타일
│   │
│   ├── types/
│   │   └── index.ts                # 전체 TypeScript 인터페이스 정의
│   │                               # (AppUser, Facility, Template, Inspection 등)
│   │
│   ├── firebase/
│   │   ├── config.ts               # Firebase 초기화, IS_MOCK 플래그
│   │   ├── firestore.ts            # Firestore CRUD 서비스 (Mock 분기 포함)
│   │   └── storage.ts              # 사진 업로드 서비스 (Mock 분기 포함)
│   │
│   ├── mocks/                      # ⚙️ 개발용 Mock (Firebase 불필요)
│   │   ├── mockData.ts             # 샘플 시설·템플릿·점검 더미 데이터
│   │   └── mockFirestore.ts        # 인메모리 CRUD (실제 서비스와 동일한 인터페이스)
│   │
│   ├── contexts/
│   │   └── AuthContext.tsx         # 인증 Context (Mock 모드 / Firebase 모드 자동 분기)
│   │
│   ├── components/
│   │   └── Layout.tsx              # 공통 레이아웃
│   │                               # - 데스크탑: 좌측 사이드바
│   │                               # - 모바일: 상단 헤더 + 슬라이드 메뉴
│   │
│   ├── pages/
│   │   ├── Login.tsx               # 로그인 페이지
│   │   │
│   │   ├── admin/                  # 관리자 전용 페이지
│   │   │   ├── Dashboard.tsx       # 시설수·점검수·최근 목록 통계 대시보드
│   │   │   ├── FacilityManagement.tsx  # 시설 등록·수정·삭제 (모달 UI)
│   │   │   ├── TemplateManagement.tsx  # 점검표 템플릿 생성·수정·삭제
│   │   │   └── UserManagement.tsx      # 사용자 권한 변경 (관리자/점검자)
│   │   │
│   │   └── inspector/              # 점검자 페이지 (관리자도 접근 가능)
│   │       ├── InspectionStart.tsx   # 3단계 점검 시작 위자드 (시설→템플릿→시작)
│   │       ├── InspectionForm.tsx    # 실제 점검 수행 + 사진 등록
│   │       ├── InspectionList.tsx    # 점검 목록 조회 + 검색 필터
│   │       └── InspectionDetail.tsx  # 점검 결과 상세 보기 + PDF 다운로드
│   │
│   └── utils/
│       └── pdfGenerator.ts         # jsPDF A4 보고서 생성 (통계·결과·사진 포함)
│
├── .env                            # 환경변수 (Firebase 설정, Git 제외)
├── .env.example                    # 환경변수 예시 템플릿
├── tailwind.config.js              # TailwindCSS 설정
├── vite.config.ts                  # Vite 빌드 설정 (코드 스플리팅)
└── tsconfig.app.json               # TypeScript 컴파일러 설정
```

---

## 4. 화면 구성 및 기능

### 4-1. 로그인 (`/login`)

- 이메일 / 비밀번호 로그인
- 로그인 성공 시 권한에 따라 자동 리디렉션
  - 관리자 → `/admin` (대시보드)
  - 점검자 → `/inspect` (점검 목록)
- 비로그인 상태에서 보호된 경로 접근 시 로그인 페이지로 이동

### 4-2. 관리자 대시보드 (`/admin`)

- 등록 시설 수 / 총 점검 수 / 제출 완료 / 진행 중 통계 카드
- 최근 점검 목록 (클릭 시 상세 화면 이동)

### 4-3. 시설 관리 (`/admin/facilities`)

- 시설 목록 카드형 표시
- **등록**: 시설명, 시설 종류(학교/공공시설/공사현장), 주소, 담당자명, 연락처 입력
- **수정**: 모달에서 기존 정보 수정
- **삭제**: 확인 후 삭제

### 4-4. 점검표 템플릿 관리 (`/admin/templates`)

- 점검표 목록 표시 (항목 뱃지 미리보기 포함)
- **생성**: 이름, 설명, 점검 항목 동적 추가
  - 항목 타입: `체크박스` / `텍스트 입력` / `숫자 입력`
  - 항목 수 제한 없이 추가/삭제 가능
- **수정 / 삭제**

### 4-5. 사용자 관리 (`/admin/users`)

- 전체 사용자 목록 표시
- 드롭다운으로 권한 즉시 변경 (`관리자` / `점검자`)
- 본인 계정은 권한 변경 불가

### 4-6. 점검 시작 (`/inspect/start`)

3단계 위자드 방식으로 점검 준비:

```
1단계: 시설 선택 → 2단계: 점검표 선택 → 3단계: 점검 시작
```

### 4-7. 점검 수행 (`/inspect/form/:id`)

- 선택한 템플릿의 항목을 순서대로 점검
- **체크박스**: 탭으로 이상 없음 / 미확인 토글
- **텍스트**: 특이사항 자유 입력
- **숫자**: 수치 입력 (인원수 등)
- 진행률 프로그레스 바 실시간 표시
- **사진 등록**: 최대 n장, Storage에 자동 업로드
- **임시 저장**: 언제든 중단 후 재개 가능
- **점검 제출**: 확인 후 상태를 `submitted`로 변경 → 이후 수정 불가

### 4-8. 점검 목록 (`/inspect`)

- 본인이 수행한 점검 목록 (관리자는 전체 조회)
- 시설명 / 점검표명 / 날짜로 실시간 검색
- 상태 뱃지 (제출완료 / 진행중)

### 4-9. 점검 결과 상세 (`/inspect/:id`)

- 기본 정보: 시설명, 점검일, 점검자, 점검표명
- 항목별 결과 표시 (Pass / Fail / 입력값)
- 등록된 사진 갤러리 (클릭 시 원본 보기)
- **PDF 보고서 다운로드** 버튼 (제출 완료 상태에서만 활성화)

### 4-10. PDF 보고서 자동 생성

- A4 세로 포맷
- 포함 내용:
  - 표지 헤더 (시스템명, 제출 상태)
  - 기본 정보 (시설명 / 점검일 / 점검자 / 사용 템플릿)
  - 항목별 결과 (Pass/Fail 색상 뱃지)
  - 통계 요약 (통과 항목 수 / 사진 수)
  - 첨부 사진 (2열 그리드, 자동 페이지 추가)
  - 페이지 번호 / 생성 일시

---

## 5. 사용자 권한

| 기능 | 관리자 | 점검자 |
|---|:---:|:---:|
| 관리자 대시보드 | ✅ | ❌ |
| 시설 등록 / 수정 / 삭제 | ✅ | ❌ |
| 점검표 템플릿 관리 | ✅ | ❌ |
| 사용자 권한 변경 | ✅ | ❌ |
| 전체 점검 결과 조회 | ✅ | ❌ |
| 점검 수행 | ✅ | ✅ |
| 내 점검 목록 조회 | ✅ | ✅ |
| 사진 등록 | ✅ | ✅ |
| PDF 보고서 다운로드 | ✅ | ✅ |

---

## 6. 데이터 구조 (Firestore)

### `users` 컬렉션

```typescript
{
  uid: string;           // Firebase Auth UID (문서 ID와 동일)
  email: string;         // 이메일
  displayName: string;   // 표시 이름
  role: 'admin' | 'inspector';  // 사용자 권한
  createdAt: Timestamp;  // 계정 생성일
}
```

### `facilities` 컬렉션

```typescript
{
  id: string;            // 자동 생성 문서 ID
  name: string;          // 시설명 (예: 강남초등학교)
  type: '학교' | '공공시설' | '공사현장';
  address: string;       // 주소
  managerName: string;   // 담당자명
  phone: string;         // 연락처
  createdAt: Timestamp;
}
```

### `templates` 컬렉션

```typescript
{
  id: string;
  name: string;          // 템플릿명 (예: 학교 안전점검)
  description: string;   // 설명
  items: [               // 점검 항목 배열
    {
      id: string;        // 예: "item_1"
      title: string;     // 항목명 (예: 소화기 상태 확인)
      type: 'checkbox' | 'text' | 'number';
    }
  ];
  createdAt: Timestamp;
}
```

### `inspections` 컬렉션

```typescript
{
  id: string;
  facilityId: string;       // 연결된 시설 ID
  templateId: string;       // 사용된 템플릿 ID
  inspectorId: string;      // 점검자 UID
  inspectorName: string;    // 점검자 이름 (화면 표시용 비정규화)
  facilityName: string;     // 시설명 (화면 표시용 비정규화)
  templateName: string;     // 템플릿명 (화면 표시용 비정규화)
  date: string;             // 점검일 (예: "2024. 11. 15.")
  status: 'in_progress' | 'submitted';
  results: [                // 점검 항목별 결과
    {
      itemId: string;       // 템플릿 항목 ID
      value: boolean | string | number;
    }
  ];
  photos: string[];         // Firebase Storage 다운로드 URL 배열
  createdAt: Timestamp;
}
```

### Firebase Storage 경로

```
inspection-images/
└── {inspectionId}/
    ├── 1700000001234.jpg
    ├── 1700000005678.png
    └── ...
```

---

## 7. 환경 설정

프로젝트 루트의 `.env` 파일을 생성합니다.

```bash
# .env.example을 복사
cp .env.example .env
```

`.env` 파일 항목:

```env
# Mock 모드 (true: Firebase 없이 더미 데이터로 실행)
VITE_USE_MOCK=true

# Firebase 설정값 (VITE_USE_MOCK=false 일 때만 사용)
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

> **주의**: `.env` 파일은 `.gitignore`에 포함되어 있어 Git에 업로드되지 않습니다.

---

## 8. 개발 환경 실행

### 사전 요구사항

- Node.js 18 이상
- npm 9 이상

### 의존성 설치

```bash
cd safety-checklist
npm install
```

### 개발 서버 실행

```bash
# Mock 모드로 실행 (.env의 VITE_USE_MOCK=true)
npm run dev
# → http://localhost:5173
```

### 프로덕션 빌드

```bash
npm run build
# TypeScript 오류 0개 확인 후 dist/ 폴더 생성
```

### 빌드 결과물 미리보기

```bash
npm run preview
```

---

## 9. Firebase 설정

### 9-1. Firebase 프로젝트 생성

1. [Firebase Console](https://console.firebase.google.com) 접속
2. **프로젝트 추가** → 프로젝트 이름 입력 → 생성
3. 좌측 `</>` 웹 앱 추가 → 앱 이름 입력 → **firebaseConfig 복사**

### 9-2. Authentication 설정

```
Firebase Console → Authentication → 시작하기
→ 로그인 방법 탭 → 이메일/비밀번호 → 사용 설정 ✅
```

### 9-3. Firestore Database 생성

```
Firebase Console → Firestore Database → 데이터베이스 만들기
→ 프로덕션 모드 선택
→ 리전: asia-northeast3 (서울) 권장
```

### 9-4. Storage 생성

```
Firebase Console → Storage → 시작하기
→ 기본 버킷 생성
```

### 9-5. 환경변수 적용

`.env` 파일에 `VITE_USE_MOCK=false` 로 변경 후 Firebase 설정값 입력:

```env
VITE_USE_MOCK=false
VITE_FIREBASE_API_KEY=복사한 apiKey
VITE_FIREBASE_AUTH_DOMAIN=복사한 authDomain
...
```

개발 서버를 **재시작**해야 환경변수가 적용됩니다.

---

## 10. 보안 규칙

### Firestore 보안 규칙

Firebase Console → Firestore → **규칙** 탭에 붙여넣기:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // 인증 여부 확인
    function isAuthenticated() {
      return request.auth != null;
    }

    // 관리자 여부 확인
    function isAdmin() {
      return isAuthenticated() &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // 사용자 문서: 본인 또는 관리자만 접근
    match /users/{uid} {
      allow read, write: if isAuthenticated() &&
        (request.auth.uid == uid || isAdmin());
    }

    // 시설: 인증된 사용자 읽기, 관리자만 쓰기
    match /facilities/{facilityId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }

    // 템플릿: 인증된 사용자 읽기, 관리자만 쓰기
    match /templates/{templateId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }

    // 점검: 인증된 사용자 읽기/생성, 본인 또는 관리자가 수정 (제출 후 수정 불가)
    match /inspections/{inspectionId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() &&
        (resource.data.inspectorId == request.auth.uid || isAdmin()) &&
        resource.data.status != 'submitted';
      allow delete: if isAdmin();
    }
  }
}
```

### Firebase Storage 보안 규칙

Firebase Console → Storage → **규칙** 탭:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /inspection-images/{inspectionId}/{fileName} {
      // 인증된 사용자만 읽기
      allow read: if request.auth != null;
      // 인증된 사용자, 파일 크기 10MB 이하만 업로드 허용
      allow write: if request.auth != null
        && request.resource.size < 10 * 1024 * 1024
        && request.resource.contentType.matches('image/.*');
    }
  }
}
```

---

## 11. 최초 관리자 계정 설정

Firebase Authentication에서 사용자를 생성한 후, Firestore의 `role` 필드를 `admin`으로 수동 설정해야 합니다.

### 절차

**1단계**: Firebase Console → Authentication → **사용자 추가**  
이메일과 비밀번호 입력 후 계정 생성

**2단계**: 앱에 해당 계정으로 **최초 로그인**  
시스템이 자동으로 Firestore `users` 컬렉션에 `inspector` 역할로 문서 생성

**3단계**: Firebase Console → Firestore → `users` 컬렉션  
해당 문서의 `role` 필드 값을 `admin`으로 **수동 변경**

**4단계**: 이후 신규 사용자 권한 변경은 **관리자 웹앱 내 사용자 관리** 화면에서 진행

---

## 12. Vercel 배포

### 자동 배포 설정

```
1. GitHub 저장소에 코드 push
2. vercel.com → Add New Project → GitHub 저장소 선택
3. Framework: Vite 자동 감지
4. Environment Variables 탭에서 .env 내용 동일하게 입력
   (VITE_USE_MOCK=false, Firebase 설정값 전체)
5. Deploy 클릭 → 자동 빌드 후 배포 완료
```

### 이후 배포

`main` 브랜치에 push 시 자동 재배포됩니다.

### 커스텀 도메인 연결 (선택)

```
Vercel 프로젝트 → Settings → Domains → 도메인 추가
```

---

## 13. Mock 모드 (개발용)

Firebase 설정 없이 UI와 기능을 즉시 확인할 수 있는 개발 전용 모드입니다.

### 활성화

`.env` 파일에서:

```env
VITE_USE_MOCK=true
```

### Mock 모드 특징

| 항목 | 내용 |
|---|---|
| 데이터 저장 방식 | 브라우저 메모리 (새로고침 시 초기화) |
| 기본 제공 데이터 | 시설 3개 / 템플릿 3개 / 점검 3건 |
| 사진 업로드 | 로컬 ObjectURL 사용 (실제 업로드 없음) |
| 권한 전환 | 우측 하단 플로팅 버튼으로 관리자 ↔ 점검자 즉시 전환 |

### Mock 로그인 계정

| 구분 | 이메일 | 역할 |
|---|---|---|
| 관리자 | admin@demo.com | 모든 기능 사용 |
| 점검자 | inspector@demo.com | 점검 수행 및 조회 |

> `inspector` 문자열이 포함된 이메일 입력 시 점검자로 로그인됩니다.  
> 비밀번호는 아무 값이나 입력해도 됩니다.

---

## 14. 향후 고도화 계획

### 기능 확장

- [ ] 점검 항목에 **사진 첨부 필수** 옵션 추가
- [ ] 점검 결과 **엑셀(XLSX) 내보내기**
- [ ] 관리자 대시보드 **월별 통계 차트** (Chart.js)
- [ ] 점검 완료 시 담당자 **이메일 자동 발송** (Firebase Functions)
- [ ] **푸시 알림**: 점검 기한 도래 시 알림 (FCM)
- [ ] QR 코드로 시설 즉시 선택 기능
- [ ] 오프라인 지원 (Service Worker + IndexedDB)

### 보안 강화

- [ ] Firebase App Check 적용 (봇·비인가 접근 차단)
- [ ] 감사 로그 (Admin이 수행한 변경 이력)
- [ ] 개인정보 마스킹 처리

### 인프라

- [ ] Firebase Emulator Suite 연동 (로컬 테스트 환경)
- [ ] GitHub Actions CI/CD 파이프라인 (자동 빌드·테스트)
- [ ] E2E 테스트 (Playwright)

---

## 라이선스

본 프로젝트는 내부 개발용 MVP이며, 공공기관 납품 시 별도 계약에 따릅니다.

---

*최종 업데이트: 2026년 2월*


