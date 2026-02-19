// ✅ 파일: src/provider/AuthEventProvider.jsx (또는 기존 경로 유지)
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AUTH_EVENT, ROUTE } from "../config/constants";
import { toast } from "react-toastify";

export default function AuthEventProvider({ children }) {
  const navigate = useNavigate();

  useEffect(() => {
    // =========================================================
    // ✅ (추가) OAuth2 로그인 직후 1회성 환영 토스트 소비
    // - OAuth2Redirect.jsx가 sessionStorage에 심어둔 값 사용
    // - 중복 방지 위해 읽고 즉시 삭제
    // =========================================================
    const provider = sessionStorage.getItem("oauthProvider");
    const welcomeName = sessionStorage.getItem("oauthWelcomeName");

    if (welcomeName) {
      sessionStorage.removeItem("oauthProvider");
      sessionStorage.removeItem("oauthWelcomeName");

      const p = (provider || "").toUpperCase();
      if (p === "KAKAO") toast.success(`${welcomeName}님, 환영합니다!`);
      else if (p === "GOOGLE") toast.success(`${welcomeName}로 로그인되었습니다.`);
      else toast.success(`${welcomeName}님, 로그인되었습니다.`);
    }

    // =========================================================
    // ✅ 1) 토큰 만료
    // =========================================================
    const onExpired = (e) => {
      toast.error("세션이 만료되었습니다. 다시 로그인해 주세요.");
      navigate(ROUTE.LOGIN, { replace: true });
    };

    // =========================================================
    // ✅ 2) 일반 401
    // =========================================================
    const onUnauthorized = (e) => {
      const code = e?.detail?.code;
      if (code === "AUTH_EXPIRED_TOKEN") return;
      navigate(ROUTE.LOGIN, { replace: true });
    };

    // =========================================================
    // ✅ 3) 403 권한 없음
    // =========================================================
    const onForbidden = (e) => {
      toast.error(e?.detail?.message || "접근 권한이 없습니다.");
    };

    // =========================================================
    // ✅ 4) 409 충돌
    // =========================================================
    const onConflict = (e) => {
      // no-op
    };

    window.addEventListener(AUTH_EVENT.EXPIRED, onExpired);
    window.addEventListener(AUTH_EVENT.UNAUTHORIZED, onUnauthorized);
    window.addEventListener(AUTH_EVENT.FORBIDDEN, onForbidden);
    window.addEventListener(AUTH_EVENT.CONFLICT, onConflict);

    return () => {
      window.removeEventListener(AUTH_EVENT.EXPIRED, onExpired);
      window.removeEventListener(AUTH_EVENT.UNAUTHORIZED, onUnauthorized);
      window.removeEventListener(AUTH_EVENT.FORBIDDEN, onForbidden);
      window.removeEventListener(AUTH_EVENT.CONFLICT, onConflict);
    };
  }, [navigate]);

  return children;
}
