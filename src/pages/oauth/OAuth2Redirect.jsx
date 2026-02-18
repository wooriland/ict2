// ✅ 파일: src/pages/oauth/OAuth2Redirect.jsx
// ✅ 목표 적용
// 1) SuccessHandler status는 "SOCIAL_LOGIN_OK"로 통일(구글/카카오 공통)
// 2) (추가) 네이버는 "CONFIRM_REQUIRED"로 한번 더 확인 페이지를 거친다
// 3) 토큰 저장 + 플래시/환영정보는 "sessionStorage에 1회용으로 저장" (토스트는 여기서 직접 띄우지 않음)
// 4) 토스트/플래시가 2번 뜨지 않게: (1) StrictMode 2회 방지 + (2) Home에서 1회 소비 구조
// 5) LINK_REQUIRED는 기존대로 처리하되, tempToken 저장 키는 constants의 STORAGE_KEY.SOCIAL_TEMP_TOKEN 사용
//
// ✅ (추가 안정화 포인트)
// - CONFIRM_REQUIRED에서 넘기는 정보들도 constants(STORAGE_KEY.OAUTH2_PENDING_*)로 키 통일
// - status 우선 처리(혹시 token이 같이 오더라도 status가 CONFIRM_REQUIRED면 confirm로 보냄)
// - confirmToken 파라미터도 지원(백엔드가 confirmToken으로 내려주는 설계일 때)

import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ROUTE, STORAGE_KEY, FLASH_KEY, FLASH } from "../../config/constants";

export default function OAuth2Redirect() {
  const navigate = useNavigate();
  const location = useLocation();
  const ranRef = useRef(false);

  useEffect(() => {
    // =========================================================
    // ✅ React StrictMode(개발모드)에서 useEffect 2번 실행 방지용
    // =========================================================
    if (ranRef.current) return;
    ranRef.current = true;

    // =========================================================
    // ✅ 0) 디버깅: 리다이렉트 전체 URL (운영에서는 토큰 노출 주의)
    // =========================================================
    console.log("✅ [OAuth2Redirect] redirect url =", window.location.href);

    const qs = new URLSearchParams(location.search);

    // =========================================================
    // ✅ 1) 파라미터 파싱
    // =========================================================
    const status = qs.get("status"); // SOCIAL_LOGIN_OK / LINK_REQUIRED / CONFIRM_REQUIRED / OAUTH2_FAIL ...
    const token = qs.get("token"); // ✅ 백엔드 JWT (SOCIAL_LOGIN_OK에서만)
    const error = qs.get("error"); // 실패시만

    const providerRaw = qs.get("provider"); // GOOGLE / KAKAO / NAVER ...
    const provider = providerRaw?.toUpperCase();

    const displayName = qs.get("displayName");
    const email = qs.get("email");

    // ✅ LINK_REQUIRED: socialTempToken
    const socialTempToken = qs.get("socialTempToken");

    // ✅ CONFIRM_REQUIRED: confirmToken(백엔드가 이 이름으로 내려주는 경우)
    const confirmToken = qs.get("confirmToken");

    // =========================================================
    // ✅ 2) 디버깅: 파싱 결과(민감정보 보호)
    // =========================================================
    console.log("✅ [OAuth2Redirect] parsed =", {
      status,
      provider,
      hasToken: !!token,
      hasSocialTempToken: !!socialTempToken,
      hasConfirmToken: !!confirmToken,
      hasEmail: !!email,
      hasDisplayName: !!displayName,
      error,
    });

    // =========================================================
    // ✅ 3) 실패 처리
    // =========================================================
    if (error || status === "OAUTH2_FAIL") {
      sessionStorage.setItem(FLASH_KEY.TOAST, FLASH.OAUTH2_FALLBACK);
      navigate(ROUTE.LOGIN, { replace: true });
      return;
    }

    // =========================================================
    // ✅ 4) CONFIRM_REQUIRED 처리 (NAVER)
    // - status를 최우선으로 처리 (token이 섞여 와도 confirm로 보냄)
    // - 백엔드 설계에 따라 confirmToken 또는 socialTempToken을 사용
    // =========================================================
    if (status === "CONFIRM_REQUIRED") {
      // ✅ confirmToken 우선, 없으면 socialTempToken fallback
      const pendingConfirmToken = confirmToken || socialTempToken;

      if (!pendingConfirmToken) {
        console.error("❌ [OAuth2Redirect] CONFIRM_REQUIRED but token missing!");
        sessionStorage.setItem(FLASH_KEY.TOAST, FLASH.OAUTH2_FALLBACK);
        navigate(ROUTE.LOGIN, { replace: true });
        return;
      }

      // ✅ confirm 페이지에서 POST /api/oauth2/confirm 할 때 쓸 토큰
      // - 기존 구조 재사용: SOCIAL_TEMP_TOKEN 키에 저장(로컬 1개만 유지)
      localStorage.setItem(STORAGE_KEY.SOCIAL_TEMP_TOKEN, pendingConfirmToken);

      // ✅ confirm 화면 표시용 pending 정보 (sessionStorage 1회용)
      if (token) sessionStorage.setItem(STORAGE_KEY.OAUTH2_PENDING_TOKEN, token); // 방어용
      if (provider) sessionStorage.setItem(STORAGE_KEY.OAUTH2_PENDING_PROVIDER, provider);
      if (displayName) sessionStorage.setItem(STORAGE_KEY.OAUTH2_PENDING_NAME, displayName);
      if (email) sessionStorage.setItem(STORAGE_KEY.OAUTH2_PENDING_EMAIL, email);

      navigate(ROUTE.OAUTH2_CONFIRM, { replace: true });
      return;
    }

    // =========================================================
    // ✅ 5) LINK_REQUIRED 처리
    // =========================================================
    if (status === "LINK_REQUIRED") {
      if (!socialTempToken) {
        console.error("❌ [OAuth2Redirect] LINK_REQUIRED but socialTempToken missing!");
        sessionStorage.setItem(FLASH_KEY.TOAST, FLASH.OAUTH2_FALLBACK);
        navigate(ROUTE.LOGIN, { replace: true });
        return;
      }

      localStorage.setItem(STORAGE_KEY.SOCIAL_TEMP_TOKEN, socialTempToken);
      sessionStorage.setItem(FLASH_KEY.TOAST, FLASH.LINK_REQUIRED);

      navigate(ROUTE.LINK_ACCOUNT, { replace: true });
      return;
    }

    // =========================================================
    // ✅ 6) JWT(token) 성공 처리 (GOOGLE/KAKAO)
    // =========================================================
    if (token) {
      localStorage.setItem(STORAGE_KEY.ACCESS_TOKEN, token);

      const welcomeName =
        provider === "GOOGLE"
          ? email || displayName || "사용자"
          : provider === "KAKAO"
          ? displayName || "카카오 사용자"
          : provider === "NAVER"
          ? displayName || email || "네이버 사용자"
          : displayName || email || "사용자";

      sessionStorage.setItem(STORAGE_KEY.OAUTH2_DISPLAY_NAME, welcomeName);
      sessionStorage.setItem(FLASH_KEY.TOAST, FLASH.SOCIAL_LOGIN_OK);

      navigate(ROUTE.HOME, { replace: true });
      return;
    }

    // =========================================================
    // ✅ 7) 예외 케이스
    // =========================================================
    console.error(
      "❌ [OAuth2Redirect] No token, no error, no LINK_REQUIRED/CONFIRM_REQUIRED. Check SuccessHandler redirect params."
    );
    sessionStorage.setItem(FLASH_KEY.TOAST, FLASH.OAUTH2_FALLBACK);
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
