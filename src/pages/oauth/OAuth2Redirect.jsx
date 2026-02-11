// src/pages/oauth/OAuth2Redirect.jsx
import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ROUTE, STORAGE_KEY, FLASH_KEY, FLASH } from "../../config/constants";

/**
 * ✅ OAuth2Redirect
 * - 백엔드 OAuth2SuccessHandler가 최종적으로 프론트로 보내는 진입점
 * - 기대 쿼리:
 *   1) status=LOGIN_OK&token=...                  -> 로그인 완료
 *   2) status=LINK_REQUIRED&socialTempToken=...   -> 계정 연결 화면 이동
 *
 * ✅ UX 정책(최종)
 * - "구글 계정 선택 화면 -> 메인 화면 전환 후 결과 토스트 1개"가 가장 자연스럽다.
 * - 여기서는 토스트를 띄우지 않고,
 *   ✅ 처리 결과를 sessionStorage 플래그로 남긴 다음 목적지(Home/LinkAccount)에서 토스트를 1번만 띄운다.
 *
 * ✅ 안정성 보강
 * - 개발모드(StrictMode) useEffect 2회 실행 방지(useRef)
 * - 의존성은 location.search 기반
 * - status 누락이어도 socialTempToken만 오면 LINK_REQUIRED로 간주
 */
export default function OAuth2Redirect() {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ StrictMode(개발 환경) 중복 실행 방지
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    const qs = new URLSearchParams(location.search);

    // ✅ 쿼리 파라미터
    const status = qs.get("status"); // LOGIN_OK / SIGNUP_CREATED / LINK_REQUIRED
    const token = qs.get("token"); // 우리 서비스 JWT
    const socialTempToken = qs.get("socialTempToken"); // 연결용 임시 토큰
    const error = qs.get("error"); // (선택) 에러 전달용

    // ✅ 0) 에러가 오면 로그인으로 복귀 (토스트는 Login 페이지에서 처리해도 됨)
    if (error) {
      // Login에서 location.state.oauthError로 토스트 처리 가능
      sessionStorage.setItem(FLASH_KEY.TOAST, FLASH.OAUTH2_FALLBACK);
      navigate(ROUTE.LOGIN, { replace: true, state: { oauthError: error } });
      return;
    }

    // ✅ 1) JWT 토큰이 있으면 저장 후 메인 이동
    if (token) {
      localStorage.setItem(STORAGE_KEY.ACCESS_TOKEN, token);
      localStorage.removeItem(STORAGE_KEY.SOCIAL_TEMP_TOKEN);

      /**
       * ⚠️ 중요:
       * - 우리 목표는 "누구로 로그인됐는지(email)"를 반드시 보여주는 것.
       * - 그래서 여기서 username/email을 굳이 localStorage에 저장하지 않고,
       *   UsersProvider에서 /api/users/me 호출로 profile(email/name)을 복구하도록 설계한다.
       */

      // ✅ 메인에서 "로그인 완료(메일 포함)" 토스트 1회 노출용 플래그
      sessionStorage.setItem(FLASH_KEY.TOAST, FLASH.GOOGLE_LOGIN_OK);

      navigate(ROUTE.HOME, { replace: true });
      return;
    }

    // ✅ 2) 계정 연결이 필요한 경우
    const needLink =
      (status === "LINK_REQUIRED" && !!socialTempToken) || !!socialTempToken;

    if (needLink && socialTempToken) {
      // ✅ 로컬 저장(새로고침 대비)
      localStorage.setItem(STORAGE_KEY.SOCIAL_TEMP_TOKEN, socialTempToken);

      // ✅ LinkAccount에서 안내 토스트 1회 노출용 플래그
      sessionStorage.setItem(FLASH_KEY.TOAST, FLASH.LINK_REQUIRED);

      // ✅ link-account로 이동(쿼리도 함께 전달)
      navigate(
        `${ROUTE.LINK_ACCOUNT}?socialTempToken=${encodeURIComponent(
          socialTempToken
        )}`,
        { replace: true }
      );
      return;
    }

    // ✅ 3) 아무 것도 없으면 로그인으로 복귀
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
