// ✅ 파일: src/pages/member/LinkAccount.jsx
//
// ✅ P3 소셜 확장 + P0 안정화 스타일(내집마련 Auth 톤) 최종본
// - 가운데 캔버스(배경) + 카드 UI로 통일
// - Auth.css(auth-card/auth-input/auth-btn/auth-row/auth-divider) 규격 사용
// - apiFetch(apiClient) 통일 + constants(FLASH_KEY/FLASH/PATH) 사용
// - 토큰 저장: 최종 JWT는 localStorage 저장(소셜 흐름과 동일)
// - displayName(OAUTH2_DISPLAY_NAME) 활용(없어도 정상)
// - socialTempToken: queryParam > localStorage
// - StrictMode 중복 실행 방지(useRef)

import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";

import "../../assets/CSS/Auth.css";
import bg from "../../assets/images/background.png";

import AuthSidePanels from "../../components/AuthSidePanels";
import AuthMessage from "../../components/AuthMessage";

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

  // ✅ 카드 메시지(지속 안내)
  const [msg, setMsg] = useState({ type: "info", title: "", desc: "" });

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
    const dn = sessionStorage.getItem("OAUTH2_DISPLAY_NAME") || "";
    setDisplayName(dn);

    // 3) OAuth2Redirect에서 넘긴 FLASH가 있다면 여기서 토스트 1번만
    const flash = sessionStorage.getItem(FLASH_KEY.TOAST);

    if (flash) {
      sessionStorage.removeItem(FLASH_KEY.TOAST);

      if (flash === FLASH.LINK_REQUIRED) {
        const text = dn
          ? `${dn} 계정으로 로그인하셨습니다. 기존 계정과 연결을 진행해주세요.`
          : "계정 연결이 필요합니다. 아래 방법으로 연결해주세요.";

        toast.info(text, { toastId: "link-required-page" });
        setMsg({
          type: "info",
          title: "🔗 계정 연결이 필요합니다",
          desc: text,
        });
      } else {
        toast.info("계정 연결을 진행해주세요.", { toastId: "link-generic" });
        setMsg({
          type: "info",
          title: "계정 연결",
          desc: "아래 방법 중 하나로 계정을 연결해 주세요.",
        });
      }
    } else {
      // flash가 없어도 기본 안내(UX)
      setMsg({
        type: "info",
        title: "계정 연결",
        desc:
          "소셜 로그인은 성공했지만 기존 계정과 연결이 필요합니다.\n" +
          "아래 방법 중 하나를 선택해 진행해 주세요.",
      });
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
   */
  const saveFinalToken = (token) => {
    localStorage.setItem(STORAGE_KEY.ACCESS_TOKEN, token);
    localStorage.removeItem(STORAGE_KEY.SOCIAL_TEMP_TOKEN);

    // ✅ session에 남아있는 토큰 흔적 정리(혼선 방지)
    sessionStorage.removeItem(STORAGE_KEY.ACCESS_TOKEN);
    sessionStorage.removeItem(STORAGE_KEY.SOCIAL_TEMP_TOKEN);
  };

  const pickToken = (res) =>
    res?.token ||
    res?.accessToken ||
    res?.jwt ||
    res?.data?.token ||
    res?.data?.accessToken ||
    res?.data?.jwt;

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
      setMsg({
        type: "error",
        title: "🧱 입력이 비어있어요",
        desc: "아이디와 비밀번호를 모두 입력해 주세요.",
      });
      return;
    }

    try {
      setLoading(true);
      setMsg({ type: "info", title: "연결 중...", desc: "아이디/비밀번호로 계정을 연결하고 있어요." });

      const res = await apiFetch(PATH.OAUTH2_LINK_PASSWORD, {
        method: "POST",
        body: { socialTempToken, username, password },
      });

      const token = pickToken(res);

      if (!token) {
        toast.error("연결은 되었지만 토큰이 없습니다. 백엔드 응답을 확인하세요.", {
          toastId: "link-pw-no-token",
        });
        setMsg({
          type: "error",
          title: "⚠️ 토큰 누락",
          desc: "연결 응답에 토큰이 없습니다. 백엔드 응답 구조를 확인해 주세요.",
        });
        return;
      }

      saveFinalToken(token);

      // ✅ 메인에서 "연결 완료" 토스트 1회
      sessionStorage.setItem(FLASH_KEY.TOAST, FLASH.LINK_OK);

      navigate(ROUTE.HOME, { replace: true });
    } catch (err) {
      const text =
        err?.data?.message ||
        err?.message ||
        "연결 실패(아이디/비밀번호). 입력 값을 확인하세요.";

      toast.error(text, { toastId: "link-pw-fail" });
      setMsg({
        type: "error",
        title: "🔒 연결 실패",
        desc: text,
      });

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
      setMsg({
        type: "error",
        title: "📮 이메일이 필요해요",
        desc: "기존 가입 계정의 이메일을 입력해 주세요.",
      });
      return;
    }

    try {
      setLoading(true);
      setMsg({
        type: "info",
        title: "📨 인증코드 발송 중...",
        desc: "이메일로 인증코드를 보내고 있어요.",
      });

      await apiFetch(PATH.OAUTH2_OTP_SEND, {
        method: "POST",
        body: { socialTempToken, email },
      });

      toast.success("인증코드를 이메일로 보냈습니다.", { toastId: "otp-sent" });
      setMsg({
        type: "success",
        title: "📨 인증코드 발송 완료",
        desc: "메일함(스팸함 포함)을 확인하고 6자리 코드를 입력해 주세요.",
      });

      setTimeout(() => otpRef.current?.focus(), 0);
    } catch (err) {
      const text =
        err?.data?.message || err?.message || "OTP 발송 실패. 잠시 후 다시 시도해주세요.";

      toast.error(text, { toastId: "otp-send-fail" });
      setMsg({
        type: "error",
        title: "📨 발송 실패",
        desc: text,
      });

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
      setMsg({
        type: "error",
        title: "🔢 입력이 비어있어요",
        desc: "이메일과 인증코드를 모두 입력해 주세요.",
      });
      return;
    }

    try {
      setLoading(true);
      setMsg({
        type: "info",
        title: "✅ 인증 확인 중...",
        desc: "인증코드를 확인하고 있어요.",
      });

      const res = await apiFetch(PATH.OAUTH2_OTP_VERIFY, {
        method: "POST",
        body: { socialTempToken, email, code },
      });

      const token = pickToken(res);

      if (!token) {
        toast.error("토큰이 없습니다. 백엔드 응답 확인 필요", {
          toastId: "otp-no-token",
        });
        setMsg({
          type: "error",
          title: "⚠️ 토큰 누락",
          desc: "인증은 되었지만 토큰이 없습니다. 백엔드 응답 구조를 확인해 주세요.",
        });
        return;
      }

      saveFinalToken(token);

      sessionStorage.setItem(FLASH_KEY.TOAST, FLASH.LINK_OK);

      navigate(ROUTE.HOME, { replace: true });
    } catch (err) {
      const text =
        err?.data?.message || err?.message || "OTP 인증 실패. 코드를 확인해주세요.";

      toast.error(text, { toastId: "otp-verify-fail" });
      setMsg({
        type: "error",
        title: "❌ 인증 실패",
        desc: text,
      });

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
      setMsg({
        type: "info",
        title: "새 계정 생성 중...",
        desc: "소셜 계정으로 새 계정을 생성하고 있어요.",
      });

      const res = await apiFetch(PATH.OAUTH2_CONTINUE_NEW, {
        method: "POST",
        body: { socialTempToken },
      });

      const token = pickToken(res);

      if (!token) {
        toast.error("토큰이 없습니다. 백엔드 응답 확인 필요", {
          toastId: "continue-new-no-token",
        });
        setMsg({
          type: "error",
          title: "⚠️ 토큰 누락",
          desc: "응답에 토큰이 없습니다. 백엔드 응답 구조를 확인해 주세요.",
        });
        return;
      }

      saveFinalToken(token);

      // ✅ Home에서 1회 환영 토스트 처리(기존 호환 유지)
      sessionStorage.setItem(FLASH_KEY.TOAST, FLASH.GOOGLE_LOGIN_OK);

      navigate(ROUTE.HOME, { replace: true });
    } catch (err) {
      const text =
        err?.data?.message || err?.message || "새 계정 진행 실패. 잠시 후 다시 시도해주세요.";

      toast.error(text, { toastId: "continue-new-fail" });
      setMsg({
        type: "error",
        title: "🚧 새 계정 생성 실패",
        desc: text,
      });

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
      <div className="auth-grid" style={{ whiteSpace: "pre-line" }}>
        <AuthSidePanels
          left={{
            title: "계정 연결 안내",
            text:
              (displayName ? `• ${displayName} 계정으로 로그인하셨습니다.\n\n` : "") +
              "소셜 로그인은 성공했지만,\n기존 계정과 연결이 필요한 상태입니다.\n\n" +
              "방법 1) 아이디/비밀번호로 연결\n" +
              "방법 2) 이메일 인증(OTP)으로 연결\n\n" +
              "처음 방문이라면 ‘새 계정으로 계속’을 선택할 수 있습니다.",
            links: [
              { to: ROUTE.LOGIN, label: "로그인으로" },
              { to: "/signup", label: "회원가입" },
              { to: "/help", label: "고객센터" },
            ],
            notices: [
              "이메일 OTP는 ‘기존 가입 계정의 이메일’로만 동작합니다.",
              "소셜 이메일과 다를 수 있습니다(특히 카카오).",
            ],
            tips: [
              "연결이 완료되면 자동으로 로그인됩니다.",
              "토큰이 없으면 다시 로그인부터 진행해야 합니다.",
            ],
          }}
          right={{
            title: "연결 방법 선택",
            text:
              "이미 가입한 계정이 있다면 ‘연결’을 추천합니다.\n" +
              "처음이라면 ‘새 계정으로 계속’으로 진행할 수 있습니다.",
            mediaTopText: "연결은 ‘한 번’만 하면 됩니다.\n이후부터는 소셜로 바로 로그인!",
            mediaBottomText: "안전한 연결을 위해\n토큰/세션을 정리하며 진행합니다.",
          }}
        />

        <main className="auth-canvas">
          <img className="auth-bg-img" src={bg} alt="" />

          <header className="auth-header">
            <Link to={ROUTE.LOGIN} className="auth-logo">
              <span className="auth-logo-mark">🏠</span>
              <div className="auth-logo-text">
                <div className="auth-logo-sub">중간프로젝트</div>
                <div className="auth-logo-main">내집마련</div>
              </div>
            </Link>

            <nav className="auth-header-links">
              <Link to="/signup">회원가입</Link>
              <span className="auth-header-sep">|</span>
              <Link to="/help">고객센터</Link>
            </nav>
          </header>

          <section className="auth-hero">
            <h1 className="auth-hero-title">계정 연결</h1>
            <p className="auth-hero-sub">
              {displayName ? `${displayName} 계정으로 로그인하셨어요. 연결을 완료해 주세요.` : "연결을 완료해 주세요."}
            </p>
          </section>

          <section className="auth-card" aria-label="link account card">
            {/* ✅ 상단 안내 카드 메시지 */}
            <AuthMessage type={msg.type} title={msg.title} desc={msg.desc} />

            {/* =========================
                1) 아이디/비밀번호 연결
               ========================= */}
            <div style={{ marginTop: 14 }}>
              <h3 className="auth-card__title" style={{ marginBottom: 6 }}>
                아이디/비밀번호로 연결
              </h3>
              <p className="auth-card__desc">
                기존 계정의 아이디/비밀번호로 연결하면, 이후부터 소셜로 바로 로그인됩니다.
              </p>

              <form onSubmit={handleLinkWithPassword}>
                <input
                  ref={usernameRef}
                  className="auth-input"
                  placeholder="아이디 (집 주소)"
                  disabled={disableAll}
                  autoComplete="username"
                />
                <input
                  ref={passwordRef}
                  className="auth-input"
                  type="password"
                  placeholder="비밀번호 (열쇠)"
                  disabled={disableAll}
                  autoComplete="current-password"
                />

                <button className="auth-btn" type="submit" disabled={disableAll}>
                  {loading ? "연결 중..." : "연결하기"}
                </button>
              </form>
            </div>

            <div className="auth-divider" />

            {/* =========================
                2) OTP 연결
               ========================= */}
            <div>
              <h3 className="auth-card__title" style={{ marginBottom: 6 }}>
                이메일 OTP로 연결
              </h3>
              <p className="auth-card__desc">
                기존 가입 계정의 이메일로 인증코드를 받아 연결할 수 있습니다.
              </p>

              <input
                ref={emailRef}
                className="auth-input"
                placeholder="이메일 (기존 가입 계정)"
                disabled={disableAll}
                autoComplete="email"
              />

              <div className="auth-row auth-row--compact">
                <button
                  type="button"
                  className="auth-btn auth-btn--mini"
                  onClick={handleSendOtp}
                  disabled={disableAll}
                  style={{ flex: 1 }}
                >
                  {loading ? "처리 중..." : "인증코드 보내기"}
                </button>
              </div>

              <div className="auth-row auth-row--compact">
                <input
                  ref={otpRef}
                  className="auth-input"
                  placeholder="인증코드 6자리"
                  disabled={disableAll}
                  inputMode="numeric"
                  style={{ flex: 1, marginBottom: 0 }}
                />
                <button
                  type="button"
                  className="auth-btn auth-btn--mini"
                  onClick={handleVerifyOtp}
                  disabled={disableAll}
                  style={{ flex: 1 }}
                >
                  {loading ? "처리 중..." : "인증 확인"}
                </button>
              </div>

              <div className="auth-input-hint">
                • 이메일은 “기존 가입 계정의 이메일”을 입력해야 합니다.{"\n"}
                • 소셜 이메일과 다르면 서버가 거부할 수 있습니다.
              </div>
            </div>

            <div className="auth-divider" />

            {/* =========================
                3) 새 계정으로 계속
               ========================= */}
            <div>
              <h3 className="auth-card__title" style={{ marginBottom: 6 }}>
                새 계정으로 계속
              </h3>
              <p className="auth-card__desc">
                처음 방문이라면 새 계정을 생성하고 바로 시작할 수 있습니다.
              </p>

              <button className="auth-btn" type="button" onClick={handleContinueAsNew} disabled={disableAll}>
                {loading ? "처리 중..." : "새 계정으로 계속"}
              </button>
            </div>

            <div className="auth-row" style={{ justifyContent: "flex-start" }}>
              <div className="auth-links">
                <Link to={ROUTE.LOGIN}>로그인으로 돌아가기</Link>
              </div>
            </div>

            {/* ✅ 디버깅(로컬) */}
            <div className="auth-input-hint" style={{ marginTop: 10, opacity: 0.75 }}>
              socialTempToken: {socialTempToken ? "✅ 있음" : "❌ 없음"}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
