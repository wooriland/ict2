// ✅ 파일: src/api/apiClient.js
// P0 안정화 버전 (fetch 단일 진입점 유지)
// - 로그인 실패(401)는 리다이렉트/alert 없이 "에러 throw"로만 처리 → Login.jsx가 카드 메시지로 표시
// - 다른 API에서 401은 code 기반으로:
//    * AUTH_EXPIRED_TOKEN  → 세션 만료 UX (스토리지 정리 + /login + FLASH 1회)
//    * AUTH_INVALID_TOKEN  → 무효 토큰 UX (스토리지 정리 + /login + FLASH 1회(선택))
//    * AUTH_UNAUTHORIZED   → 미로그인 UX (스토리지 정리 + /login(선택))
// - 409는 절대 리다이렉트 금지: 폼에서 code로 분기 처리
// - alert 제거(전부 UI 레벨에서 처리하도록)
//
// ✅ (P1 프론트 UX 품질 업 보조)
// - fetch는 기본 타임아웃이 없으므로 AbortController로 timeout을 걸어
//   "멈춘 느낌" 대신 "네트워크/서버 응답 지연"을 명확히 UX로 처리 가능하게 함.
//
// ✅ (P3 소셜 확장 보조)
// - OAuth2 Redirect / LinkAccount 화면에서도 같은 apiClient를 쓰기 때문에
//   "토큰 없음" 요청도 자연스럽게 동작해야 함.
// - 토큰은 localStorage 우선 → 없으면 sessionStorage (keepLogin 정책)
// - 소셜 링크 단계(OTP/Link)는 토큰 없이 호출될 수도 있으므로 buildHeaders가 안전해야 함.

import {
  API_BASE,
  API_TIMEOUT_MS,
  AUTH_KEY,
  FLASH_KEY,
  FLASH,
  PATH,
  ROUTE,
  HTTP_STATUS,
} from "../config/constants";

/** ✅ API 주소 단일화 */
const BASE_URL = API_BASE;

// =========================================================
// ✅ Token / Storage
// =========================================================

/**
 * ✅ 토큰 읽기: localStorage 우선, 없으면 sessionStorage
 * - keepLogin ON  : localStorage에 저장
 * - keepLogin OFF : sessionStorage에 저장
 */
function getToken() {
  return (
    localStorage.getItem(AUTH_KEY.TOKEN) ||
    sessionStorage.getItem(AUTH_KEY.TOKEN) ||
    ""
  );
}

/**
 * ✅ 공통 스토리지 정리
 * - "로그인 상태 오판정"을 막기 위해 username도 같이 지움
 */
function clearAuthStorage() {
  // token
  localStorage.removeItem(AUTH_KEY.TOKEN);
  sessionStorage.removeItem(AUTH_KEY.TOKEN);

  // username (로그인 오판정 방지)
  localStorage.removeItem(AUTH_KEY.USERNAME);
  sessionStorage.removeItem(AUTH_KEY.USERNAME);
}

/** ✅ one-shot 플래시 메시지 저장 */
function setFlashToast(value) {
  if (!value) return;
  sessionStorage.setItem(FLASH_KEY.TOAST, value);
}

/**
 * ✅ 로그인 이동
 * - SPA 라우터를 쓰더라도 "세션 만료/무효" 같은 강제 이동은
 *   window.location이 제일 확실함(상태 꼬임 방지)
 */
function redirectToLogin() {
  window.location.href = ROUTE?.LOGIN || "/login";
}

// =========================================================
// ✅ Error 객체 표준화
// =========================================================

/**
 * ✅ API 에러 객체 생성 (UI가 code별 UX 분기 가능)
 * - err.status : HTTP status
 * - err.data   : 서버 원본 응답 바디
 * - err.code   : 서버 ApiResponse의 code (있으면)
 */
function createApiError(message, status, data) {
  const err = new Error(message || "요청 중 오류가 발생했습니다.");
  err.status = status;
  err.data = data;

  // ✅ P0: 서버가 ApiResponse면 code를 err.code로도 들고 있게
  // { ok:false, code:"...", message:"..." }
  if (data && typeof data === "object" && data.code) {
    err.code = data.code;
  }
  return err;
}

// =========================================================
// ✅ Request / Response Helpers
// =========================================================

/**
 * ✅ 기본 헤더 구성
 * - Content-Type은 기본 JSON
 * - token 있으면 Authorization 자동 포함
 *
 * ⚠️ 주의:
 * - OAuth2 redirect 등 "토큰 없이 호출"하는 API가 있을 수 있으니
 *   token이 없을 때는 Authorization 헤더를 아예 넣지 않는다.
 */
