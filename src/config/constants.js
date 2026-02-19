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
// ✅ (P3 수정) 소셜 로그인 확장(카카오/네이버) + 닉네임 환영 토스트
// - OAuth2Redirect에서 FLASH.GOOGLE_LOGIN_OK를 쓰지 말고
//   ✅ FLASH.SOCIAL_LOGIN_OK 하나로 통일해서 소셜 공통 처리
// - displayName(닉네임)은 "일회성 토스트"에만 쓰므로 sessionStorage에 임시 저장 권장
// - 저장 키는 constants로 통일: STORAGE_KEY.OAUTH2_DISPLAY_NAME
// - ✅ 네이버는 force=1을 붙여 재로그인/재동의를 최대한 유도
//   (백엔드에서 force=1 감지 → auth_type=reauthenticate/reprompt 붙이는 구조)
//
// ===========================================================
// ✅ (추가) 카카오 로그인 화면 "무조건" 띄우기
// - 카카오는 기존 세션이 있으면 자동 통과가 발생할 수 있음
// - OAuth2 Authorization 요청에 ✅ prompt=login 을 붙이면
//   "항상 카카오 로그인 화면"을 띄우도록 유도할 수 있음
// - 따라서 PATH.OAUTH2_KAKAO_AUTH에 ?prompt=login 을 기본으로 붙인다.
// ===========================================================
//
// ✅ (P3-2 추가) 네이버 로그인 확인 페이지
// - 네이버 로그인 성공 직후 JWT를 바로 localStorage에 저장하지 않고,
//   sessionStorage에 "pending"으로 임시 저장 → /oauth2/confirm 에서 확정 저장
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
 * - 카카오/구글/네이버 OAuth2 성공 후 백엔드가 redirect할 "프론트 주소"
 * - 예: http://localhost:9191
 */
export const FRONT_BASE =
  import.meta.env.VITE_FRONT_BASE_URL || "http://localhost:9191";

// ✅ (선택) axios 기본 타임아웃(ms)
export const API_TIMEOUT_MS = 10000;

/**
 * ===========================================================
 * ✅ PATH (상대경로)
 * ===========================================================
 */
export const PATH = {
  // Auth
  AUTH_SIGNUP: "/api/auth/signup",
  AUTH_LOGIN: "/api/auth/login",
  AUTH_FIND_USERNAME: "/api/auth/find-username",
  AUTH_VERIFY_USER: "/api/auth/verify-user",
  AUTH_RESET_PASSWORD: "/api/auth/reset-password",

  // (P1) 회원가입 이메일 인증
  EMAIL_SEND: "/api/auth/email/send",
  EMAIL_VERIFY: "/api/auth/email/verify",
  EMAIL_STATUS: "/api/auth/email/status",

  // (P1) 실시간 중복 체크
  AUTH_CHECK_USERNAME: "/api/auth/check-username",
  AUTH_CHECK_EMAIL: "/api/auth/check-email",

  // Users
  USERS: "/api/users",
  ME: "/api/users/me",

  // OAuth2 시작 URL
  OAUTH2_GOOGLE_AUTH: "/oauth2/authorization/google",

  // ✅ 카카오: 항상 로그인 화면 보여주기(자동 통과 방지)
  // - prompt=login : 기존 카카오 세션이 있어도 로그인 화면을 다시 띄우도록 유도
  // - 만약 나중에 "기본은 자동통과 허용, 특정 버튼만 강제"로 가고 싶으면
  //   여기서는 /oauth2/authorization/kakao 만 두고,
  //   Login.jsx에서 ?prompt=login 을 붙이는 방식으로 분기하면 됨.
  OAUTH2_KAKAO_AUTH: "/oauth2/authorization/kakao?prompt=login",

  // 네이버: force=1로 재로그인/재동의 유도(백엔드 resolver가 처리)
  OAUTH2_NAVER_AUTH: "/oauth2/authorization/naver?force=1",

  // OAuth2 Link Flow
  OAUTH2_LINK_PASSWORD: "/api/oauth2/link/password",
  OAUTH2_OTP_SEND: "/api/oauth2/link/otp/send",
  OAUTH2_OTP_VERIFY: "/api/oauth2/link/otp/verify",
  OAUTH2_CONTINUE_NEW: "/api/oauth2/continue-new",

  // ✅ (P3-2) NAVER confirm API
  OAUTH2_CONFIRM: "/api/oauth2/confirm",
};

/**
 * ===========================================================
 * ✅ URL (절대경로)
 * ===========================================================
 */
