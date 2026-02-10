// src/components/AuthRoute.jsx
// <접근 제한이 필요한 라우팅 컴포넌트들 제한하기위 위한 Protected Router컴포넌트>
// 라우터 단계에서 인증 여부 검사하기 위한 컴포넌트(Router Guard)

import { Navigate, Outlet, useLocation, useOutletContext } from "react-router-dom";
import { AUTH_KEY } from "../config/constants";

export default function AuthRoute() {
  // ✅ localStorage 우선(새로고침 유지) + sessionStorage 보조(호환)
  const isAuth =
    localStorage.getItem(AUTH_KEY.USERNAME) ||
    sessionStorage.getItem(AUTH_KEY.USERNAME);

  const context = useOutletContext();
  console.log("(AuthRoute.jsx)context:", context);

  const location = useLocation();
  console.log("(AuthRoute.jsx)location:", location);

  if (!isAuth) {
    window.alert("로그인 후 이용하세요");

    return (
      <Navigate
        to="/login"
        replace
        // ✅ location 전체를 저장해야 Login에서 from.pathname으로 복귀 가능
        state={{ from: location }}
      />
    );
  }

  return <Outlet />;
}
