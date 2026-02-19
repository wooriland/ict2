// ✅ 파일: src/pages/oauth/OAuth2Redirect.jsx
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { STORAGE_KEY } from "../config/constants"; 
// ⚠️ OAuth2Redirect.jsx가 src/pages/oauth/에 있다면 보통 "../config/constants"가 맞음
// (경로가 다르면 너 프로젝트 구조에 맞게만 조정)

 /**
  * ✅ OAuth2Redirect.jsx (환영문구 provider 분기 + 1회성 저장 최종 안정화)
  *
  * 백엔드 redirect-base 쿼리:
  * - status=LOGIN_OK|SIGNUP_CREATED|LINK_REQUIRED|OAUTH2_FAIL
  * - token=JWT (LOGIN_OK / SIGNUP_CREATED)
  * - socialTempToken=... (LINK_REQUIRED)
  * - displayName=... (선택)  ← 카카오 닉네임 등
  * - provider=GOOGLE|KAKAO|NAVER... (선택)
  * - error=... (선택)
  *
  * ✅ 핵심
  * 1) accessToken 키로 저장 (STORAGE_KEY.ACCESS_TOKEN)
  * 2) 환영 문구용 값은 "JWT subject/USER.username"이 아니라
  *    redirect query로 받은 displayName을 별도 저장해서 메인(UsersProvider)에서 토스트에 사용
  * 3) 환영 문구는 1회성이므로 sessionStorage 권장
  *
  * ✅ 추가 안정화
  * - status/provider/displayName trim + 대문자 정규화
  * - token 저장은 localStorage만(소셜은 keepLogin UX와 별개로 단순화)
  * - LINK_REQUIRED 이동 시 provider/displayName/error 전달
  */
export default function OAuth2Redirect() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    const statusRaw = params.get("status");
    const status = statusRaw?.trim() ? statusRaw.trim().toUpperCase() : null;

    const tokenRaw = params.get("token");
    const token = tokenRaw?.trim() ? tokenRaw.trim() : null;

    const socialTempTokenRaw = params.get("socialTempToken");
    const socialTempToken = socialTempTokenRaw?.trim() ? socialTempTokenRaw.trim() : null;

    const displayNameRaw = params.get("displayName");
    const displayName = displayNameRaw?.trim() ? displayNameRaw.trim() : null;

    const providerRaw = params.get("provider");
    const provider = providerRaw?.trim() ? providerRaw.trim().toUpperCase() : null;

    const errorRaw = params.get("error");
    const error = errorRaw?.trim() ? errorRaw.trim() : null;

    // ✅ provider별 환영 이름 결정
    // - KAKAO: 닉네임만 사용(placeholder email/username 섞지 않기)
    // - GOOGLE/NAVER: 일단 displayName 사용
    //   (구글을 "이메일로 환영"은 UsersProvider에서 /me 결과로 처리하는 게 가장 안정적)
    const welcomeName = (() => {
      if (provider === "KAKAO") return displayName; // ✅ 카카오: 닉네임
      return displayName; // ✅ 그 외: displayName(있을 때만)
    })();

    console.log("[OAuth2Redirect]", {
      status,
      hasToken: !!token,
      socialTempToken,
      provider,
      displayName,
      welcomeName,
      error,
    });

    // 1) ✅ 연결 필요 → LinkAccount로 이동
    if (status === "LINK_REQUIRED" && socialTempToken) {
      const qs =
        `?socialTempToken=${encodeURIComponent(socialTempToken)}` +
        (displayName ? `&displayName=${encodeURIComponent(displayName)}` : "") +
        (provider ? `&provider=${encodeURIComponent(provider)}` : "") +
        (error ? `&error=${encodeURIComponent(error)}` : "");
      navigate(`/link-account${qs}`, { replace: true });
      return;
    }

    // 2) ✅ 로그인 성공
    const isLoginOk = status === "LOGIN_OK" || status === "SIGNUP_CREATED";
    if (isLoginOk && token) {
      // ✅ 토큰 저장 (프로젝트 상수로 통일)
      localStorage.setItem(STORAGE_KEY.ACCESS_TOKEN, token);

      // ✅ 1회성 환영 값(sessionStorage)
      // - UsersProvider에서 가장 먼저 소비해서 토스트 띄우게 될 것
      if (provider) sessionStorage.setItem("oauthProvider", provider);
      if (welcomeName) sessionStorage.setItem("oauthWelcomeName", welcomeName);

      navigate("/", { replace: true });
      return;
    }

    // 3) ✅ 실패 처리
    const reason = error || status || "unknown";
    navigate(`/login?oauth2=fail&reason=${encodeURIComponent(reason)}`, { replace: true });
  }, [location.search, navigate]);

  return null;
}
