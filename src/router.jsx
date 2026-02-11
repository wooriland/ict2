// src/router.jsx
import { createBrowserRouter } from "react-router-dom";

import App from "./App.jsx";
import ErrorPage from "./components/ErrorPage.jsx";
import AuthRoute from "./components/AuthRoute.jsx";

// ✅ Pages
import Home from "./pages/Home.jsx";

// ✅ 공개 Auth 페이지들
import Login from "./pages/member/Login.jsx";
import Signup from "./pages/member/Signup.jsx";
import FindId from "./pages/member/FindId.jsx";
import FindPw from "./pages/member/FindPw.jsx";
import Help from "./pages/member/Help.jsx";

// ✅ Users
import Users from "./pages/member/Users.jsx";
import Profile from "./pages/member/Profile.jsx";

// ✅ BBS
import Bbs from "./pages/bbs/Bbs.jsx";
import List from "./pages/bbs/List.jsx";
import InputForm from "./pages/bbs/InputForm.jsx";
import UpdateForm from "./pages/bbs/UpdateForm.jsx";
import Detail from "./pages/bbs/Detail.jsx";

// ✅ Photo
import Photo from "./pages/photo/Photo.jsx";

import NotFound from "./pages/NotFound.jsx";

// =========================================================
// ✅ OAuth2 전용 페이지들 (공개)
// - 백엔드 OAuth2SuccessHandler가 로그인 처리 후 여기로 보냄
//   예) /oauth2/redirect?status=LOGIN_OK&token=...
//   예) /oauth2/redirect?status=LINK_REQUIRED&socialTempToken=...
// =========================================================
import OAuth2Redirect from "./pages/oauth/OAuth2Redirect.jsx";

// =========================================================
// ✅ 계정 연결(공개)
// - OAuth2Redirect가 LINK_REQUIRED이면 여기로 이동
//   예) /link-account?socialTempToken=...
// =========================================================
import LinkAccount from "./pages/member/LinkAccount.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      // ✅ 메인
      { index: true, element: <Home /> },

      // =========================================================
      // ✅ 공개 Auth 페이지들
      // =========================================================
      { path: "login", element: <Login /> },
      { path: "signup", element: <Signup /> },
      { path: "find-id", element: <FindId /> },
      { path: "find-pw", element: <FindPw /> },
      { path: "help", element: <Help /> },

      // =========================================================
      // ✅ OAuth2 Redirect 전용 페이지 (공개)
      // =========================================================
      { path: "oauth2/redirect", element: <OAuth2Redirect /> },

      // =========================================================
      // ✅ 계정 연결 페이지 (공개)
      // =========================================================
      { path: "link-account", element: <LinkAccount /> },

      // =========================================================
      // ✅ Users (현재는 공개 페이지로 둠)
      // - 필요하면 AuthRoute 아래로 옮기면 됨
      // =========================================================
      {
        path: "users",
        element: <Users />,
        children: [{ path: ":username", element: <Profile /> }],
      },

      // =========================================================
      // ✅ 인증 필요 라우팅 (Protected)
      // =========================================================
      {
        element: <AuthRoute />,
        children: [
          {
            path: "bbs",
            element: <Bbs />,
            children: [
              { index: true, element: <List /> },
              { path: "form", element: <InputForm /> },
              { path: "form/:id", element: <UpdateForm /> },
              { path: ":id", element: <Detail /> },
            ],
          },
          { path: "photo", element: <Photo /> },
        ],
      },

      // ✅ 라우터 레벨 NotFound
      { path: "*", element: <NotFound /> },
    ],
  },
]);

export default router;