function buildHeaders(extraHeaders = {}) {
  const token = getToken();

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extraHeaders,
  };
}

/** ✅ 응답 바디 안전 파싱 */
async function safeParseBody(res) {
  const contentType = res.headers.get("content-type") || "";

  // 1) JSON 응답
  if (contentType.includes("application/json")) {
    try {
      return await res.json();
    } catch {
      // json 파싱 실패 시 text로 fallback
      try {
        return await res.text();
      } catch {
        return null;
      }
    }
  }

  // 2) text 응답
  try {
    const text = await res.text();

    // text가 JSON 문자열이면 parse 시도
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  } catch {
    return null;
  }
}

/**
 * ✅ URL 구성
 * - path가 절대 URL이면 그대로 사용
 * - 아니면 BASE_URL + path
 */
function buildUrl(path) {
  if (!path) return BASE_URL;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${BASE_URL}${path}`;
}

/**
 * ✅ 이 요청이 "로그인 요청"인지 판별
 * - 여기서 401은 "세션 만료"가 아니라 "아이디/비번 틀림"일 가능성이 높음
 * - 따라서 redirect 금지 + throw로만 처리
 */
function isAuthLoginRequest(path, method) {
  const isLoginPath =
    typeof path === "string" &&
    (path.includes(PATH.AUTH_LOGIN) || path.endsWith(PATH.AUTH_LOGIN));

  return isLoginPath && (!method || method.toUpperCase() === "POST");
}

/** ✅ 서버 응답에서 message/code 최대한 뽑기 */
function extractServerMessage(data) {
  if (typeof data === "object" && data) return data.message || data.error || "";
  if (typeof data === "string") return data;
  return "";
}

/** ✅ 서버 응답에서 code 뽑기 (ApiResponse 기준) */
function extractServerCode(data) {
  return typeof data === "object" && data && typeof data.code === "string"
    ? data.code
    : null;
}

/**
 * ✅ 세션 만료/무효 시 Login 화면에 1회 안내하기 위한 FLASH 값 선택
 * - constants.js의 FLASH 값이 없다면 fallback 사용
 */
function pickSessionFlash(code) {
  if (code === "AUTH_EXPIRED_TOKEN") {
    return FLASH.SESSION_EXPIRED || FLASH.OAUTH2_FALLBACK;
  }
  if (code === "AUTH_INVALID_TOKEN") {
    return FLASH.SESSION_INVALID || FLASH.OAUTH2_FALLBACK;
  }
  // 그 외 401(미로그인/권한 등)
  return FLASH.OAUTH2_FALLBACK;
}

/** ✅ Retry-After 헤더(초 단위) 파싱 (있으면 UX에 활용 가능) */
function parseRetryAfterSeconds(res) {
  const v = res?.headers?.get?.("Retry-After");
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

// =========================================================
// ✅ 공통 fetch (단일 진입점)
// =========================================================

/**
 * ✅ apiFetch
 * - 모든 API 호출은 여기로 모인다.
 *
 * @param {string} path - PATH 상수 or 절대 URL
 * @param {object} options
 *   - method      : HTTP method
 *   - body        : JSON body (object)
 *   - headers     : extra headers
 *   - credentials : fetch credentials
 *   - timeoutMs   : AbortController timeout
 *
 * @returns parsed response body (data)
 *
 * ⚠️ 이 함수는 "로그인 실패(401)"와 "세션 만료(401)"를 분리해서 처리한다.
 * - 로그인 요청에서 401 → redirect 금지, throw
 * - 기타 요청에서 401 → storage 정리 + flash 저장 + /login 이동
 */
export async function apiFetch(
  path,
  {
    method = "GET",
    body,
    headers,
    credentials = "omit",
    timeoutMs = API_TIMEOUT_MS,
  } = {}
) {
  // ✅ (추가) timeout 구현: fetch가 오래 걸리면 Abort
  const controller = new AbortController();
  const timerId =
    timeoutMs && timeoutMs > 0
      ? setTimeout(() => controller.abort(), timeoutMs)
      : null;

  let res;
  let data;

  try {
    res = await fetch(buildUrl(path), {
      method,
      headers: buildHeaders(headers),
      body: body ? JSON.stringify(body) : undefined,
      credentials,
      signal: controller.signal,
    });

    data = await safeParseBody(res);
  } catch (err) {
    // ✅ Abort(타임아웃)
    if (err?.name === "AbortError") {
      throw createApiError(
        "요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.",
        408,
        { code: "REQ_TIMEOUT" }
      );
    }

    // ✅ 네트워크 끊김/서버 다운
    throw createApiError(
      "네트워크 오류가 발생했습니다. 서버 실행/주소를 확인하세요.",
      0,
      { code: "NETWORK_ERROR" }
    );
  } finally {
    if (timerId) clearTimeout(timerId);
  }

  const serverMsg = extractServerMessage(data);
  const serverCode = extractServerCode(data);

  // =========================================================
  // ✅ 429 처리 (P4: 잠금/레이트리밋)
  // =========================================================
  // - Login.jsx(또는 다른 폼)에서 status===429 + err.code로 UX 분기 가능
  // - 서버가 remainingSeconds를 주면 안내에 활용
  // - Retry-After 헤더가 있으면 보조로 활용 가능(서버가 remainingSeconds 안 줄 때)
  if (res.status === (HTTP_STATUS?.TOO_MANY_REQUESTS || 429)) {
    const retryAfterSec = parseRetryAfterSeconds(res);

    // ✅ 서버가 code를 안 줄 수도 있으니, data에 retryAfter를 보조로 실어줌
    const enriched =
      data && typeof data === "object"
        ? { ...data, retryAfterSec }
        : { message: serverMsg, retryAfterSec };

    throw createApiError(
      serverMsg || "요청이 너무 많습니다. 잠시 후 다시 시도하세요.",
      429,
      enriched
    );
  }

  // =========================================================
  // ✅ 401 처리 (P0: 만료/무효 분리)
  // =========================================================
  if (res.status === (HTTP_STATUS?.UNAUTHORIZED || 401)) {
    // 1) 로그인 요청이면 → 리다이렉트 금지, 그냥 throw
    if (isAuthLoginRequest(path, method)) {
      // ✅ 로그인 실패라도 혹시 남아있는 auth 흔적 정리(안전)
      clearAuthStorage();

      // ✅ 로그인 실패는 code가 없을 수도 있으니 메시지 중심
      throw createApiError(
        serverMsg || "아이디 또는 비밀번호가 일치하지 않습니다.",
        401,
        data
      );
    }

    // 2) 그 외 API면 → code 기반 “세션 만료/무효” UX
    clearAuthStorage();

    // ✅ 서버 code 기반 안내 선택
    const flashValue = pickSessionFlash(serverCode);
    setFlashToast(flashValue);

    // ✅ 즉시 로그인 페이지로
    redirectToLogin();

    // ✅ 호출자 코드가 이후 로직을 안 타게 undefined 리턴
    return undefined;
  }

  // =========================================================
  // ✅ 403 처리
  // =========================================================
  if (res.status === (HTTP_STATUS?.FORBIDDEN || 403)) {
    // ✅ 403은 보통 "권한 없음"
    // - 세션을 무조건 날리면 UX가 거칠어짐
    // - 다만 서버가 토큰 문제라고 명시한 경우만(만료/무효) 로그아웃 처리
    if (serverCode === "AUTH_INVALID_TOKEN" || serverCode === "AUTH_EXPIRED_TOKEN") {
      clearAuthStorage();
      setFlashToast(pickSessionFlash(serverCode));
      redirectToLogin();
      return undefined;
    }

    // ✅ 일반 403은 throw → 화면에서 권한 안내
    throw createApiError(serverMsg || "접근 권한이 없습니다.", 403, data);
  }

  // =========================================================
  // ✅ 409 처리 (중복/충돌)
  // =========================================================
  if (res.status === (HTTP_STATUS?.CONFLICT || 409)) {
    // ✅ 절대 리다이렉트 금지
    // - Signup.jsx 같은 폼에서 err.code(USER_DUPLICATE_EMAIL 등)로 분기해야 함
    throw createApiError(serverMsg || "요청이 충돌했습니다.", 409, data);
  }

  // =========================================================
  // ✅ 기타 HTTP 오류
  // =========================================================
  if (!res.ok) {
    throw createApiError(
      serverMsg || `요청 실패 (HTTP ${res.status})`,
      res.status,
      data
    );
  }

  return data;
}

// =========================================================
// ✅ 편의 함수(api)
// =========================================================
//
// - 기존 코드에서 axios처럼 쓰기 편하게 유지
// - api.post(PATH.AUTH_LOGIN, payload) 형태로 사용

export const api = {
  get: (path, opts) => apiFetch(path, { ...opts, method: "GET" }),
  post: (path, body, opts) => apiFetch(path, { ...opts, method: "POST", body }),
  put: (path, body, opts) => apiFetch(path, { ...opts, method: "PUT", body }),
  del: (path, opts) => apiFetch(path, { ...opts, method: "DELETE" }),
};
