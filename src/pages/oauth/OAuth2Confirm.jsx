// ✅ 파일: src/pages/oauth/OAuth2Confirm.jsx
// ✅ 네이버 로그인 직후 “이 계정으로 계속할까요?” 확인 페이지
// - 여기서 ‘계속하기’를 눌러야 localStorage에 토큰 확정 저장
// - ‘다른 계정’은 임시데이터 삭제 후 네이버 로그인(force=1) 다시 시작
//
// ✅ 수정 포인트(이번 적용)
// 1) pending.token 의존 제거: (현재 백엔드가 CONFIRM_REQUIRED에서 JWT를 안 내려주는 구조)
//    → OAuth2Redirect가 저장한 "socialTempToken(=confirmToken)"을 이용해서
//       POST /api/oauth2/confirm 로 JWT를 받아온 뒤 저장한다.
// 2) pending 키는 constants(STORAGE_KEY.OAUTH2_PENDING_*)로 유지
// 3) 직접 접근/새로고침 방지 기준도 "SOCIAL_TEMP_TOKEN 존재" + provider === NAVER 로 변경
// 4) 성공 시 기존 WelcomeToastGate 흐름 유지(FLASH.SOCIAL_LOGIN_OK + OAUTH2_DISPLAY_NAME)

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE, STORAGE_KEY, URL, FLASH_KEY, FLASH } from "../../config/constants";
import { apiFetch } from "../../api/apiClient";

export default function OAuth2Confirm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // =========================================================
  // ✅ OAuth2Redirect가 sessionStorage에 심어둔 "pending" 데이터 읽기
  // - 주의: token(JWT)은 원래 없어야 정상(백엔드가 confirm에서 발급)
  // =========================================================
  const pending = useMemo(() => {
    const token = sessionStorage.getItem(STORAGE_KEY.OAUTH2_PENDING_TOKEN); // (방어용) 있을 수도
    const provider = sessionStorage.getItem(STORAGE_KEY.OAUTH2_PENDING_PROVIDER);
    const name = sessionStorage.getItem(STORAGE_KEY.OAUTH2_PENDING_NAME);
    const email = sessionStorage.getItem(STORAGE_KEY.OAUTH2_PENDING_EMAIL);

    // ✅ confirmToken은 localStorage에 저장된 SOCIAL_TEMP_TOKEN을 재사용(키 통일)
    const confirmToken = localStorage.getItem(STORAGE_KEY.SOCIAL_TEMP_TOKEN);

    return {
      token, // (방어용)
      provider: provider?.toUpperCase() || null,
      name,
      email,
      confirmToken,
    };
  }, []);

  // =========================================================
  // ✅ 직접 접근/새로고침 방지
  // - confirmToken이 없거나 provider가 NAVER가 아니면 의미가 없음
  // =========================================================
  useEffect(() => {
    if (!pending.confirmToken || pending.provider !== "NAVER") {
      sessionStorage.setItem(FLASH_KEY.TOAST, FLASH.OAUTH2_FALLBACK);
      navigate(ROUTE.LOGIN, { replace: true });
    }
  }, [pending.confirmToken, pending.provider, navigate]);

  // =========================================================
  // ✅ pending/confirmToken 정리(재진입/오염 방지)
  // =========================================================
  const clearPending = () => {
    sessionStorage.removeItem(STORAGE_KEY.OAUTH2_PENDING_TOKEN);
    sessionStorage.removeItem(STORAGE_KEY.OAUTH2_PENDING_PROVIDER);
    sessionStorage.removeItem(STORAGE_KEY.OAUTH2_PENDING_NAME);
    sessionStorage.removeItem(STORAGE_KEY.OAUTH2_PENDING_EMAIL);

    // ✅ confirmToken(=socialTempToken)도 소모 후 정리
    localStorage.removeItem(STORAGE_KEY.SOCIAL_TEMP_TOKEN);
  };

  // =========================================================
  // ✅ 계속하기: 서버에 confirmToken 보내서 JWT 발급 → 토큰 확정 저장
  // =========================================================
  const handleContinue = async () => {
    if (loading) return;
    setLoading(true);

    try {
      // ✅ (방어) 만약 백엔드가 JWT를 이미 내려주는 방식으로 바뀌어 token이 있으면 그대로 사용
      let jwt = pending.token;

      // ✅ 원래 정상 흐름: confirm API 호출로 JWT 발급
      if (!jwt) {
        const data = await apiFetch(URL.OAUTH2_CONFIRM, {
          method: "POST",
          body: { confirmToken: pending.confirmToken },
        });

        jwt =
          data?.token ||
          data?.accessToken ||
          data?.jwt ||
          data?.data?.token ||
          data?.data?.accessToken ||
          data?.data?.jwt;

        if (!jwt) {
          sessionStorage.setItem(FLASH_KEY.TOAST, FLASH.OAUTH2_FALLBACK);
          clearPending();
          navigate(ROUTE.LOGIN, { replace: true });
          return;
        }
      }

      // ✅ 1) 토큰 확정 저장 (이제부터 로그인 상태)
      localStorage.setItem(STORAGE_KEY.ACCESS_TOKEN, jwt);

      // ✅ 2) 환영 토스트(1회)용 데이터 저장 (기존 구조 유지)
      const welcomeName = pending.name || pending.email || "네이버 사용자";
      sessionStorage.setItem(STORAGE_KEY.OAUTH2_DISPLAY_NAME, welcomeName);
      sessionStorage.setItem(FLASH_KEY.TOAST, FLASH.SOCIAL_LOGIN_OK);

      // ✅ 3) 임시 데이터 제거
      clearPending();

      // ✅ 4) 홈으로
      navigate(ROUTE.HOME, { replace: true });
    } catch (err) {
      console.error("❌ [OAuth2Confirm] confirm error:", err);
      sessionStorage.setItem(FLASH_KEY.TOAST, FLASH.OAUTH2_FALLBACK);
      clearPending();
      navigate(ROUTE.LOGIN, { replace: true });
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // ✅ 다른 계정: 임시데이터 삭제 + 네이버 로그인(force=1) 다시 시작
  // =========================================================
  const handleSwitchAccount = () => {
    if (loading) return;
    setLoading(true);

    clearPending();

    // ✅ force=1 → 백엔드에서 auth_type=reauthenticate 부착(이미 설계)
    window.location.href = URL.OAUTH2_NAVER_AUTH;
  };

  return (
    <div className="auth-page">
      <div className="auth-form">
        <h2 style={{ marginBottom: 8 }}>이 계정으로 계속할까요?</h2>

        <div style={{ opacity: 0.85, marginBottom: 16 }}>
          <div>✅ Provider: {pending.provider || "NAVER"}</div>
          <div>✅ 사용자: {pending.name || "네이버 사용자"}</div>
          {pending.email ? <div>✅ 이메일: {pending.email}</div> : null}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            className="auth-btn"
            onClick={handleContinue}
            disabled={loading}
            style={{ flex: 1 }}
          >
            {loading ? "처리 중..." : "계속하기"}
          </button>

          <button
            type="button"
            className="auth-btn"
            onClick={handleSwitchAccount}
            disabled={loading}
            style={{ flex: 1 }}
          >
            {loading ? "처리 중..." : "다른 계정으로"}
          </button>
        </div>

        <p style={{ marginTop: 14, fontSize: 13, opacity: 0.75 }}>
          • “계속하기”를 눌러야 로그인(JWT 저장)이 확정됩니다.<br />
          • “다른 계정”은 네이버 인증을 다시 시작합니다.
        </p>
      </div>
    </div>
  );
}