export const URL = {
  AUTH_SIGNUP: `${API_BASE}${PATH.AUTH_SIGNUP}`,
  AUTH_LOGIN: `${API_BASE}${PATH.AUTH_LOGIN}`,
  AUTH_FIND_USERNAME: `${API_BASE}${PATH.AUTH_FIND_USERNAME}`,
  AUTH_VERIFY_USER: `${API_BASE}${PATH.AUTH_VERIFY_USER}`,
  AUTH_RESET_PASSWORD: `${API_BASE}${PATH.AUTH_RESET_PASSWORD}`,

  EMAIL_SEND: `${API_BASE}${PATH.EMAIL_SEND}`,
  EMAIL_VERIFY: `${API_BASE}${PATH.EMAIL_VERIFY}`,
  EMAIL_STATUS: `${API_BASE}${PATH.EMAIL_STATUS}`,

  AUTH_CHECK_USERNAME: `${API_BASE}${PATH.AUTH_CHECK_USERNAME}`,
  AUTH_CHECK_EMAIL: `${API_BASE}${PATH.AUTH_CHECK_EMAIL}`,

  USERS: `${API_BASE}${PATH.USERS}`,
  ME: `${API_BASE}${PATH.ME}`,

  OAUTH2_GOOGLE_AUTH: `${API_BASE}${PATH.OAUTH2_GOOGLE_AUTH}`,
  OAUTH2_KAKAO_AUTH: `${API_BASE}${PATH.OAUTH2_KAKAO_AUTH}`,
  OAUTH2_NAVER_AUTH: `${API_BASE}${PATH.OAUTH2_NAVER_AUTH}`,

  OAUTH2_LINK_PASSWORD: `${API_BASE}${PATH.OAUTH2_LINK_PASSWORD}`,
  OAUTH2_OTP_SEND: `${API_BASE}${PATH.OAUTH2_OTP_SEND}`,
  OAUTH2_OTP_VERIFY: `${API_BASE}${PATH.OAUTH2_OTP_VERIFY}`,
  OAUTH2_CONTINUE_NEW: `${API_BASE}${PATH.OAUTH2_CONTINUE_NEW}`,

  // ✅ (P3-2) NAVER confirm API
  OAUTH2_CONFIRM: `${API_BASE}${PATH.OAUTH2_CONFIRM}`,

  // 프론트 redirect (백엔드 redirect-base에 설정)
  FRONT_OAUTH2_REDIRECT: `${FRONT_BASE}/oauth2/redirect`,
};

/**
 * ===========================================================
 * ✅ 인증 키
 * ===========================================================
 */
export const AUTH_KEY = {
  USERNAME: "username",
  PASSWORD: "password",
  TOKEN: "accessToken", // 단일화 핵심
};

/**
 * ===========================================================
 * ✅ Storage Key 모음
 * ===========================================================
 */
export const STORAGE_KEY = {
  ACCESS_TOKEN: AUTH_KEY.TOKEN,

  // LINK_REQUIRED용
  SOCIAL_TEMP_TOKEN: "socialTempToken",

  // displayName 관련
  SOCIAL_DISPLAY_NAME: "socialDisplayName",
  OAUTH2_DISPLAY_NAME: "OAUTH2_DISPLAY_NAME",

  // ✅ (P3-2) NAVER confirm "pending" 키
  OAUTH2_PENDING_TOKEN: "OAUTH2_PENDING_TOKEN",
  OAUTH2_PENDING_PROVIDER: "OAUTH2_PENDING_PROVIDER",
  OAUTH2_PENDING_NAME: "OAUTH2_PENDING_NAME",
  OAUTH2_PENDING_EMAIL: "OAUTH2_PENDING_EMAIL",

  USERNAME: AUTH_KEY.USERNAME,

  // 아이디 저장용
  SAVED_USERNAME: "savedUsername",
};

/**
 * ===========================================================
 * ✅ FLASH (1회성 토스트 플래그)
 * ===========================================================
 */
export const FLASH_KEY = {
  TOAST: "FLASH_TOAST",
};

export const FLASH = {
  GOOGLE_LOGIN_OK: "GOOGLE_LOGIN_OK", // 구형 호환
  SOCIAL_LOGIN_OK: "SOCIAL_LOGIN_OK",

  LINK_REQUIRED: "LINK_REQUIRED",
  LINK_OK: "LINK_OK",

  SESSION_EXPIRED: "SESSION_EXPIRED",
  SESSION_INVALID: "SESSION_INVALID",

  OAUTH2_FALLBACK: "OAUTH2_FALLBACK",
};

/**
 * ===========================================================
 * ✅ ROUTE
 * ===========================================================
 */
export const ROUTE = {
  HOME: "/",
  LOGIN: "/login",
  OAUTH2_REDIRECT: "/oauth2/redirect",
  OAUTH2_CONFIRM: "/oauth2/confirm",
  LINK_ACCOUNT: "/link-account",
};

/**
 * ===========================================================
 * ✅ Axios/Event 관련
 * ===========================================================
 */
export const AUTH_EVENT = {
  EXPIRED: "auth:expired",
  UNAUTHORIZED: "auth:unauthorized",
  FORBIDDEN: "auth:forbidden",
  CONFLICT: "req:conflict",
};

export const HTTP_STATUS = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  CONFLICT: 409,
  BAD_REQUEST: 400,
  INTERNAL_SERVER_ERROR: 500,
};

/**
 * ===========================================================
 * ✅ Reducer Action
 * ===========================================================
 */
export const USERS = {
  ALL: "all",
  LOGIN: "login",
  LOGOUT: "logout",
  LIKES: "likes",
};

export const BBS = {
  ALL: "all",
  WRITE: "write",
  DELETE: "delete",
  TOTALSIZE: "totalsize",
  NOWPAGE: "nowpage",
};

export const BBS_PAGING = {
  PAGESIZE: 2,
  BLOCKPAGE: 3,
};
