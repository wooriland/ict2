import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function OAuth2Redirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");
    const token = params.get("token");

    // ✅ 로그인 성공이면 토큰 저장
    if (status === "LOGIN_OK" && token) {
      localStorage.setItem("ACCESS_TOKEN", token);
      // 필요하면 username 같은 것도 같이 저장 가능(백엔드에서 내려주게 되면)
    }

    // ✅ 이후 메인으로 이동
    navigate("/", { replace: true });
  }, [navigate]);

  return null; // 잠깐 거쳐가는 페이지라 UI 없어도 됨
}
