// ✅ 파일: src/router.jsx
import { createBrowserRouter } from "react-router-dom";

import App from "./App.jsx";
import ErrorPage from "./components/ErrorPage.jsx";
import AuthRoute from "./components/AuthRoute.jsx";

// ✅ Pages
import Home from "./pages/Home.jsx";

// ✅ 공개 Auth 페이지들 (⚠️ 케이싱 주의)
import Login from "./pages/member/login.jsx";
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

// ✅ 404
import NotFound from "./pages/NotFound.jsx";

// ✅ OAuth2
import OAuth2Redirect from "./pages/oauth/OAuth2Redirect.jsx";
import OAuth2Confirm from "./pages/oauth/OAuth2Confirm.jsx"; // ✅ (추가) 네이버 confirm 페이지
import LinkAccount from "./pages/member/LinkAccount.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Home /> },

      // =========================================================
      // ✅ 공개 Auth
      // =========================================================
      { path: "login", element: <Login /> },
      { path: "signup", element: <Signup /> },
      { path: "find-id", element: <FindId /> },
      { path: "find-pw", element: <FindPw /> },
      { path: "help", element: <Help /> },

      // =========================================================
      // ✅ OAuth2 전용 라우트들
      // - /oauth2/redirect : 백엔드 SuccessHandler redirect 도착지
      // - /oauth2/confirm  : NAVER만 "계속할까요?" 확인 페이지
      // - /link-account    : LINK_REQUIRED 계정연결 페이지
      // =========================================================
      { path: "oauth2/redirect", element: <OAuth2Redirect /> },
      { path: "oauth2/confirm", element: <OAuth2Confirm /> }, // ✅ (추가)
      { path: "link-account", element: <LinkAccount /> },

      // =========================================================
      // ✅ Users(공개)
      // =========================================================
      {
        path: "users",
        element: <Users />,
        children: [{ path: ":username", element: <Profile /> }],
      },

      // =========================================================
      // ✅ 보호 구간(AuthRoute)
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

      // =========================================================
      // ✅ 404
      // =========================================================
      { path: "*", element: <NotFound /> },
    ],
  },
]);

export default router;
