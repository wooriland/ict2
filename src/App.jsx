// ✅ 파일: src/App.jsx
import "./App.css";
import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";

import Header from "./pages/Header";
import UsersProvider from "./provider/UsersProvider";

// ✅ [추가] P0: 401/403/만료 이벤트를 한 곳에서 받아 UX 처리
import AuthEventProvider from "./provider/AuthEventProvider";

// ✅ Toast
import { ToastContainer, toast } from "react-toastify";

// ✅ constants (키/값 통일)
import { FLASH, FLASH_KEY, STORAGE_KEY } from "./config/constants";

/*
  📌 App은 레이아웃 컴포넌트 역할을 수행한다.
  - Header는 항상 렌더링
  - <Outlet /> 위치에 각 라우트 페이지가 렌더링됨
  - UsersProvider로 전체 앱을 감싸 인증 상태를 전역 관리
  - AuthEventProvider로 401/403/만료 UX(로그인 이동/안내) 처리
  - ToastContainer는 앱 전체에서 1번만 렌더링

  ✅ OAuth 환영 토스트 1회 처리(완성형)
  - OAuth2Redirect.jsx가 sessionStorage에 심어둔
    FLASH_KEY.TOAST(=FLASH.SOCIAL_LOGIN_OK) + STORAGE_KEY.OAUTH2_DISPLAY_NAME
    을 홈(/)에서 1회만 소비하여 토스트를 띄운다.
  - 토스트 중복 방지:
    (1) StrictMode는 Redirect에서 차단
    (2) 여기서는 소비 후 즉시 removeItem
*/

// ✅ OAuth 환영 토스트 1회 소비 게이트
function WelcomeToastGate() {
  const location = useLocation();

  useEffect(() => {
    // ✅ 홈에서만 띄우고 싶으면 유지 (원하면 제거 가능)
    if (location.pathname !== "/") return;

    // ✅ OAuth2Redirect가 심어둔 "1회 토스트 플래그" 확인
    const flash = sessionStorage.getItem(FLASH_KEY.TOAST);
    if (!flash) return;

    // ✅ SOCIAL_LOGIN_OK일 때만 환영 토스트
    if (flash === FLASH.SOCIAL_LOGIN_OK) {
      const name = sessionStorage.getItem(STORAGE_KEY.OAUTH2_DISPLAY_NAME);

      // ✅ 1회성 소비 (중복 방지)
      sessionStorage.removeItem(FLASH_KEY.TOAST);
      sessionStorage.removeItem(STORAGE_KEY.OAUTH2_DISPLAY_NAME);

      toast.success(`${name || "사용자"}님 환영합니다!`, { toastId: "social-login-ok" });
      return;
    }

    // ✅ 나머지 플래시는 Login.jsx(카드 메시지)가 소비하는 구조이므로
    // 여기서는 건드리지 않는다.
  }, [location.pathname, location.key]); // ✅ (보강) 라우팅 이동마다 안전하게 트리거

  return null;
}

function App() {
  return (
    <UsersProvider>
      {/* ✅ Router 안쪽에서만 useNavigate 가능 → App에서 감싸는 게 안전 */}
      <AuthEventProvider>
        <Header />

        {/* ✅ OAuth 환영 토스트 1회 처리 */}
        <WelcomeToastGate />

        {/* ✅ fixed-top Header 보정: 헤더 높이만큼 내려줌 */}
        <div className="container" style={{ marginTop: "80px" }}>
          <Outlet />
        </div>

        {/* ✅ 토스트 컨테이너: 앱 전체에서 1번만 */}
        <ToastContainer
          position="top-right"
          autoClose={2000}
          newestOnTop
          closeOnClick
          pauseOnHover
          draggable
          theme="light"
        />
      </AuthEventProvider>
    </UsersProvider>
  );
}

export default App;
