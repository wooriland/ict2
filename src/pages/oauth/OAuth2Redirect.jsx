// ✅ 파일: src/pages/oauth/OAuth2Redirect.jsx
import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ROUTE, STORAGE_KEY } from "../../config/constants";
import { toast } from "react-toastify";

export default function OAuth2Redirect() {
  const navigate = useNavigate();
  const location = useLocation();
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    const qs = new URLSearchParams(location.search);

    const status = qs.get("status");
    const token = qs.get("token");
    const error = qs.get("error");

    const providerRaw = qs.get("provider");
    const provider = providerRaw?.toUpperCase();

    const displayName = qs.get("displayName"); // 카카오 닉네임
    const email = qs.get("email");             // 구글 이메일

    if (error) {
      toast.error("소셜 로그인에 실패했습니다.", { toastId: "oauth2-fail" });
      navigate(ROUTE.LOGIN, { replace: true });
      return;
    }

    if (token) {
      localStorage.setItem(STORAGE_KEY.ACCESS_TOKEN, token);

      // 🎯 핵심 분기
      if (provider === "GOOGLE") {
        // ✅ 구글은 이메일로 환영
        const welcome = email || displayName || "사용자";
        toast.success(`${welcome}님 환영합니다!`, {
          toastId: "google-login",
        });
      } else if (provider === "KAKAO") {
        // ✅ 카카오는 닉네임으로 환영
        const welcome = displayName || "카카오 사용자";
        toast.success(`${welcome}님 환영합니다!`, {
          toastId: "kakao-login",
        });
      } else {
        // fallback
        toast.success("로그인되었습니다.", { toastId: "login-ok" });
      }

      navigate(ROUTE.HOME, { replace: true });
      return;
    }

    navigate(ROUTE.LOGIN, { replace: true });
  }, [location.search, navigate]);

  return (
    <div className="auth-page">
      <div className="auth-form">
        <h2>로그인 처리 중...</h2>
        <p>잠시만 기다려주세요.</p>
      </div>
    </div>
  );
}
