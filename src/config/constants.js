// ✅ 파일: src/config/constants.js
//
// ✅ 이번 수정의 핵심 (P0 프론트 안정화)
// 1) "토큰 저장 키" 단일화: AUTH_KEY.TOKEN  (= "accessToken")
// 2) URL은 절대 URL 유지 + PATH 별도 제공 (점진 마이그레이션)
// 3) Vite env 이름 통일: VITE_API_BASE_URL 우선, 없으면 VITE_API_BASE, 없으면 localhost
// 4) STORAGE_KEY.ACCESS_TOKEN과 AUTH_KEY.TOKEN 동일하게 유지
// 5) ROUTE/FLASH/기타는 그대로 유지
// 6) (추가) axios 단일 진입점(apiClient)에서 쓰기 좋은 상수 추가:
//    - AUTH_EVENT (window 이벤트 이름 통일)
//    - HTTP_STATUS (가독성)
//    - API_TIMEOUT_MS (옵션)
//
// ===========================================================
// ✅ (P3 수정) 소셜 로그인 확장(카카오) + 닉네임 환영 토스트
// - OAuth2Redirect에서 FLASH.GOOGLE_LOGIN_OK를 쓰지 말고
//   ✅ FLASH.SOCIAL_LOGIN_OK 하나로 통일해서 소셜 공통 처리
// - displayName(닉네임)은 "일회성 토스트"에만 쓰므로 sessionStorage에 임시 저장 권장
// - 저장 키는 constants로 통일: STORAGE_KEY.OAUTH2_DISPLAY_NAME
// ===========================================================

/**
 * ✅ 백엔드 API Base (Spring)
 * - 기본: http://localhost:8080
 */
export const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_BASE ||
  "http://localhost:8080";

/**
 * ✅ 프론트 Base (React)
 * - 카카오/구글 OAuth2 성공 후 백엔드가 redirect할 "프론트 주소"
 * - 예: http://localhost:9191
 *
 * ⚠️ Vite에서 포트가 바뀔 수 있으니 env로도 열어둔다:
 * - VITE_FRONT_BASE_URL=http://localhost:9191
 */
export const FRONT_BASE =
  import.meta.env.VITE_FRONT_BASE_URL || "http://localhost:9191";

// ✅ (선택) axios 기본 타임아웃(ms)
export const API_TIMEOUT_MS = 10000;

/**
 * ✅ PATH 모음 (apiClient 권장 방식)
 * - apiClient.post(PATH.AUTH_LOGIN, payload)
 */
export const PATH = {
  // Auth
  AUTH_SIGNUP: "/api/auth/signup",
  AUTH_LOGIN: "/api/auth/login",
  AUTH_FIND_USERNAME: "/api/auth/find-username",
  AUTH_VERIFY_USER: "/api/auth/verify-user",
  AUTH_RESET_PASSWORD: "/api/auth/reset-password",

  // ✅ (P1) 회원가입 이메일 인증
  EMAIL_SEND: "/api/auth/email/send",
  EMAIL_VERIFY: "/api/auth/email/verify",

  // ✅ (선택) status API를 만들었을 때만 사용(안 만들면 프론트에서 호출 금지)
  EMAIL_STATUS: "/api/auth/email/status",

  // ✅ (P1) 실시간 중복 체크 (username/email)
  // - 백엔드에서 permitAll 권장(회원가입 전 단계)
  AUTH_CHECK_USERNAME: "/api/auth/check-username",
  AUTH_CHECK_EMAIL: "/api/auth/check-email",

  // Users
  USERS: "/api/users",
  ME: "/api/users/me",

  // OAuth2 (백엔드 시작 URL)
  OAUTH2_GOOGLE_AUTH: "/oauth2/authorization/google",
  OAUTH2_KAKAO_AUTH: "/oauth2/authorization/kakao",
  // OAUTH2_NAVER_AUTH: "/oauth2/authorization/naver",

  // OAuth2 Link Flow (백엔드 API)
  OAUTH2_LINK_PASSWORD: "/api/oauth2/link/password",
  OAUTH2_OTP_SEND: "/api/oauth2/link/otp/send",
  OAUTH2_OTP_VERIFY: "/api/oauth2/link/otp/verify",
  OAUTH2_CONTINUE_NEW: "/api/oauth2/continue-new",
};

