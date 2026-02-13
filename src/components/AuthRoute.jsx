// src/components/AuthRoute.jsx
// ✅ 인증이 필요한 라우트 접근을 막는 Router Guard (토큰 기반 판정 + savedUsername 분리)

// ✅ react-router
import { Navigate, Outlet, useLocation } from "react-router-dom";

// ✅ 인증/저장 키 (너가 constants.js에서 STORAGE_KEY 추가했다고 했으니 이걸 사용)
import { STORAGE_KEY } from "../config/constants";

/**
 * ✅ 토큰 유효성 1차 체크
 * - 존재 여부
 * - "null", "undefined" 제거
 * - JWT 기본 형태 a.b.c 체크
 */
const isValidStoredToken = (value) => {
  if (!value) return false;

  const token = String(value).trim();

  if (!token) return false;
  if (token === "null") return false;
  if (token === "undefined") return false;

  // ✅ JWT 기본 구조 체크 (xxx.yyy.zzz)
  if (token.split(".").length !== 3) return false;

  return true;
};

export default function AuthRoute() {
  const location = useLocation();

  // ✅ 인증은 "토큰"으로만 판단
  // - savedUsername(아이디 저장) 같은 편의값은 절대 인증에 영향 주면 안 됨
  const token =
    localStorage.getItem(STORAGE_KEY.ACCESS_TOKEN) ||
    sessionStorage.getItem(STORAGE_KEY.ACCESS_TOKEN);

  const isAuth = isValidStoredToken(token);

  // ✅ 인증 안 됐으면 로그인으로 이동
  // - state.from으로 원래 가려던 페이지 기억(로그인 후 복귀용)
  if (!isAuth) {
    // 필요하면 여기서 alert를 켜도 되지만, UX상 라우팅 단계에서 alert는 종종 불편함
    // window.alert("로그인 후 이용하세요");
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  // ✅ 인증 됐으면 자식 라우트 렌더
  return <Outlet />;
}
