// src/App.jsx
import "./App.css";
import { Outlet } from "react-router-dom";

import Header from "./pages/Header";
import UsersProvider from "./provider/UsersProvider";

// ✅ Toast
import { ToastContainer } from "react-toastify";

/*
  📌 App은 레이아웃 컴포넌트 역할을 수행한다.
  - Header는 항상 렌더링
  - <Outlet /> 위치에 각 라우트 페이지가 렌더링됨
  - UsersProvider로 전체 앱을 감싸 인증 상태를 전역 관리
  - ToastContainer는 앱 전체에서 1번만 렌더링
*/

function App() {
  return (
    <UsersProvider>
      <Header />

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
    </UsersProvider>
  );
}

export default App;