/**
 * ✅ URL(절대경로) 모음 (기존 axios 코드 호환)
 * - axios.post(URL.AUTH_LOGIN, ...)
 * - window.location.href = URL.OAUTH2_GOOGLE_AUTH
 */
export const URL = {
  // Auth
  AUTH_SIGNUP: `${API_BASE}${PATH.AUTH_SIGNUP}`,
  AUTH_LOGIN: `${API_BASE}${PATH.AUTH_LOGIN}`,
  AUTH_FIND_USERNAME: `${API_BASE}${PATH.AUTH_FIND_USERNAME}`,
  AUTH_VERIFY_USER: `${API_BASE}${PATH.AUTH_VERIFY_USER}`,
  AUTH_RESET_PASSWORD: `${API_BASE}${PATH.AUTH_RESET_PASSWORD}`,

  // ✅ (P1) 회원가입 이메일 인증
  EMAIL_SEND: `${API_BASE}${PATH.EMAIL_SEND}`,
  EMAIL_VERIFY: `${API_BASE}${PATH.EMAIL_VERIFY}`,

  // ✅ (선택) status API를 "실제로 만들었을 때만" 사용 권장
  EMAIL_STATUS: `${API_BASE}${PATH.EMAIL_STATUS}`,

  // ✅ (P1) 실시간 중복 체크
  AUTH_CHECK_USERNAME: `${API_BASE}${PATH.AUTH_CHECK_USERNAME}`,
  AUTH_CHECK_EMAIL: `${API_BASE}${PATH.AUTH_CHECK_EMAIL}`,

  // Users
  USERS: `${API_BASE}${PATH.USERS}`,
  ME: `${API_BASE}${PATH.ME}`,

  // OAuth2 (백엔드 시작 URL)
  OAUTH2_GOOGLE_AUTH: `${API_BASE}${PATH.OAUTH2_GOOGLE_AUTH}`,
  OAUTH2_KAKAO_AUTH: `${API_BASE}${PATH.OAUTH2_KAKAO_AUTH}`,
  // OAUTH2_NAVER_AUTH: `${API_BASE}${PATH.OAUTH2_NAVER_AUTH}`,

  // OAuth2 Link Flow
  OAUTH2_LINK_PASSWORD: `${API_BASE}${PATH.OAUTH2_LINK_PASSWORD}`,
  OAUTH2_OTP_SEND: `${API_BASE}${PATH.OAUTH2_OTP_SEND}`,
  OAUTH2_OTP_VERIFY: `${API_BASE}${PATH.OAUTH2_OTP_VERIFY}`,
  OAUTH2_CONTINUE_NEW: `${API_BASE}${PATH.OAUTH2_CONTINUE_NEW}`,

  /**
   * ✅ 프론트 redirect 절대 URL (백엔드 app.oauth2.redirect-base에 넣을 값)
   * - 예: http://localhost:9191/oauth2/redirect
   *
   * ⚠️ API_BASE(8080)가 아니라 FRONT_BASE(9191) 기반이어야 함!
   */
  FRONT_OAUTH2_REDIRECT: `${FRONT_BASE}/oauth2/redirect`,
};

/**
 * ✅ 인증 저장 키 (단일화)
 * - apiClient는 AUTH_KEY.TOKEN을 읽는다.
 */
export const AUTH_KEY = {
  USERNAME: "username",
  PASSWORD: "password",

  // ✅ 우리 서비스 JWT 저장 키 (단일화 핵심)
  TOKEN: "accessToken",
};

/**
 * ✅ 보관 키 모음(호환용)
 * - 토큰은 AUTH_KEY.TOKEN을 정식으로 사용
 */
