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

/*
  📌 App은 레이아웃 컴포넌트 역할을 수행한다.
  - Header는 항상 렌더링
  - <Outlet /> 위치에 각 라우트 페이지가 렌더링됨
  - UsersProvider로 전체 앱을 감싸 인증 상태를 전역 관리
  - AuthEventProvider로 401/403/만료 UX(로그인 이동/안내) 처리
  - ToastContainer는 앱 전체에서 1번만 렌더링

  ✅ (추가) OAuth 환영 토스트 1회 처리
  - OAuth2Redirect.jsx가 sessionStorage에 심어둔
    oauthWelcomeName/oauthProvider를 "홈(/)"에서 1회 소비해서 토스트를 띄운다.
  - 카카오 placeholder(username/email)로 토스트 뜨는 문제 해결
*/

// ✅ OAuth 환영 토스트 1회 소비 게이트
function WelcomeToastGate() {
  const location = useLocation();

  useEffect(() => {
    // ✅ 홈에서만 띄우고 싶으면 유지 (원하면 제거 가능)
    if (location.pathname !== "/") return;

    const provider = sessionStorage.getItem("oauthProvider"); // ex) KAKAO
    const name = sessionStorage.getItem("oauthWelcomeName");  // ex) 권혁철(닉네임)

    if (!name) return;

    // ✅ 1회성 소비(중복 방지)
    sessionStorage.removeItem("oauthProvider");
    sessionStorage.removeItem("oauthWelcomeName");

    // ✅ 문구 정책
    const p = (provider || "").toUpperCase();

    // - KAKAO: 닉네임으로 환영
    // - GOOGLE/NAVER: 지금은 displayName으로 환영(이메일로 꼭 환영하려면 /me 결과로 교체 권장)
    if (p === "KAKAO") toast.success(`${name}로 로그인되었습니다.`);
    else toast.success(`${name}로 로그인되었습니다.`);
  }, [location.pathname]);

  return null;
}

function App() {
  return (
    <UsersProvider>
      {/* ✅ Router 안쪽에서만 useNavigate 가능 → App에서 감싸는 게 안전 */}
      <AuthEventProvider>
        <Header />

        {/* ✅ (추가) OAuth 환영 토스트 1회 처리 */}
        <WelcomeToastGate />

        {/* ✅ fixed-top Header 보정: 헤더 높이만큼 내려줌 */}
        <div className="container" style={{ marginTop: "80px" }}>
          <Outlet />
        </div>

        {/* ✅ 토스트 컨테이너: 앱 전체에서 1번만 (하단에 두는 게 안정적) */}
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
