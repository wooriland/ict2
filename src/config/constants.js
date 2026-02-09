// src/config/constants.js

// ✅ Spring API Base
export const API_BASE = "http://localhost:8080";

// ✅ API URL
export const URL = {
  AUTH_SIGNUP: `${API_BASE}/api/auth/signup`,
  AUTH_LOGIN: `${API_BASE}/api/auth/login`,
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