export const STORAGE_KEY = {
  ACCESS_TOKEN: AUTH_KEY.TOKEN,

  // ✅ 소셜 로그인 성공 후, 연결 필요할 때 받는 임시 토큰
  SOCIAL_TEMP_TOKEN: "socialTempToken",

  // ✅ (P3) 소셜 표시이름(닉네임/이름) 저장 키 (선택: "연결 화면"에서 안내용으로 쓸 때)
  SOCIAL_DISPLAY_NAME: "socialDisplayName",

  // ✅ (P3) ✅ OAuth2Redirect → Home 토스트 1회 노출용 임시 표시 이름(닉네임)
  // - sessionStorage에 저장해서 1회 사용 후 삭제하는 흐름 권장
  OAUTH2_DISPLAY_NAME: "OAUTH2_DISPLAY_NAME",

  // ✅ 호환용
  USERNAME: AUTH_KEY.USERNAME,

  // ✅ (P1) 아이디 저장(편의 기능) 전용 키
  // - 로그인 상태 판단에는 절대 사용하지 말 것(AuthRoute는 token만 보게)
  SAVED_USERNAME: "savedUsername",
};

// ✅ "한 번만 보여줄 토스트" 플래그 키/값 (sessionStorage 사용 권장)
export const FLASH_KEY = {
  TOAST: "FLASH_TOAST",
};

// ✅ FLASH_TOAST 값들
export const FLASH = {
  // ⚠️ (구형 호환) 예전 홈/로직이 이 값을 참조하는 경우가 있을 수 있음
  // - 신규 소셜 로그인 플로우에서는 SOCIAL_LOGIN_OK를 사용 권장
  GOOGLE_LOGIN_OK: "GOOGLE_LOGIN_OK",

  // ✅ (권장) 구글/카카오/네이버 공통 "소셜 로그인 성공" 토스트
  SOCIAL_LOGIN_OK: "SOCIAL_LOGIN_OK",

  LINK_REQUIRED: "LINK_REQUIRED",
  LINK_OK: "LINK_OK",

  // ✅ apiClient의 pickSessionFlash()에서 쓰는 값들 (P0 UX 품질 업)
  SESSION_EXPIRED: "SESSION_EXPIRED",
  SESSION_INVALID: "SESSION_INVALID",

  // ✅ fallback
  OAUTH2_FALLBACK: "OAUTH2_FALLBACK",
};

// ✅ 라우트 문자열(오타 방지용)
export const ROUTE = {
  HOME: "/",
  LOGIN: "/login",

  // ✅ 백엔드가 프론트로 리다이렉트 시켜줄 전용 페이지
  OAUTH2_REDIRECT: "/oauth2/redirect",

  // ✅ 계정 연결 페이지
  LINK_ACCOUNT: "/link-account",
};

// ✅ (추가) axios 공통 처리에서 사용할 window 이벤트 이름 통일
export const AUTH_EVENT = {
  EXPIRED: "auth:expired",
  UNAUTHORIZED: "auth:unauthorized",
  FORBIDDEN: "auth:forbidden",
  CONFLICT: "req:conflict",
};

// ✅ (추가) HTTP status 상수 (가독성)
export const HTTP_STATUS = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  CONFLICT: 409,
  BAD_REQUEST: 400,
  INTERNAL_SERVER_ERROR: 500,
};

// ✅ USERS reducer action
export const USERS = {
  ALL: "all",
  LOGIN: "login",
  LOGOUT: "logout",
  LIKES: "likes",
};

// ✅ BBS reducer action
export const BBS = {
  ALL: "all",
  WRITE: "write",
  DELETE: "delete",
  TOTALSIZE: "totalsize",
  NOWPAGE: "nowpage",
};

// ✅ 🔥 BBS 페이징 설정 (List.jsx에서 사용 중)
export const BBS_PAGING = {
  PAGESIZE: 2,
  BLOCKPAGE: 3,
};
