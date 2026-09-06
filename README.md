# 🍶 몽향 (Monghyang) - 프론트엔드

> **전통주 이커머스, 양조장 탐방 및 체험 예약, 전통주 애호가 커뮤니티를 결합한 올인원 플랫폼**  
> 백엔드(Spring Boot) 개발팀과 협업하여 실서버 연동 및 결제·예약·인증 파이프라인을 완성한 프로젝트입니다.

---

## 📌 목차
1. [프로젝트 소개](#-프로젝트-소개)
2. [핵심 기능](#-핵심-기능)
3. [기술 스택 & 아키텍처](#-기술-스택--아키텍처)
4. [💡 핵심 기술적 의사결정 (Why & Alternatives)](#-핵심-기술적-의사결정-why--alternatives)
5. [🛠️ 백엔드 협업 & 트러블슈팅 사례](#️-백엔드-협업--트러블슈팅-사례)
6. [시작 가이드](#-시작-가이드)

---

## 📖 프로젝트 소개

**몽향(Monghyang)**은 한국 전통주의 가치를 조명하고 소비자와 양조장을 긴밀하게 연결하는 플랫폼입니다.
- **전통주 쇼핑몰**: 주종(탁주, 약주, 청주, 증류주 등), 도수, 가격대별 필터링 및 2단계 무결성 결제 시스템
- **양조장 탐방 & 체험 예약**: 전국 양조장 상세 정보와 연계 상품 탐색, 실시간 캘린더 기반 체험 예약
- **커뮤니티**: 전통주 시음 후기, 양조장 방문기, 다중 이미지 첨부 및 실시간 댓글 소통
- **멀티 롤(RBAC) 시스템**: 일반 회원, 전통주 판매자, 양조장 사업자, 관리자 권한 분리

---

## ✨ 핵심 기능

| 도메인 | 주요 기능 | 연동 특징 |
| :--- | :--- | :--- |
| **인증/인가** | 회원가입(일반/판매자/양조장), 로그인, 세션 유지 | 커스텀 헤더(`X-Session-Id`, `X-Refresh-Token`), 409 동시접속 제어 |
| **커머스** | 상품 검색/필터링, 장바구니, 주문 결제, 주문 내역 | In-Memory Observer Store, 2단계 PG 결제(Prepare $\rightarrow$ Approve) |
| **양조장/체험** | 양조장 상세 정보, 실시간 캘린더 예약, 타임슬롯별 정원 잔여석 확인 | 양조장-판매 상품 동적 체이닝 조회, 날짜/시간별 예약 가용성 검증 |
| **커뮤니티** | 게시글 작성/수정/삭제, 이미지 업로드, 댓글/대댓글, 좋아요 | Canvas 클라이언트 이미지 압축(용량 80% 절감), 무한 페이징 |
| **권한 관리** | 4단계 역할 계층 가드(Admin > Brewery > Seller > User) | `withPermission` HOC 가드, 커스텀 Glassmorphism 모달 |

---

## 🏛️ 기술 스택 & 아키텍처

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

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.3
- **State Management**: Custom Observer Pattern Store (CartStore)
- **HTTP Client**: Axios, Fetch API (Custom Interceptors)
- **Styling**: Vanilla CSS, CSS Modules (한국 전통 무드의 깔끔한 반응형 UI)
- **Icons**: Lucide React

---

## 💡 핵심 기술적 의사결정 (Why & Alternatives)

### 1. 프레임워크 & 렌더링 전략: Next.js 14 + Query-based SPA Hybrid
- **고려했던 대안**: 순수 React SPA (Vite/CRA) vs Next.js 전통적 Multi-page 파일 라우팅
- **선택 이유**:
  - 장기적인 SEO 최적화 인프라와 Next.js 번들 파이프라인(SWC)의 이점을 취함.
  - 동시에 잦은 탭 전환 시 헤더, 장바구니 배지, 모달 등 글로벌 상태가 초기화되지 않도록 메인 뷰 스위칭을 Query Parameter(`?view=...`) + `dynamic(ssr: false)`로 제어하여 **서버-클라이언트 간 Hydration Mismatch를 원천 방지**.

### 2. 전역 상태 관리: Custom Observer Pattern (Pub/Sub) Store
- **고려했던 대안**: Redux Toolkit vs Zustand vs React Context API
- **선택 이유**:
  - **Zero Dependency (번들 0KB)**: 단일 기능 상태 관리를 위해 거대한 라이브러리를 추가하지 않음.
  - **Re-render 병목 방지**: Context API처럼 하위 트리 전체가 다시 그려지지 않고, `subscribeToCart`에 등록된 컴포넌트만 정밀 렌더링.
  - **React 렌더 트리 독립성**: 일반 유틸리티 함수나 Axios 인터셉터 등 React 컴포넌트 바깥에서도 자유롭게 스토어를 조작 및 조회 가능.

### 3. 인증/보안: Custom Header Session & Axios Interceptor
- **고려했던 대안**: 표준 JWT Bearer Token vs 순수 HttpOnly Cookie
- **선택 이유**:
  - 백엔드 Redis 분산 세션 아키텍처와 연계하여 **다중 기기 동시 접속 차단(409 Conflict)** 로직을 즉각 감지.
  - 일반 API 통신 중 401(Unauthorized) 수신 시 Axios Interceptor가 백그라운드에서 `/api/auth/refresh`를 수행하고, 실패했던 원래 요청(`originalRequest._retry`)을 자동으로 재시도하여 사용자 경험을 단절 없이 유지.

### 4. 미디어 파이프라인: HTML5 Canvas 기반 클라이언트 사전 리사이징
- **고려했던 대안**: 서버 사이드 전량 리사이징 vs 유료 서드파티 CDN
- **선택 이유**:
  - 고화질 양조장/제품 사진(장당 10~20MB)을 브라우저 메모리 상에서 가로세로 비율 유지 및 0.8 품질로 다운스케일링.
  - **네트워크 전송 용량을 80~90% 절감**하여 모바일 환경 업로드 속도를 극대화하고 백엔드 I/O 및 S3 비용을 대폭 절감.
  - `URL.createObjectURL`로 즉시 미리보기를 제공하며, `revokeObjectURL`을 통해 브라우저 메모리 누수를 철저히 방어.

### 5. 커머스 결제 무결성: 2-Phase Verification (Prepare $\rightarrow$ Approve)
- **고려했던 대안**: 클라이언트 단일 결제 완료 호출
- **선택 이유**:
  - 1단계 주문 준비(`/api/orders/prepare`): 서버가 DB 상의 실시간 가격과 재고를 기준으로 총액과 `pgOrderId`를 확정(클라이언트 전달 금액 불신뢰).
  - 2단계 결제 승인(`/api/orders/request`): PG사 결제 승인 키를 서버로 전달해 백엔드가 PG사와 직접 최종 검증을 완료하여 결제 위변조 원천 방지.

---

## 🛠️ 백엔드 협업 & 트러블슈팅 사례

1. **Axios FormData 전송 시 Multipart Boundary 누락 해결**
   - *현상*: 파일 업로드 시 400 Bad Request 또는 `Not a multipart request` 오류 발생.
   - *원인*: 수동으로 `headers: { 'Content-Type': 'multipart/form-data' }`를 지정해 브라우저 고유 구분자(`boundary`)가 누락됨.
   - *해결*: 수동 헤더를 제거하고 Axios가 `FormData` 인스턴스를 감지하여 자동으로 Boundary를 형성하도록 수정.
2. **Spring Boot `@ModelAttribute` 다중 배열 매핑**
   - *현상*: 주문 준비 시 복수 장바구니 ID(`cart_id`) 전달 시 배열 파싱 실패.
   - *원인*: 단일 키에 콤마 구분자로 전송 시 Spring의 `List<Long>` 타입 불일치.
   - *해결*: 동일한 키(`cart_id`)로 각 ID를 개별 반복 `append`하도록 구현.
3. **양조장 상세와 해당 양조장 등록 상품의 동적 교차 바인딩**
   - *해결*: `getBreweryById` 완료 후 해당 양조장의 `users_id`를 추출하여 `getProductsByUserId`를 체이닝 호출, 두 독립된 도메인 API 데이터를 화면에 매끄럽게 결합 렌더링.

---

## 🚀 시작 가이드

### 환경 변수 설정 (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://your-backend-api-server:port
```

### 설치 및 실행
```bash
# 의존성 패키지 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
npm run start
```

---

📄 **더 자세한 기술 분석 내용은 [TECHNICAL_DECISIONS.md](./TECHNICAL_DECISIONS.md)를 참고해 주세요.**
