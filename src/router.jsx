// src/router.jsx
import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/member/Login";
import Signup from "./pages/member/Signup";
import FindId from "./pages/member/FindId";
import FindPw from "./pages/member/FindPw";
import Help from "./pages/member/Help";

import Users from "./pages/member/Users";
import Profile from "./pages/member/Profile";
import Bbs from "./pages/bbs/Bbs";
import Photo from "./pages/photo/Photo";
import NotFound from "./pages/NotFound";
import App from "./App";
import AuthRoute from "./components/AuthRoute";
import List from "./pages/bbs/List";
import InputForm from "./pages/bbs/InputForm";
import UpdateForm from "./pages/bbs/UpdateForm";
import Detail from "./pages/bbs/Detail";
import ErrorPage from "./components/ErrorPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Home /> },

      // 공개 Auth 페이지들
      { path: "login", element: <Login /> },
      { path: "signup", element: <Signup /> },
      { path: "find-id", element: <FindId /> },
      { path: "find-pw", element: <FindPw /> },
      { path: "help", element: <Help /> },

      // Users
      {
        path: "users",
        element: <Users />,
        children: [{ path: ":username", element: <Profile /> }],
      },

      // ✅ 인증 필요: AuthRoute로 통일
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
          {
            path: "photo",
            element: <Photo />,
          },
        ],
      },

      { path: "*", element: <NotFound /> },
    ],
  },
]);

export default router;
