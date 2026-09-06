# 🍶 몽향 (Monghyang) - 프론트엔드 & 아키텍처 기술 명세서

> **전통주 이커머스, 양조장 탐방 및 체험 예약, 전통주 애호가 커뮤니티를 결합한 올인원 플랫폼**  
> 백엔드(Spring Boot / Redis / S3) 개발팀과 협업하여 실서버 연동, 2단계 결제 트랜잭션, 타임슬롯 예약, 세션 보안 파이프라인을 완성한 프로젝트입니다.

---

## 📌 목차
1. [프로젝트 소개 (Overview)](#-프로젝트-소개-overview)
2. [핵심 기능 명세 (Core Features)](#-핵심-기능-명세-core-features)
3. [전체 시스템 아키텍처 (Architecture & Data Flow)](#-전체-시스템-아키텍처-architecture--data-flow)
4. [💡 핵심 기술적 의사결정 및 대안 비교 (Why & Alternatives)](#-핵심-기술적-의사결정-및-대안-비교-why--alternatives)
   - [Decision 1. 프론트엔드 프레임워크 및 라우팅 전략](#decision-1-프론트엔드-프레임워크-및-라우팅-전략-nextjs-14--query-based-spa-hybrid)
   - [Decision 2. 전역 상태 관리: 경량 옵저버 패턴 인메모리 스토어 직접 구현](#decision-2-전역-상태-관리-경량-옵저버-패턴-인메모리-스토어-직접-구현-cartstore)
   - [Decision 3. 인증/보안: 커스텀 헤더 세션 프로토콜 및 동시접속 제어](#decision-3-인증보안-커스텀-헤더-세션-프로토콜-및-동시접속-제어-x-session-id)
   - [Decision 4. 계층형 권한 인가(RBAC) 모델 및 동적 UI 가드](#decision-4-계층형-권한-인가rbac-모델-및-동적-ui-가드)
   - [Decision 5. 대용량 미디어 처리: Canvas 기반 클라이언트 사전 리사이징 파이프라인](#decision-5-대용량-미디어-처리-canvas-기반-클라이언트-사전-리사이징-파이프라인)
   - [Decision 6. 결제 트랜잭션 무결성: 2-Phase Verification (Prepare & Approve)](#decision-6-결제-트랜잭션-무결성-2-phase-verification-prepare--approve)
   - [Decision 7. 백엔드(Spring Data JPA) 응답 데이터 정규화 어댑터 패턴](#decision-7-백엔드spring-data-jpa-응답-데이터-정규화-어댑터-패턴)
5. [🛠️ 백엔드 협업 중 발생한 주요 트러블슈팅 사례](#️-백엔드-협업-중-발생한-주요-트러블슈팅-사례)
6. [🚀 시작 가이드 (Getting Started)](#-시작-가이드-getting-started)
7. [🔮 향후 고도화 로드맵 (Roadmap)](#-향후-고도화-로드맵-roadmap)

---

## 📖 프로젝트 소개 (Overview)

**몽향(Monghyang)**은 대한민국 전통주의 문화적 가치를 조명하고, 소비자와 전국 각지의 양조장을 디지털로 긴밀하게 연결하는 통합 라이프스타일 플랫폼입니다.

- **전통주 쇼핑몰**: 탁주, 약주, 청주, 증류주, 과실주 등 다양한 전통주를 주종·도수·가격대별로 탐색하고 구매
- **양조장 탐방 & 체험 예약**: 양조장의 역사와 대표 주류를 탐색하고, 실시간 인터랙티브 캘린더를 통해 양조 체험 프로그램을 예약
- **전통주 커뮤니티**: 시음 후기, 양조장 방문기, 페어링 안주 추천 등 다채로운 주류 문화를 공유
- **멀티 롤(RBAC) 시스템**: 일반 회원, 전통주 판매자, 양조장 사업자, 총괄 관리자 등 역할별 차별화된 기능 제공

---

## ✨ 핵심 기능 명세 (Core Features)

| 도메인 | 주요 기능 | 프론트엔드-백엔드 연동 특징 |
| :--- | :--- | :--- |
| **인증/인가** | 회원가입(일반/판매자/양조장), 로그인, 세션 갱신 | `X-Session-Id` + `X-Refresh-Token` 헤더, 409 동시접속 제어, 401 자동 세션 리프레시 |
| **커머스** | 상품 검색/필터링, 장바구니, 주문/결제, 주문 취소 | Zero-dependency Observer Store(`CartStore`), 2단계 PG 결제(Prepare $\rightarrow$ Approve) |
| **양조장/체험** | 양조장 상세 정보, 실시간 캘린더 예약, 잔여석 관리 | 양조장-판매 상품 동적 체이닝 조회, 날짜/시간별 예약 가용성 실시간 검증 |
| **커뮤니티** | 게시글 작성/수정/삭제, 다중 이미지 업로드, 댓글/대댓글 | HTML5 Canvas 기반 클라이언트 사전 압축(80% 용량 절감), 무한 스크롤 페이징 |
| **권한 관리** | 4단계 역할 계층 가드(Admin > Brewery > Seller > User) | `withPermission` 선언적 권한 가드, 글래스모피즘 인터랙티브 커스텀 모달 |

---

## 🏛️ 전체 시스템 아키텍처 (Architecture & Data Flow)

### 시스템 상호작용 다이어그램

```mermaid
graph TD
    subgraph "Client Tier (Next.js 14 / TypeScript)"
        UI["사용자 인터페이스 (View / Components)"]
        CS["CartStore (Custom Observer Store)"]
        AC["Axios API Client + Interceptors"]
        IMG["Canvas Image Processor"]
    end

    subgraph "Authentication & Security"
        LS[("LocalStorage / SessionStorage")]
        SEC["Custom Header Guard (X-Session-Id)"]
    end

    subgraph "Backend Tier (Spring Boot / API Server)"
        AUTH["Auth Service (Redis Session)"]
        PROD["Product & Shop Service"]
        JOY["Brewery Experience Service (Joy)"]
        ORD["Order & PG Approval Service"]
        S3[("AWS S3 / Object Storage")]
    end

    UI -->|상태 구독 / 변경| CS
    UI -->|이미지 업로드 전 압축| IMG
    IMG -->|바이너리 Blob 전송| AC
    UI -->|API 호출| AC
    AC <-->|X-Session-Id / X-Refresh-Token| LS
    AC -->|401 감지 시 자동 토큰 갱신| AUTH
    AC -->|페이징 검색 / 필터링| PROD
    AC -->|캘린더 가용성 / 예약| JOY
    AC -->|2단계 결제 검증 (Prepare/Approve)| ORD
    AC -->|이미지 바이너리 전송| S3
```

### 기술 스택 명세

| 계층 | 기술 스택 | 선정 이유 요약 |
| :--- | :--- | :--- |
| **Framework** | Next.js 14 (App Router) | SEO 및 최적화 인프라 확보 + SPA 동적 렌더링 결합 |
| **Language** | TypeScript 5.3 | 런타임 오류 방지, 백엔드 DTO와의 철저한 타입 정합성 보장 |
| **State Management** | Custom Observer Store (CartStore) | 외부 라이브러리(Redux/Zustand) 없이 경량 옵저버 패턴 인메모리 스토어 직접 구현 |
| **HTTP Client** | Axios + Fetch API | 인터셉터 기반 세션 자동 갱신(Refresh) 및 409 동시 세션 제어 |
| **Media Pipeline** | HTML5 Canvas API + URL.createObjectURL | 브라우저 단 이미지 비손실/압축 리사이징 및 Blob 메모리 라이프사이클 관리 |
| **Styling & Icons** | Vanilla CSS + Lucide React | 순수 CSS 스타일링으로 번들 다이어트 및 한국 전통 무드 구현 |
| **Backend Integration** | Spring Boot (REST API, Redis, S3) | Multipart FormData, Custom Header Session, Spring PageResponse 정규화 |

---

## 💡 핵심 기술적 의사결정 및 대안 비교 (Why & Alternatives)

---

### Decision 1. 프론트엔드 프레임워크 및 라우팅 전략: Next.js 14 + Query-based SPA Hybrid

#### 1) 배경 및 요구사항
- 전통주 상품과 양조장 정보 특성상 장기적으로 검색엔진 최적화(SEO) 및 이미지/폰트 로딩 최적화 기반이 요구됨.
- 반면 개발 및 연동 단계에서는 화면 전환 시 글로벌 상태(장바구니 수량 배지, 헤더 로그인 상태, 모달 레이어)가 초기화되지 않고 매끄럽게 유지되어야 함.

#### 2) 고려했던 대안
1. **순수 React SPA (Vite / CRA)**
   - *장점*: 라우팅 및 번들 설정이 단순하며 클라이언트 상태 유지가 쉬움.
   - *한계*: 향후 SSR/SSG 확장 불가, 이미지 최적화 및 메타태그 관리 부재, 빌드 최적화 한계.
2. **Next.js 14 App Router의 완전한 다중 페이지 파일 라우팅 (`app/shop/page.tsx`, `app/brewery/page.tsx` 등)**
   - *장점*: Next.js 표준 디렉토리 라우팅 구조 준수.
   - *한계*: 백엔드 세션(`localStorage` 기반) 의존 컴포넌트들의 Hydration Mismatch 빈발, 잦은 페이지 이동 시 레이아웃 깜빡임 및 비동기 상태 재패칭 비용 발생.

#### 3) 최종 선택 및 이유
**Next.js 14 App Router + Query Parameter 기반 클라이언트 동적 뷰 스위칭 (`MainApp.tsx`) 채택**
- Next.js의 현대적인 컴파일 파이프라인(SWC)과 번들 최적화를 누리면서, 핵심 메인 뷰를 `dynamic(() => import('./MainApp'), { ssr: false })`로 감싸 **서버-클라이언트 간 수화 불일치(Hydration Mismatch)를 원천 차단**.
- `?view=shop`, `?view=brewery-detail&brewery=1` 형태의 URL Query Parameter를 상태 머신으로 삼아, 페이지 리로드 없이 고성능 SPA 경험을 제공함.
- 도메인 컴포넌트들이 완벽히 모듈화되어 있어 추후 언제든 개별 독립 라우트로 분리 확장이 용이함.

---

### Decision 2. 전역 상태 관리: 경량 옵저버 패턴 인메모리 스토어 직접 구현 (`CartStore`)

#### 1) 배경 및 요구사항
- 장바구니 수량(Cart Badge)은 상단 헤더, 네비게이션, 상품 목록, 상세 페이지, 장바구니 뷰 등 서비스 전역에서 실시간 동기화되어야 함.
- 백엔드 장바구니 API(`/api/cart`)와 로컬 UI 상태를 실시간으로 맞추어야 하며, 불필요한 서드파티 패키지 설치로 번들 사이즈가 비대해지는 것을 방지해야 함.

#### 2) 고려했던 대안
1. **Redux Toolkit (RTK)**: 상태 하나를 관리하기 위해 Action, Reducer, Slice, Provider 등 보일러플레이트가 너무 큼.
2. **Zustand / Recoil**: 훌륭한 상태 라이브러리이나 외부 패키지 의존성이 추가됨.
3. **React Context API**: Context 값이 변경될 때 Provider 하위의 불필요한 전체 컴포넌트 트리가 리렌더링되는 성능 저하(Re-render Waterfall) 발생.

#### 3) 최종 선택 및 이유
**순수 TypeScript 기반 경량 옵저버 패턴(Pub/Sub) 인메모리 스토어 (`CartStore.ts`) 직접 구현**
- **Zero Dependency**: 외부 라이브러리를 일절 추가하지 않아 번들 크기 0KB 추가.
- **정밀 리렌더링**: 구독자 목록(`cartListeners: (() => void)[]`)에 등록된 컴포넌트만 `notifyCartChange()` 시점에 선별적으로 리렌더링.
- **React 렌더 트리 독립성**: 일반 유틸리티 함수, Axios 인터셉터 등 React 컴포넌트 바깥에서도 자유롭게 스토어를 조작 및 조회 가능.

```typescript
// components/Cart/CartStore.ts 핵심 구현
export interface CartItem {
  cart_id: number;
  product: ProductWithDetails;
  selectedOptionId: number;
  quantity: number;
  maxQuantity: number;
}

let globalCartItems: CartItem[] = [];
let cartListeners: (() => void)[] = [];

const notifyCartChange = () => {
  cartListeners.forEach(listener => listener());
};

export const subscribeToCart = (listener: () => void) => {
  cartListeners.push(listener);
  return () => {
    const index = cartListeners.indexOf(listener);
    if (index > -1) cartListeners.splice(index, 1);
  };
};

export const getCartItems = () => [...globalCartItems];
export const getCartItemCount = () => globalCartItems.reduce((total, item) => total + item.quantity, 0);
```

---

### Decision 3. 인증/보안: 커스텀 헤더 세션 프로토콜 및 동시접속 제어 (`X-Session-Id`)

#### 1) 배경 및 요구사항
- 백엔드가 Redis 기반의 분산 세션 스토리지를 운용하고 있으며, **다중 기기 로그인 통제(동시 접속 제한)**와 즉각적인 세션 만료 제어가 필수적이었음.
- 프론트엔드와 백엔드가 서로 다른 도메인/포트 환경(Cross-Origin)에서 구동될 때 발생할 수 있는 브라우저 서드파티 쿠키 제약(SameSite, Safari ITP 등)을 극복해야 함.

#### 2) 고려했던 대안
1. **표준 JWT Bearer 토큰 (Local Storage)**: JWT는 자체적으로 Stateless하여, 다른 기기에서 새로 로그인했을 때 기존 기기 세션을 즉각 무효화시키는 동시 세션 제어가 불가능함.
2. **순수 HttpOnly 쿠키 세션**: 서브도메인 간 쿠키 공유 이슈 및 모바일 웹뷰 연동 시 쿠키 유실 위험, CSRF 공격 대비 토큰 관리 필요.

#### 3) 최종 선택 및 이유
**Custom Header (`X-Session-Id` + `X-Refresh-Token`) + Axios Interceptor 2중 안전장치 채택**
- **동시 로그인 통제 (409 Conflict)**: 다른 기기에서 로그인 시 백엔드가 409 상태코드를 반환하고, 클라이언트는 즉시 이를 감지하여 알림 후 세션을 안전하게 정리.
- **투명한 세션 갱신 (Transparent Refresh)**: 일반 API 호출 도중 세션이 만료되어 401 에러를 받으면, Axios Response Interceptor가 가로채 `/api/auth/refresh`를 호출하고, 성공 시 실패했던 원래 요청(`originalRequest._retry`)을 자동으로 재시도하여 사용자의 작업 흐름을 끊지 않음.

```typescript
// utils/api.ts: 401 세션 자동 재시도 및 409 동시접속 제어
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshed = await refreshSession();
        if (refreshed) return apiClient(originalRequest);
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = '/?view=login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
```

---

### Decision 4. 계층형 권한 인가(RBAC) 모델 및 동적 UI 가드

#### 1) 배경 및 설계
- 플랫폼 내에 `ROLE_USER`(일반 고객), `ROLE_SELLER`(전통주 판매자), `ROLE_BREWERY`(양조장 대표), `ROLE_ADMIN`(플랫폼 관리자) 등 4단계 이상의 계층형 권한이 존재.
- 단순 일치 비교(`role === 'ROLE_SELLER'`)만 할 경우 상위 관리자가 하위 기능을 테스트하거나 관리할 수 없는 문제 발생.

#### 2) 가중치 모델 및 고차 권한 함수
```typescript
// utils/authUtils.ts
const ROLE_HIERARCHY: Record<UserRole, number> = {
  ROLE_ADMIN: 4,
  ROLE_BREWERY: 3,
  ROLE_SELLER: 2,
  ROLE_USER: 1,
};

export const hasRole = (requiredRole: UserRole): boolean => {
  const currentRole = getCurrentUserRole();
  return currentRole ? ROLE_HIERARCHY[currentRole] >= ROLE_HIERARCHY[requiredRole] : false;
};

// 선언적 권한 가드
export const withPermission = <T>(
  requiredRole: UserRole,
  action: () => T,
  onDenied?: () => void
): T | null => {
  if (hasRole(requiredRole)) return action();
  if (onDenied) onDenied();
  else showPermissionDeniedAlert(requiredRole);
  return null;
};
```
- 권한 부족 시 브라우저 기본 경고창 대신 고급 글래스모피즘(Glassmorphism) 스타일의 커스텀 인터랙티브 모달 UI(`showCustomConfirm`)를 띄워 사용자 경험을 극대화함.

---

### Decision 5. 대용량 미디어 처리: Canvas 기반 클라이언트 사전 리사이징 파이프라인

#### 1) 배경 및 요구사항
- 양조장 전경 사진, 고화질 전통주 제품 사진, 커뮤니티 후기 사진은 스마트폰으로 촬영 시 장당 10MB~20MB에 이름.
- 원본 그대로 서버에 전송하면 모바일 환경에서 업로드 속도가 현저히 느려지고, 서버의 네트워크 I/O 및 S3 비용이 기하급수적으로 증가함.

#### 2) 고려했던 대안
1. **서버 사이드 전량 리사이징 (Spring Boot + AWS Lambda)**: 서버 전송 시간 자체는 줄어들지 않으며, 대용량 파일 업로드 도중 네트워크 타임아웃 위험 상존.
2. **외부 유료 이미지 CDN / SaaS (Cloudinary 등)**: 추가 비용 발생 및 서드파티 의존도 심화.

#### 3) 최종 선택 및 이유
**HTML5 Canvas API를 활용한 클라이언트 사전 압축 및 리사이징 (`resizeImage`) 채택**
- 브라우저 메모리 상에서 이미지를 적정 해상도(Max Width/Height)로 비율 유지 다운스케일링 및 품질 압축(0.8) 후 Blob으로 변환.
- **업로드 페이로드 크기를 80~90% 이상 절감**하여 사용자 체감 업로드 속도를 비약적으로 향상시키고 백엔드 처리 부담을 최소화함.
- `URL.createObjectURL`로 즉각적인 미리보기를 제공하고, 작업 완료 시 `revokeObjectURL`을 호출하여 브라우저 메모리 누수를 원천 방지함.

---

### Decision 6. 결제 트랜잭션 무결성: 2-Phase Verification (Prepare & Approve)

#### 1) 배경 및 요구사항
- 커머스 및 양조장 체험 예약 결제에서 클라이언트 측의 악의적인 결제 금액 위변조, 재고 부족 상태에서의 결제 시도, 네트워크 단절로 인한 승인 누락 방지.

#### 2) 2단계 결제 프로세스
1. **1단계 - 주문 준비 (`/api/orders/prepare` or `/api/joy-order/prepare`)**:
   - 클라이언트는 장바구니 상품 ID 목록과 배송지 정보를 서버로 전송.
   - 서버는 데이터베이스 상의 실제 상품 가격과 재고를 조회하여 총 금액을 계산하고, 고유 주문 식별자(`pgOrderId`)를 발급. (클라이언트 전달 금액 불신뢰 원칙)
2. **2단계 - 결제 승인 요청 (`/api/orders/request` or `/api/joy-order/request`)**:
   - PG 결제 모듈 성공 후 반환된 `pg_order_id`, `pg_payment_key`, `total_amount`를 서버로 전송하여 백엔드가 PG사 서버와 직접 최종 검증 및 승인을 체결함.

---

### Decision 7. 백엔드(Spring Data JPA) 응답 데이터 정규화 어댑터 패턴

#### 1) 배경 및 문제
- 백엔드(Spring Data JPA)의 페이징 응답 객체(`Page<T>`)는 중첩 구조(`pageable`, `sort`, `numberOfElements`, `first`, `last` 등)를 지니며, 엔드포인트마다 스네이크 케이스(`page_size`)와 카멜 케이스(`pageSize`)가 혼용될 가능성이 존재함.

#### 2) 해결: Data Normalization Adapter
- `shopApi.ts`, `communityApi.ts` 등에 `normalizePageResponse<T>` 및 `createEmptyPageResponse<T>` 함수를 구축.
- 백엔드 응답의 프로퍼티 네이밍 변동에도 프론트엔드 UI 컴포넌트가 깨지지 않고 안전한 기본값을 유지하도록 방어적 어댑터 레이어 구축.

---

## 🛠️ 백엔드 협업 중 발생한 주요 트러블슈팅 사례

### 트러블슈팅 1: Axios의 FormData 전송 시 Multipart Boundary 누락 문제
- **문제 현상**: 파일과 폼 데이터를 함께 보낼 때 서버에서 400 Bad Request 또는 `Current request is not a multipart request` 에러 발생.
- **원인 분석**: 프론트엔드 코드에서 `headers: { 'Content-Type': 'multipart/form-data' }`를 수동으로 명시하면서, 브라우저가 자동으로 생성해야 하는 고유 구분자(`boundary=----WebKitFormBoundary...`)가 누락됨.
- **해결 방안**: 수동 Content-Type 지정을 완전히 제거하고 Axios가 `FormData` 인스턴스를 감지하여 자동으로 올바른 Boundary를 생성하도록 수정 (`orderApi.ts`, `imageUpload.ts`).

### 트러블슈팅 2: Spring Boot `@ModelAttribute` 배열 바인딩 처리
- **문제 현상**: 주문 준비 시 여러 개의 장바구니 ID(`cart_id`)를 배열로 보낼 때 백엔드에서 리스트로 수신하지 못하는 현상.
- **원인 분석**: `formData.append('cart_id', [1, 2, 3])`로 전송 시 문자열 `"1,2,3"`으로 전송되어 Spring의 `List<Long> cartId`에 타입 불일치 발생.
- **해결 방안**: 동일한 키 이름(`cart_id`)으로 배열 요소를 반복 `append`하도록 구현하여 백엔드 컬렉션 매핑 성공.
  ```typescript
  if (data.cart_id && data.cart_id.length > 0) {
    data.cart_id.forEach((id) => {
      formData.append('cart_id', String(id));
    });
  }
  ```

### 트러블슈팅 3: 양조장 상세와 해당 양조장 등록 상품의 동적 교차 바인딩
- **문제 현상**: 양조장 상세 페이지에서 해당 양조장이 판매하는 실제 전통주 상품 목록이 함께 노출되어야 하나, 양조장 조회 API와 상품 조회 API가 분리되어 있음.
- **해결 방안**: `MainApp.tsx`에서 양조장 상세(`getBreweryById`) 조회 완료 후 양조장의 `users_id`를 획득하여 상품 검색 API(`getProductsByUserId(users_id)`)를 체이닝 호출하고, 두 비동기 응답을 `selectedBrewery`와 `breweryProducts` 상태로 결합하여 렌더링.

---

## 🚀 시작 가이드 (Getting Started)

### 환경 변수 설정 (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://your-backend-api-server:port
```

### 설치 및 로컬 실행
```bash
# 의존성 패키지 설치
npm install

# 개발 서버 실행 (기본 포트: 3000)
npm run dev

# 프로덕션 빌드 및 실행
npm run build
npm run start
```

---

## 🔮 향후 고도화 로드맵 (Roadmap)

1. **Next.js App Router 파일 시스템 라우팅으로의 점진적 마이그레이션**:
   - 현재 안정화된 도메인 컴포넌트들을 바탕으로 `/shop/[id]`, `/brewery/[id]` 등 개별 라우트로 점진적 분리하여 개별 페이지별 OpenGraph 메타데이터 및 SEO 극대화.
2. **TanStack Query (React Query) 도입 검토**:
   - 현재 구현된 Custom Cache/API 로직을 기반으로, 서버 상태의 캐싱 수명(staleTime, cacheTime)과 낙관적 업데이트(Optimistic Update)를 표준화된 훅으로 고도화.
3. **PWA (Progressive Web App) 지원**:
   - 양조장 현장 방문객 및 체험 예약자들을 위한 모바일 오프라인 티켓 확인 및 푸시 알림 연동.

---
*작성일: 2026년 9월 6일*  
*작성자: 몽향(Monghyang) 프론트엔드 개발팀*
