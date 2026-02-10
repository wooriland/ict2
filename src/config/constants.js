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

  // ✅ [추가] 비밀번호 찾기 1단계: username + email 검증
  // POST /api/auth/verify-user
  AUTH_VERIFY_USER: `${API_BASE}/api/auth/verify-user`,

  // ✅ [추가] 비밀번호 찾기 2단계: 비밀번호 재설정(username + email + newPassword)
  // PUT /api/auth/reset-password
  AUTH_RESET_PASSWORD: `${API_BASE}/api/auth/reset-password`,

  // ✅ (임시) 유저 전체 목록 - 기존 프론트 로직(필터 로그인)용
  // ⚠️ 백엔드에 실제로 이 엔드포인트가 있어야 함.
  USERS: `${API_BASE}/api/users`,
};

// ✅ 세션 키
export const AUTH_KEY = {
  USERNAME: "username",
  PASSWORD: "password",
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
