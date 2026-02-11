// src/config/constants.js

/**
 * ✅ API BASE
 * - 기본값: 로컬 Spring 서버
 * - (권장) Vite 환경변수로 덮어쓸 수 있게 처리
 *
 * 사용 예) 프로젝트 루트에 .env 생성
 *   VITE_API_BASE=http://localhost:8080
 *
 * 배포 시 예)
 *   VITE_API_BASE=https://your-domain.com
 */
export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

// ✅ API URL
export const URL = {
  // ✅ Auth
  AUTH_SIGNUP: `${API_BASE}/api/auth/signup`,
  AUTH_LOGIN: `${API_BASE}/api/auth/login`,

  // ✅ 아이디 찾기 (email → username)
  // POST /api/auth/find-username
  AUTH_FIND_USERNAME: `${API_BASE}/api/auth/find-username`,

  // ✅ 비밀번호 찾기 1단계: username + email 검증
  // POST /api/auth/verify-user
  AUTH_VERIFY_USER: `${API_BASE}/api/auth/verify-user`,

  // ✅ 비밀번호 찾기 2단계: 비밀번호 재설정(username + email + newPassword)
  // PUT /api/auth/reset-password
  AUTH_RESET_PASSWORD: `${API_BASE}/api/auth/reset-password`,

  // ✅ (임시) 유저 전체 목록 - 기존 프론트 로직(필터 로그인)용
  // ⚠️ 백엔드에 실제로 이 엔드포인트가 있어야 함.
  USERS: `${API_BASE}/api/users`,

  // ✅ ✅ 현재 로그인 사용자 정보 (새로고침 유지 / 헤더 표시용)
  // GET /api/users/me  (Authorization: Bearer <token>)
  ME: `${API_BASE}/api/users/me`,

  // =========================================================
  // ✅ OAuth2 (Social Login)
  // =========================================================

  // ✅ Google OAuth2 로그인 시작점
  // - "Google 로그인" 버튼 클릭 시 이동
  // - Spring Security가 provider(구글)로 리다이렉트 처리
  OAUTH2_GOOGLE_AUTH: `${API_BASE}/oauth2/authorization/google`,

  // ✅ 계정 연결: 아이디/비번으로 기존 계정과 소셜 계정 연결
  // POST /api/oauth2/link/password
  OAUTH2_LINK_PASSWORD: `${API_BASE}/api/oauth2/link/password`,

  // ✅ 계정 연결: OTP 발송(이메일)
  // POST /api/oauth2/link/otp/send
  OAUTH2_OTP_SEND: `${API_BASE}/api/oauth2/link/otp/send`,

  // ✅ 계정 연결: OTP 검증 + 연결 완료
  // POST /api/oauth2/link/otp/verify
  OAUTH2_OTP_VERIFY: `${API_BASE}/api/oauth2/link/otp/verify`,

  // ✅ "새 계정으로 계속" (선택)
  // POST /api/oauth2/continue-new
  OAUTH2_CONTINUE_NEW: `${API_BASE}/api/oauth2/continue-new`,
};

// ✅ 기존 프로젝트 호환(아이디 저장/세션 처리에서 사용)
export const AUTH_KEY = {
  USERNAME: "username",
  PASSWORD: "password",
};

// ✅ 소셜 로그인 + JWT 저장용 키
export const STORAGE_KEY = {
  // ✅ 우리 서비스 JWT (로그인 성공 후 저장)
  ACCESS_TOKEN: "accessToken",

  // ✅ 소셜 로그인 성공 후, 연결 필요할 때 받는 임시 토큰
  SOCIAL_TEMP_TOKEN: "socialTempToken",

  /**
   * ✅ (안전장치)
   * - 예전 코드/새 코드가 USERNAME 저장 키를 헷갈려 쓰는 경우가 있어서
   *   STORAGE_KEY.USERNAME도 제공해두면 유지보수/호환이 편해짐.
   * - 실제 저장은 AUTH_KEY.USERNAME을 권장.
   */
  USERNAME: "username",
};

// ✅ "한 번만 보여줄 토스트" 플래그 키/값 (sessionStorage 사용 권장)
export const FLASH_KEY = {
  TOAST: "FLASH_TOAST",
};

// ✅ FLASH_TOAST 값들
export const FLASH = {
  GOOGLE_LOGIN_OK: "GOOGLE_LOGIN_OK", // 구글 로그인 성공 후 메인에서 토스트 1회
  LINK_REQUIRED: "LINK_REQUIRED", // 계정 연결 페이지에서 안내 토스트 1회
  LINK_OK: "LINK_OK", // 연결 완료 후 메인에서 토스트 1회
  OAUTH2_FALLBACK: "OAUTH2_FALLBACK", // 예외 케이스(선택)
};

// ✅ 라우트 문자열(오타 방지용)
export const ROUTE = {
  HOME: "/",
  LOGIN: "/login",

  // ✅ 백엔드가 프론트로 리다이렉트 시켜줄 전용 페이지
  // /oauth2/redirect?status=...&token=... or socialTempToken=...
  OAUTH2_REDIRECT: "/oauth2/redirect",

  // ✅ 계정 연결 페이지
  LINK_ACCOUNT: "/link-account",
};

// ✅ USERS reducer action
export const USERS = {
  ALL: "all",
  LOGIN: "login", // (기존 유지)
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
