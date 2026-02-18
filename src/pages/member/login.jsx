// ✅ 파일: src/pages/member/login.jsx
// ✅ 내집마련 UI/UX 업그레이드 버전 (기능 로직 유지 + UI 톤 통일)
// - 소셜 버튼을 "Primary(일반 로그인)" / "Social(서브 버튼)"로 분리
// - inline style 최소화(필요한 건 class로)
// - 메시지/체크박스/링크 영역 정렬 개선
// - Naver 안내(whiteSpace:pre-line)는 AuthMessage/오버레이 쪽에서 처리되므로 유지

import { useEffect, useRef, useState } from "react";
import { useUsersContext } from "../../context/useUsersContext";
import { AUTH_KEY, URL, USERS, STORAGE_KEY, FLASH_KEY, FLASH, ROUTE } from "../../config/constants";
import { Link, useLocation, useNavigate } from "react-router-dom";

import "../../assets/CSS/Auth.css";
import bg from "../../assets/images/background.png";

import AuthSidePanels from "../../components/AuthSidePanels";
import AuthMessage from "../../components/AuthMessage";

import { apiFetch } from "../../api/apiClient";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const usernameRef = useRef(null);
  const passwordRef = useRef(null);

  const { dispatch } = useUsersContext();

  // ✅ 체크박스 2개: 아이디 저장 / 로그인 유지
  const [saveId, setSaveId] = useState(false);
  const [keepLogin, setKeepLogin] = useState(false);

  // ✅ "아이디 저장"은 STORAGE_KEY.SAVED_USERNAME 사용
  const SAVED_USERNAME_KEY = STORAGE_KEY.SAVED_USERNAME;

  const [msg, setMsg] = useState({ type: "info", title: "", desc: "" });
  const [isLoading, setIsLoading] = useState(false);

  /**
   * ✅ auth 흔적 정리(실패/예외 방어)
   * - 인증 관련은 local/session 둘 다 제거
   * - 아이디 저장(savedUsername)은 사용자 편의니까 여기서 지우지 않음
   */
  const clearAuth = () => {
    localStorage.removeItem(AUTH_KEY.USERNAME);
    sessionStorage.removeItem(AUTH_KEY.USERNAME);

    localStorage.removeItem(STORAGE_KEY.ACCESS_TOKEN);
    sessionStorage.removeItem(STORAGE_KEY.ACCESS_TOKEN);

    // 혹시 AUTH_KEY.TOKEN을 직접 쓰는 코드가 있다면 보조로 제거
    localStorage.removeItem(AUTH_KEY.TOKEN);
    sessionStorage.removeItem(AUTH_KEY.TOKEN);

    dispatch({ type: USERS.LOGOUT });
  };

  // =========================================================
  // ✅ 소셜 로그인 시작 버튼들
  // =========================================================
  const startSocial = (targetUrl, providerLabel = "소셜", descOverride) => {
    if (isLoading) return;

    setMsg({
      type: "info",
      title: `${providerLabel} 로그인으로 이동합니다`,
      desc: descOverride || "잠시 후 인증 페이지로 이동합니다.",
    });

    window.location.href = targetUrl;
  };

  /** ✅ Google OAuth2 로그인 시작 */
  const handleGoogleLogin = () => startSocial(URL.OAUTH2_GOOGLE_AUTH, "Google");

  /** ✅ Kakao OAuth2 로그인 시작 */
  const handleKakaoLogin = () => startSocial(URL.OAUTH2_KAKAO_AUTH, "Kakao");

  /**
   * ✅ Naver OAuth2 로그인 시작 (P3-2)
   * - (선택) confirm 페이지 임시값 정리
   */
  const handleNaverLogin = () => {
    sessionStorage.removeItem("oauthProvider");
    sessionStorage.removeItem("oauthDisplayName");
    sessionStorage.removeItem("oauthEmail");

    startSocial(
      URL.OAUTH2_NAVER_AUTH,
      "Naver",
      "계정 확인을 위해 ‘확인 페이지’를 한 번 더 거칩니다.\n필요하면 네이버 로그인/동의 화면이 다시 표시될 수 있습니다."
    );
  };

  // =========================================================
  // ✅ 최초 진입: 저장된 아이디 + FLASH_TOAST 처리
  // =========================================================
  useEffect(() => {
    // 1) saved username (인증 아님)
    const saved = localStorage.getItem(SAVED_USERNAME_KEY);
    if (saved) {
      if (usernameRef.current) usernameRef.current.value = saved;
      setSaveId(true);

      setMsg({
        type: "info",
        title: "저장된 아이디가 있습니다",
        desc: "아이디가 자동으로 입력되었습니다. 비밀번호만 입력해 주세요.",
      });
    }

    // 2) flash toast(세션 만료/연결 필요/실패 등) → 카드 메시지로 1회 표시
    const flash = sessionStorage.getItem(FLASH_KEY.TOAST);
    if (!flash) return;

    // ✅ Login 페이지에서는 "성공" 플래시는 소비하지 않는다.
    if (flash === FLASH.SOCIAL_LOGIN_OK || flash === FLASH.GOOGLE_LOGIN_OK) return;

    sessionStorage.removeItem(FLASH_KEY.TOAST);

    if (flash === FLASH.SESSION_EXPIRED) {
      setMsg({
        type: "error",
        title: "세션이 만료되었습니다",
        desc: "안전하게 로그아웃되었습니다. 다시 로그인해 주세요.",
      });
    } else if (flash === FLASH.SESSION_INVALID) {
      setMsg({
        type: "error",
        title: "인증 정보가 유효하지 않습니다",
        desc: "토큰이 무효화되어 로그아웃되었습니다. 다시 로그인해 주세요.",
      });
    } else if (flash === FLASH.LINK_REQUIRED) {
      setMsg({
        type: "info",
        title: "계정 연결이 필요합니다",
        desc: "소셜 로그인 후 기존 계정과 연결을 진행해 주세요.",
      });
    } else if (flash === FLASH.OAUTH2_FALLBACK) {
      setMsg({
        type: "error",
        title: "로그인 처리가 중단되었습니다",
        desc: "잠시 후 다시 시도해 주세요.",
      });
    } else {
      setMsg({
        type: "info",
        title: "안내",
        desc: "다시 로그인해 주세요.",
      });
    }
  }, []);

  // =========================================================
  // ✅ 일반 로그인
  // =========================================================
  const handleLogin = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    const username = usernameRef.current?.value?.trim() || "";
    const password = passwordRef.current?.value || "";

    if (!username || !password) {
      setMsg({
        type: "error",
        title: "입력이 비어있어요",
        desc: "아이디와 비밀번호를 모두 입력해 주세요.",
      });
      return;
    }

    setIsLoading(true);
    setMsg({ type: "info", title: "", desc: "" });

    try {
      const data = await apiFetch(URL.AUTH_LOGIN, {
        method: "POST",
        body: { username, password },
      });

      if (data?.ok === false) {
        clearAuth();
        setMsg({
          type: "error",
          title: "로그인 실패",
          desc: data?.message || "아이디 또는 비밀번호가 일치하지 않습니다.",
        });
        return;
      }

      const token =
        data?.token ||
        data?.accessToken ||
        data?.jwt ||
        data?.data?.token ||
        data?.data?.accessToken ||
        data?.data?.jwt;

      if (!token) {
        clearAuth();
        setMsg({
          type: "error",
          title: "로그인 응답이 불완전합니다",
          desc: "서버가 토큰을 내려주지 않았습니다. 백엔드 LoginResponse를 확인해 주세요.",
        });
        return;
      }

      // ✅ 1) 아이디 저장(편의)
      if (saveId) localStorage.setItem(SAVED_USERNAME_KEY, username);
      else localStorage.removeItem(SAVED_USERNAME_KEY);

      /**
       * ✅ 2) 로그인 유지(인증 저장 위치 분기)
       * - keepLogin ON  → localStorage
       * - keepLogin OFF → sessionStorage
       */
      const storage = keepLogin ? localStorage : sessionStorage;
      const other = keepLogin ? sessionStorage : localStorage;

      storage.setItem(STORAGE_KEY.ACCESS_TOKEN, token);
      storage.setItem(AUTH_KEY.USERNAME, username);

      other.removeItem(STORAGE_KEY.ACCESS_TOKEN);
      other.removeItem(AUTH_KEY.USERNAME);

      // ✅ 호환: AUTH_KEY.TOKEN도 같이 맞춰 저장/정리
      storage.setItem(AUTH_KEY.TOKEN, token);
      other.removeItem(AUTH_KEY.TOKEN);

      dispatch({ type: USERS.LOGIN, isAuthenticated: username });

      const from = location.state?.from?.pathname || ROUTE.HOME;
      navigate(from, { replace: true });
    } catch (err) {
      clearAuth();

      const status = err?.status;
      const payload = err?.data || err?.body || err?.response?.data || err?.responseBody || null;
      const code = payload?.code || err?.code;
      const remainingSeconds = payload?.remainingSeconds ?? payload?.remainSeconds;

      if (status === 429) {
        if (code === "ACCOUNT_LOCKED") {
          const sec = Number(remainingSeconds ?? 0);
          setMsg({
            type: "error",
            title: "계정이 잠금 상태입니다",
            desc: sec > 0 ? `잠금 상태입니다. ${sec}초 후 다시 시도하세요.` : "잠금 상태입니다. 잠시 후 다시 시도하세요.",
          });
          return;
        }

        if (code === "RATE_LIMIT") {
          setMsg({
            type: "error",
            title: "요청이 너무 많습니다",
            desc: "요청이 너무 많습니다. 잠시 후 다시 시도하세요.",
          });
          return;
        }

        setMsg({
          type: "error",
          title: "요청 제한이 걸렸습니다",
          desc: "요청이 너무 많습니다. 잠시 후 다시 시도하세요.",
        });
        return;
      }

      if (status === 401) {
        setMsg({
          type: "error",
          title: "로그인 실패",
          desc: "아이디 또는 비밀번호가 일치하지 않습니다.",
        });
      } else if (status === 404) {
        setMsg({
          type: "error",
          title: "API 경로를 찾을 수 없습니다",
          desc: "URL.AUTH_LOGIN 또는 백엔드 라우팅을 확인해 주세요.",
        });
      } else {
        const text = err?.message || payload?.message || "로그인 중 오류가 발생했습니다.";
        setMsg({
          type: "error",
          title: "통신 오류",
          desc: text,
        });
      }

      console.error("LOGIN ERROR:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // =========================================================
  // ✅ UI
  // =========================================================
  return (
    <div className="auth-page">
      {/* ✅ desc에서 개행을 쓰니까 wrapper에 pre-line 적용 */}
      <div className="auth-grid" style={{ whiteSpace: "pre-line" }}>
        <AuthSidePanels
          left={{
            title: "로그인 안내",
            text:
              "• 일반 로그인: 아이디/비밀번호로 로그인합니다.\n" +
              "• Google 로그인: 구글 계정으로 로그인 후, 필요하면 기존 계정과 연결합니다.\n" +
              "• Kakao 로그인: 카카오 계정으로 로그인 후, 필요하면 기존 계정과 연결합니다.\n" +
              "• Naver 로그인: 네이버 계정으로 로그인 후, 확인 페이지를 한 번 더 거칩니다.\n" +
              "• 연결이 필요한 경우 ‘계정 연결’ 화면으로 자동 이동됩니다.",
            links: [
              { to: "/help", label: "고객센터" },
              { to: "/find-id", label: "아이디 찾기" },
              { to: "/find-pw", label: "비밀번호 찾기" },
              { to: "/signup", label: "회원가입" },
            ],
            notices: [
              "현재는 데모 버전입니다.",
              "일반 로그인은 Spring 로그인 API 기준으로 검사합니다.",
              "소셜 로그인은 OAuth2 인증 후 자동으로 처리됩니다.",
              "카카오 계정은 이메일 제공이 없을 수 있어 닉네임 기반으로 안내가 나올 수 있습니다.",
              "네이버 로그인은 force=1로 재로그인/재동의를 최대한 유도합니다.",
              "네이버는 자동 통과를 줄이기 위해 ‘확인 페이지’를 1회 거치도록 설계했습니다.",
            ],
            tips: [
              "로그인 후 게시판(/bbs) 및 사진(/photo) 이용이 가능합니다.",
              "비밀번호를 잊으면 비밀번호 찾기를 이용하세요.",
              "소셜 로그인 후 연결이 필요하면 안내 화면이 뜹니다.",
            ],
          }}
          right={{
            title: "가이드 영상",
            text: "story.mp4가 화면에 보이면 자동 재생됩니다.",
            videoSrc: "/video/story.mp4",
            videoControls: false,
            mediaTopText: "모든 집은, 작은 결심에서 시작됩니다.\n그 시작을 함께합니다.",
            mediaBottomText:
              "혼자 고민하던 시간이,\n함께하는 시작으로 바뀌는 순간입니다.\n그리고 그 시작은, 당신의 집으로 이어집니다.",
            footer: "💡 팁: 소셜 로그인 후 연결이 필요하면 자동으로 안내 화면으로 이동합니다.",
          }}
        />

        <main className="auth-canvas">
          <img className="auth-bg-img" src={bg} alt="" />

          <header className="auth-header">
            <Link to="/login" className="auth-logo">
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

          <section className="auth-hero auth-hero--login">
            <h1 className="auth-hero-title">로그인</h1>
            <p className="auth-hero-sub">내 집마련의 꿈, 여기서 시작하세요</p>
          </section>

          <section className="auth-card auth-card--login" aria-label="login form">
            {/* ✅ "일반 로그인"을 중심 CTA로 */}
            <form onSubmit={handleLogin}>
              <input
                ref={usernameRef}
                className="auth-input"
                type="text"
                placeholder="아이디"
                autoComplete="username"
                name="username"
                disabled={isLoading}
              />
              <input
                ref={passwordRef}
                className="auth-input"
                type="password"
                placeholder="비밀번호"
                autoComplete="current-password"
                name="password"
                disabled={isLoading}
              />

              <button className="auth-btn" type="submit" disabled={isLoading}>
                {isLoading ? "로그인 중..." : "로그인하기"}
              </button>

              {/* ✅ 소셜 로그인: 서브 버튼 그룹 */}
              <div className="auth-social">
                <div className="auth-social__title">소셜로 빠르게 시작하기</div>

                <div className="auth-social__grid">
                  <button
                    type="button"
                    className="auth-social-btn"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    aria-label="Google 로그인"
                  >
                    <span className="auth-social-ico" aria-hidden="true">G</span>
                    <span>Google</span>
                  </button>

                  <button
                    type="button"
                    className="auth-social-btn"
                    onClick={handleKakaoLogin}
                    disabled={isLoading}
                    aria-label="Kakao 로그인"
                  >
                    <span className="auth-social-ico" aria-hidden="true">K</span>
                    <span>Kakao</span>
                  </button>

                  <button
                    type="button"
                    className="auth-social-btn"
                    onClick={handleNaverLogin}
                    disabled={isLoading}
                    aria-label="Naver 로그인"
                  >
                    <span className="auth-social-ico" aria-hidden="true">N</span>
                    <span>Naver</span>
                  </button>
                </div>

                <div className="auth-social__hint">
                  ※ 소셜 로그인 후, 연결이 필요하면 ‘계정 연결’ 화면으로 안내됩니다.
                </div>
              </div>

              <AuthMessage type={msg.type} title={msg.title} desc={msg.desc} />

              <div className="auth-row auth-row--actions">
                {/* ✅ 아이디 저장(편의) */}
                <label className="auth-check">
                  <input
                    type="checkbox"
                    checked={saveId}
                    onChange={(e) => setSaveId(e.target.checked)}
                    disabled={isLoading}
                  />
                  <span>아이디 저장</span>
                </label>

                {/* ✅ 로그인 유지(인증 정책) */}
                <label className="auth-check">
                  <input
                    type="checkbox"
                    checked={keepLogin}
                    onChange={(e) => setKeepLogin(e.target.checked)}
                    disabled={isLoading}
                  />
                  <span>로그인 유지</span>
                </label>

                <div className="auth-links">
                  <Link to="/find-id">아이디 찾기</Link>
                  <span className="auth-sep">|</span>
                  <Link to="/find-pw">비밀번호 찾기</Link>
                  <span className="auth-sep">|</span>
                  <Link to="/signup" className="auth-signup-link">
                    회원가입하기
                  </Link>
                </div>
              </div>
            </form>
          </section>
        </main>
      </div>
    </div>
  );
}
