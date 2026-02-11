// src/components/AuthRoute.jsx
// ✅ 인증이 필요한 라우트 접근을 막는 Router Guard

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AUTH_KEY, STORAGE_KEY } from "../config/constants";

export default function AuthRoute() {
  const location = useLocation();

  /**
   * ✅ 인증 판정 기준(아이디 로그인 + 소셜 로그인 통합)
   * 1) (기존) username이 있으면 로그인으로 인정
   * 2) (추가) access token(JWT)이 있으면 로그인으로 인정 (소셜 로그인)
   *
   * ✅ localStorage 우선(새로고침 유지), sessionStorage는 기존 코드 호환용
   */
  const username =
    localStorage.getItem(AUTH_KEY.USERNAME) ||
    sessionStorage.getItem(AUTH_KEY.USERNAME);

  const token =
    localStorage.getItem(STORAGE_KEY.ACCESS_TOKEN) ||
    sessionStorage.getItem(STORAGE_KEY.ACCESS_TOKEN);

  const isAuth = !!username || !!token;

  if (!isAuth) {
    window.alert("로그인 후 이용하세요");

    return (
      <Navigate
        to="/login"
        replace
        // ✅ 원래 가려던 위치를 저장 -> Login에서 복귀 가능
        state={{ from: location }}
      />
    );
  }

  return <Outlet />;
}
