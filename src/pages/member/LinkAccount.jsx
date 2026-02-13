// ✅ 파일: src/pages/member/LinkAccount.jsx
//
// ✅ P3 소셜 확장 + P0 안정화 스타일로 정리한 최종본
//
// 핵심 개선점
// 1) axios 직접 호출 → ✅ apiFetch(apiClient)로 통일 (401/403/409 처리 정책 일관성 확보)
// 2) 상수 하드코딩("FLASH_TOAST", "LINK_REQUIRED") 제거 → ✅ constants(FLASH_KEY/FLASH) 사용
// 3) 토큰 저장 정책 반영:
//    - 이 화면에서 발급받는 JWT는 "최종 로그인 토큰"이므로
//      ✅ keepLogin 선택이 없으면 localStorage 저장(소셜 로그인 흐름과 동일하게 단순화)
//      (원하면: Login.jsx의 keepLogin 설정을 sessionStorage에 저장해 두고 여기서 읽어 분기 가능)
// 4) displayName(카카오 닉네임/구글 이름) 대응:
//    - OAuth2Redirect가 sessionStorage("OAUTH2_DISPLAY_NAME")에 넣어줬다면
//      LinkAccount에서 안내 문구/토스트에 활용 가능
//    - 없어도 정상 동작 (null-safe)
// 5) socialTempToken 소스 우선순위:
//    - queryParam > localStorage
// 6) StrictMode 중복 실행 방지(useRef)
// 7) 버튼/입력 disabled 조건 강화(토큰 없을 때/로딩 중)
//
// ⚠️ 주의
// - apiFetch는 기본적으로 BASE_URL(API_BASE)을 붙여 호출할 수 있으니
//   여기서는 "PATH(상대경로)"를 쓰는 방식이 가장 깔끔함.
// - constants.js에 PATH.OAUTH2_LINK_PASSWORD / PATH.OAUTH2_OTP_SEND / PATH.OAUTH2_OTP_VERIFY / PATH.OAUTH2_CONTINUE_NEW 가 이미 있음.

import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import AuthSidePanels from "../../components/AuthSidePanels";
import { apiFetch } from "../../api/apiClient";
import { ROUTE, STORAGE_KEY, FLASH_KEY, FLASH, PATH } from "../../config/constants";

// ✅ Toast
import { toast } from "react-toastify";

