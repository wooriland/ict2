// src/main.jsx
import { createRoot } from "react-dom/client";
import "./index.css";

import { RouterProvider } from "react-router-dom";
import router from "./router.jsx";

import "rc-pagination/assets/index.css";

// ✅ Toast CSS (App.jsx에서 이미 import 했으면 여기서는 생략 가능)
// - 보통 "전역 1번"만 import 하는 걸 추천해서 main.jsx로 올리는 편이 깔끔함
import "react-toastify/dist/ReactToastify.css";

/*
  ✅ main.jsx 역할
  1) <BrowserRouter> 대신 <RouterProvider> 렌더링
  2) router.jsx(createBrowserRouter로 만든 router 객체) 연결
  3) 전역 CSS/라이브러리 CSS는 여기서 1번만 로딩하는 편이 좋음
*/

createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);
