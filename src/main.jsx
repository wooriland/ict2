// ✅ 파일: src/main.jsx
import { createRoot } from "react-dom/client";
import "./index.css";

import { RouterProvider } from "react-router-dom";
import router from "./router.jsx";

import "rc-pagination/assets/index.css";
import "react-toastify/dist/ReactToastify.css";

// ✅ (수정) UsersProvider는 RouterProvider 바깥에 두면
// 내부에서 useNavigate/useLocation 같은 Router 훅을 쓰는 Provider들과 충돌이 나기 쉬움.
// → UsersProvider는 App.jsx(라우터 내부)에서 감싸는 방식으로 두는 게 안전.
// 따라서 main.jsx에서는 제거하고 RouterProvider만 렌더링.
createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);