export default function LinkAccount() {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();

  // ✅ socialTempToken: 연결 흐름의 "핵심 키"
  const [socialTempToken, setSocialTempToken] = useState("");

  // ✅ 공통 로딩(중복 요청 방지)
  const [loading, setLoading] = useState(false);

  // ✅ StrictMode(개발 모드) useEffect 2번 실행 방지
  const ranRef = useRef(false);

  // ✅ 로컬 계정 연결 input
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);

  // ✅ OTP input
  const emailRef = useRef(null);
  const otpRef = useRef(null);

  // ✅ (선택) 소셜 표시이름(카카오 닉네임/구글 이름) - UI 안내용
  const [displayName, setDisplayName] = useState("");

  // =========================================================
  // ✅ 초기 진입 처리
  // =========================================================
  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    // 1) socialTempToken: queryParam 우선, 없으면 localStorage
    const q = params.get("socialTempToken");
    const saved = localStorage.getItem(STORAGE_KEY.SOCIAL_TEMP_TOKEN);
    const token = q || saved || "";

    if (!token) {
      // ✅ 토큰이 없으면 연결할 수 없으니 로그인 화면으로 복귀
      toast.warn("연결 정보가 없습니다. 다시 로그인해주세요.", {
        toastId: "link-no-token",
      });
      navigate(ROUTE.LOGIN, { replace: true });
      return;
    }

    // ✅ state 세팅 + 새로고침 대비 localStorage 저장
    setSocialTempToken(token);
    localStorage.setItem(STORAGE_KEY.SOCIAL_TEMP_TOKEN, token);

    // 2) (선택) displayName 읽기
    // - OAuth2Redirect.jsx에서 sessionStorage.setItem("OAUTH2_DISPLAY_NAME", displayName) 해두었다면 여기서 사용 가능
    const dn = sessionStorage.getItem("OAUTH2_DISPLAY_NAME") || "";
    setDisplayName(dn);

    // 3) OAuth2Redirect에서 넘긴 FLASH가 있다면 여기서 토스트 1번만
    const flash = sessionStorage.getItem(FLASH_KEY.TOAST);

    if (flash) {
      // ✅ 한 번만 노출해야 하므로 여기서 제거
      sessionStorage.removeItem(FLASH_KEY.TOAST);

      if (flash === FLASH.LINK_REQUIRED) {
        toast.info(
          dn
            ? `${dn} 계정으로 로그인하셨습니다. 기존 계정과 연결을 진행해주세요.`
            : "계정 연결이 필요합니다. 아래 방법으로 연결해주세요.",
          { toastId: "link-required-page" }
        );
      } else {
        // ✅ 예외/누락 케이스: 기본 안내
        toast.info("계정 연결을 진행해주세요.", { toastId: "link-generic" });
      }
    }
  }, [location.search, navigate, params]);

  // =========================================================
  // ✅ 공통 가드
  // =========================================================
  const ensureReady = () => {
    if (loading) return false;

    if (!socialTempToken) {
      toast.warn("연결 토큰이 없습니다. 다시 로그인 시도해주세요.", {
        toastId: "link-missing-token",
      });
      navigate(ROUTE.LOGIN, { replace: true });
      return false;
    }

    return true;
  };

  /**
   * ✅ 최종 로그인 토큰 저장 정책
   * - 이 화면은 "연결 완료/신규 생성 완료"로 최종 JWT를 받는 지점.
   * - 소셜 로그인 흐름(OAuth2Redirect)과 동일하게 localStorage에 저장(단순).
   *
   * (원하면 개선)
   * - Login.jsx의 keepLogin 값을 sessionStorage에 저장해뒀다가 여기서 읽고
   *   local/session 분기 저장도 가능.
   */
  const saveFinalToken = (token) => {
    localStorage.setItem(STORAGE_KEY.ACCESS_TOKEN, token);
    localStorage.removeItem(STORAGE_KEY.SOCIAL_TEMP_TOKEN);

    // ✅ session에 남아있는 토큰 흔적 정리(혼선 방지)
    sessionStorage.removeItem(STORAGE_KEY.ACCESS_TOKEN);
    sessionStorage.removeItem(STORAGE_KEY.SOCIAL_TEMP_TOKEN);
  };

  // =========================================================
  // ✅ 1) 아이디/비번으로 연결
  // =========================================================
  const handleLinkWithPassword = async (e) => {
    e.preventDefault();
    if (!ensureReady()) return;

    const username = usernameRef.current?.value?.trim() || "";
    const password = passwordRef.current?.value || "";

    if (!username || !password) {
      toast.warn("아이디/비밀번호를 입력하세요.", { toastId: "link-pw-empty" });
      return;
    }

    try {
      setLoading(true);

      // ✅ POST /api/oauth2/link/password
      // - apiFetch는 URL(절대)도 되고 PATH(상대)도 되는데, 여기서는 PATH 권장
      const res = await apiFetch(PATH.OAUTH2_LINK_PASSWORD, {
        method: "POST",
        body: { socialTempToken, username, password },
      });

      // ✅ 토큰 추출(백엔드 응답 구조 변화 대비)
      const token =
        res?.token ||
        res?.accessToken ||
        res?.jwt ||
        res?.data?.token ||
        res?.data?.accessToken ||
        res?.data?.jwt;

      if (!token) {
        toast.error("연결은 되었지만 토큰이 없습니다. 백엔드 응답을 확인하세요.", {
          toastId: "link-pw-no-token",
        });
        return;
      }

      // ✅ 최종 토큰 저장
      saveFinalToken(token);

      // ✅ 메인에서 "연결 완료" 토스트 1회
      sessionStorage.setItem(FLASH_KEY.TOAST, FLASH.LINK_OK);

      navigate(ROUTE.HOME, { replace: true });
    } catch (err) {
      // ✅ apiFetch는 err.message / err.code / err.status를 제공할 수 있음
      const msg =
        err?.data?.message ||
        err?.message ||
        "연결 실패(아이디/비밀번호). 입력 값을 확인하세요.";
      toast.error(msg, { toastId: "link-pw-fail" });

      console.error("LINK PW ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // ✅ 2-A) OTP 발송
  // =========================================================
  const handleSendOtp = async () => {
    if (!ensureReady()) return;

    const email = emailRef.current?.value?.trim() || "";
    if (!email) {
      toast.warn("이메일을 입력하세요.", { toastId: "otp-email-empty" });
      return;
    }

    try {
      setLoading(true);

      // ✅ POST /api/oauth2/link/otp/send
      await apiFetch(PATH.OAUTH2_OTP_SEND, {
        method: "POST",
        body: { socialTempToken, email },
      });

      toast.success("인증코드를 이메일로 보냈습니다.", { toastId: "otp-sent" });
    } catch (err) {
      const msg =
        err?.data?.message || err?.message || "OTP 발송 실패. 잠시 후 다시 시도해주세요.";
      toast.error(msg, { toastId: "otp-send-fail" });

      console.error("OTP SEND ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // ✅ 2-B) OTP 확인
  // =========================================================
  const handleVerifyOtp = async () => {
    if (!ensureReady()) return;

    const email = emailRef.current?.value?.trim() || "";
    const code = otpRef.current?.value?.trim() || "";

    if (!email || !code) {
      toast.warn("이메일/인증코드를 입력하세요.", { toastId: "otp-empty" });
      return;
    }

    try {
      setLoading(true);

      // ✅ POST /api/oauth2/link/otp/verify
      const res = await apiFetch(PATH.OAUTH2_OTP_VERIFY, {
        method: "POST",
        body: { socialTempToken, email, code },
      });

      const token =
        res?.token ||
        res?.accessToken ||
        res?.jwt ||
        res?.data?.token ||
        res?.data?.accessToken ||
        res?.data?.jwt;

      if (!token) {
        toast.error("토큰이 없습니다. 백엔드 응답 확인 필요", {
          toastId: "otp-no-token",
        });
        return;
      }

      saveFinalToken(token);

      // ✅ 메인에서 "연결 완료" 토스트 1회
      sessionStorage.setItem(FLASH_KEY.TOAST, FLASH.LINK_OK);

      navigate(ROUTE.HOME, { replace: true });
    } catch (err) {
      const msg =
        err?.data?.message || err?.message || "OTP 인증 실패. 코드를 확인해주세요.";
      toast.error(msg, { toastId: "otp-verify-fail" });

      console.error("OTP VERIFY ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // ✅ 3) 새 계정으로 계속(선택)
  // =========================================================
  const handleContinueAsNew = async () => {
    if (!ensureReady()) return;

    try {
      setLoading(true);

      // ✅ POST /api/oauth2/continue-new
      // - 기존 설계: 서버가 body에 socialTempToken을 받는 형태
      const res = await apiFetch(PATH.OAUTH2_CONTINUE_NEW, {
        method: "POST",
        body: { socialTempToken },
      });

      const token =
        res?.token ||
        res?.accessToken ||
        res?.jwt ||
        res?.data?.token ||
        res?.data?.accessToken ||
        res?.data?.jwt;

      if (!token) {
        toast.error("토큰이 없습니다. 백엔드 응답 확인 필요", {
          toastId: "continue-new-no-token",
        });
        return;
      }

      saveFinalToken(token);

      // ✅ 새 계정이든 기존 계정이든, "소셜 로그인 완료" 토스트는 Home에서 1회만
      // - 기존 값(GOOGLE_LOGIN_OK) 호환 유지
      sessionStorage.setItem(FLASH_KEY.TOAST, FLASH.GOOGLE_LOGIN_OK);

      navigate(ROUTE.HOME, { replace: true });
    } catch (err) {
      const msg =
        err?.data?.message || err?.message || "새 계정 진행 실패. 잠시 후 다시 시도해주세요.";
      toast.error(msg, { toastId: "continue-new-fail" });

      console.error("CONTINUE NEW ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // ✅ UI
  // =========================================================
  const disableAll = loading || !socialTempToken;

  return (
    <div className="auth-page">
      <div className="auth-grid">
        <AuthSidePanels
          left={{
            title: "계정 연결이 필요합니다",
            text:
              (displayName
                ? `• ${displayName} 계정으로 로그인하셨습니다.\n\n`
                : "") +
              "소셜 로그인은 성공했지만,\n" +
              "기존 계정과 연결이 필요한 상태입니다.\n\n" +
              "방법 1) 아이디/비밀번호로 연결\n" +
              "방법 2) 이메일 인증(OTP)으로 연결\n\n" +
              "연결이 완료되면 자동으로 로그인됩니다.",
            links: [
              { to: ROUTE.LOGIN, label: "로그인으로" },
              { to: "/signup", label: "회원가입" },
              { to: "/help", label: "고객센터" },
            ],
          }}
          right={{
            title: "계정 연결",
            text:
              "아래 방법 중 하나를 선택하세요.\n" +
              "• 이미 가입한 계정이 있다면 연결을 추천합니다.\n" +
              "• 처음이라면 '새 계정으로 계속'을 선택할 수 있습니다.",
          }}
        />

        <div className="auth-form">
          <h2>계정 연결</h2>

          {/* =========================
              1) 아이디/비밀번호 연결
             ========================= */}
          <form onSubmit={handleLinkWithPassword}>
            <h3>아이디/비밀번호로 연결</h3>
            <input
              ref={usernameRef}
              placeholder="아이디"
              disabled={disableAll}
              autoComplete="username"
            />
            <input
              ref={passwordRef}
              type="password"
              placeholder="비밀번호"
              disabled={disableAll}
              autoComplete="current-password"
            />
            <button type="submit" disabled={disableAll}>
              {loading ? "처리 중..." : "연결하기"}
            </button>
          </form>

          <hr style={{ margin: "16px 0" }} />

          {/* =========================
              2) OTP 연결
             ========================= */}
          <div>
            <h3>이메일 OTP로 연결</h3>

            <input
              ref={emailRef}
              placeholder="이메일"
              disabled={disableAll}
              autoComplete="email"
            />

            <button type="button" onClick={handleSendOtp} disabled={disableAll}>
              {loading ? "처리 중..." : "인증코드 보내기"}
            </button>

            <div style={{ marginTop: 8 }}>
              <input
                ref={otpRef}
                placeholder="인증코드 입력"
                disabled={disableAll}
                inputMode="numeric"
              />
              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={disableAll}
              >
                {loading ? "처리 중..." : "확인"}
              </button>
            </div>

            <p style={{ marginTop: 8, opacity: 0.8, fontSize: 13 }}>
              • 이메일은 "기존 가입 계정의 이메일"을 입력해야 합니다.
              <br />
              • 소셜 이메일과 다르면(구글에서 제공되는 경우) 서버가 거부할 수 있습니다.
            </p>
          </div>

          <hr style={{ margin: "16px 0" }} />

          {/* =========================
              3) 새 계정으로 계속
             ========================= */}
          <button type="button" onClick={handleContinueAsNew} disabled={disableAll}>
            {loading ? "처리 중..." : "새 계정으로 계속"}
          </button>

          <p style={{ marginTop: 12 }}>
            <Link to={ROUTE.LOGIN}>로그인으로 돌아가기</Link>
          </p>

          {/* ✅ 디버깅 도움(로컬 개발 단계에서만)
              - 토큰이 세팅되어야 버튼이 활성화됨
              - 운영에서는 제거하거나 숨겨도 됨 */}
          <p style={{ marginTop: 12, fontSize: 12, opacity: 0.7 }}>
            socialTempToken: {socialTempToken ? "✅ 있음" : "❌ 없음"}
          </p>
        </div>
      </div>
    </div>
  );
}
