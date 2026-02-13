// ✅ 파일: src/pages/member/login.jsx
// UX 업그레이드 버전 (✅ 아이디 저장 / ✅ 로그인 유지 분리 적용 + ✅ Google/Kakao 소셜 로그인 확장)
// - alert 완전 제거 → AuthMessage 카드로만 안내
// - 로그인 실패(401)는 페이지 유지 + 헤더/스토리지 흔적 0
// - 세션 만료(다른 API 401) 시 FLASH_TOAST를 읽어 카드로 1회 안내
// - ✅ keepLogin(로그인 유지) ON → localStorage에 인증 저장
// - ✅ keepLogin(로그인 유지) OFF → sessionStorage에 인증 저장
// - ✅ saveId(아이디 저장) ON → localStorage.savedUsername에 username만 저장(인증 아님)
//
// ✅ (P3) 소셜 로그인 추가 포인트
// - Google 로그인 버튼 유지
// - ✅ Kakao 로그인 버튼 추가
// - OAuth2 성공/실패/세션만료 등은 OAuth2Redirect.jsx가 처리하고,
//   Login.jsx는 "FLASH_TOAST"에 따라 1회 메시지 카드만 보여준다.
//
// ✅ (추가 개선) "Google"에만 묶이지 않도록 토스트 문구를 '소셜 로그인' 중심으로 안전하게 구성
// - 기존 FLASH.GOOGLE_LOGIN_OK를 그대로 쓰되,
//   displayName/email은 Home에서 /me 조회 또는 sessionStorage(OAUTH2_DISPLAY_NAME)로 보완 가능

import { useEffect, useRef, useState } from "react";
import { useUsersContext } from "../../context/useUsersContext";
import {
  AUTH_KEY,
  URL,
  USERS,
  STORAGE_KEY,
  FLASH_KEY,
  FLASH,
} from "../../config/constants";
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
    // username(인증 부수정보)
    localStorage.removeItem(AUTH_KEY.USERNAME);
    sessionStorage.removeItem(AUTH_KEY.USERNAME);

    // token(인증 핵심)
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

  /**
   * ✅ Google OAuth2 로그인 시작
   * - 백엔드: /oauth2/authorization/google 로 이동
   */
  const handleGoogleLogin = () => {
    if (isLoading) return;

    setMsg({
      type: "info",
      title: "🔄 Google 로그인으로 이동합니다",
      desc: "잠시 후 Google 인증 페이지로 이동합니다.",
    });

    window.location.href = URL.OAUTH2_GOOGLE_AUTH;
  };

  /**
   * ✅ Kakao OAuth2 로그인 시작 (P3 추가)
   * - 백엔드: /oauth2/authorization/kakao 로 이동
   */
  const handleKakaoLogin = () => {
    if (isLoading) return;

    setMsg({
      type: "info",
      title: "🔄 Kakao 로그인으로 이동합니다",
      desc: "잠시 후 Kakao 인증 페이지로 이동합니다.",
    });

    // ✅ constants.js에 URL.OAUTH2_KAKAO_AUTH 추가되어 있어야 함
    window.location.href = URL.OAUTH2_KAKAO_AUTH;
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
        title: "📌 저장된 집 주소가 있습니다",
        desc: "아이디가 자동으로 입력되었습니다. 열쇠(비밀번호)만 입력해 주세요.",
      });
    }

    // 2) flash toast(세션 만료 등) → 카드 메시지로 1회 표시
    const flash = sessionStorage.getItem(FLASH_KEY.TOAST);
    if (flash) {
      sessionStorage.removeItem(FLASH_KEY.TOAST);

      /**
       * ✅ 여기의 메시지 목적:
       * - "세션 만료/무효" 또는 "소셜 연결 필요" 등
       * - Login 페이지에서 설명 카드 1회로만 보여주기
       *
       * ⚠️ 실제 소셜 로그인 성공 토스트는 보통 Home에서 1회 보여주는 게 자연스럽다.
       * - OAuth2Redirect.jsx가 HOME으로 보내면서 FLASH를 심어두면
       *   Home에서 1회 토스트를 띄울 수 있음.
       * - 그래도 Login이 먼저 열리는 시나리오(예: 실패)에서는 여기서 안내.
       */
      if (flash === FLASH.SESSION_EXPIRED) {
        setMsg({
          type: "error",
          title: "⏳ 세션이 만료되었습니다",
          desc: "안전하게 로그아웃되었습니다. 다시 로그인해 주세요.",
        });
      } else if (flash === FLASH.SESSION_INVALID) {
        setMsg({
          type: "error",
          title: "🧩 인증 정보가 유효하지 않습니다",
          desc: "토큰이 무효화되어 로그아웃되었습니다. 다시 로그인해 주세요.",
        });
      } else if (flash === FLASH.LINK_REQUIRED) {
        setMsg({
          type: "info",
          title: "🔗 계정 연결이 필요합니다",
          desc: "소셜 로그인 후 기존 계정과 연결을 진행해 주세요.",
        });
      } else if (flash === FLASH.GOOGLE_LOGIN_OK || flash === FLASH.SOCIAL_LOGIN_OK) {
        // ✅ 기존 키(GOOGLE_LOGIN_OK)를 유지하면서도 "소셜 로그인 완료"로 안전하게 표시
        setMsg({
          type: "success",
          title: "✅ 소셜 로그인 완료",
          desc: "계정 정보를 확인하는 중입니다.",
        });
      } else if (flash === FLASH.OAUTH2_FALLBACK) {
        setMsg({
          type: "error",
          title: "⚠️ 로그인 처리가 중단되었습니다",
          desc: "잠시 후 다시 시도해 주세요.",
        });
      } else {
        setMsg({
          type: "info",
          title: "안내",
          desc: "다시 로그인해 주세요.",
        });
      }
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
        title: "🧱 입력이 비어있어요",
        desc: "아이디(집 주소)와 비밀번호(열쇠)를 모두 입력해 주세요.",
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

      // ✅ 서버가 200 + {ok:false} 형태로 실패를 줄 수도 있으니 방어
      if (data?.ok === false) {
        clearAuth();
        setMsg({
          type: "error",
          title: "🔒 로그인 실패",
          desc: data?.message || "아이디 또는 비밀번호가 일치하지 않습니다.",
        });
        return;
      }

      // ✅ 토큰 추출 (백엔드 응답 변화 대비)
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
          title: "⚠️ 로그인 응답이 불완전합니다",
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

      // ✅ 인증 정보 저장(선택된 저장소에만)
      storage.setItem(STORAGE_KEY.ACCESS_TOKEN, token);
      storage.setItem(AUTH_KEY.USERNAME, username);

      // ✅ 반대 저장소 찌꺼기 제거
      other.removeItem(STORAGE_KEY.ACCESS_TOKEN);
      other.removeItem(AUTH_KEY.USERNAME);

      // ✅ 호환: AUTH_KEY.TOKEN도 같이 맞춰 저장/정리
      storage.setItem(AUTH_KEY.TOKEN, token);
      other.removeItem(AUTH_KEY.TOKEN);

      // ✅ 전역 상태 반영
      dispatch({ type: USERS.LOGIN, isAuthenticated: username });

      setMsg({
        type: "success",
        title: "🔑 로그인 성공!",
        desc: "내 집으로 이동합니다.",
      });

      const from = location.state?.from?.pathname || "/";

      setTimeout(() => {
        navigate(from, { replace: true });
      }, 600);
    } catch (err) {
      clearAuth();

      const text = err?.message || "로그인 중 오류가 발생했습니다.";
      const status = err?.status;

      if (status === 401) {
        setMsg({
          type: "error",
          title: "🔒 로그인 실패",
          desc: "아이디 또는 비밀번호가 일치하지 않습니다.",
        });
      } else if (status === 404) {
        setMsg({
          type: "error",
          title: "🧭 API 경로를 찾을 수 없습니다",
          desc: "URL.AUTH_LOGIN 또는 백엔드 라우팅을 확인해 주세요.",
        });
      } else {
        setMsg({
          type: "error",
          title: "📡 통신 오류",
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
      <div className="auth-grid" style={{ whiteSpace: "pre-line" }}>
        <AuthSidePanels
          left={{
            title: "로그인 안내",
            text:
              "• 일반 로그인: 아이디/비밀번호로 로그인합니다.\n" +
              "• Google 로그인: 구글 계정으로 로그인 후, 필요하면 기존 계정과 연결합니다.\n" +
              "• Kakao 로그인: 카카오 계정으로 로그인 후, 필요하면 기존 계정과 연결합니다.\n" +
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

            // ✅ 영상 위(overlay)
            mediaTopText: "모든 집은, 작은 결심에서 시작됩니다.\n그 시작을 함께합니다.",

            // ✅ 영상 아래(caption)
            mediaBottomText:
              "혼자 고민하던 시간이,\n함께하는 시작으로 바뀌는 순간입니다.\n그리고 그 시작은, 당신의 집으로 이어집니다.",
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
            <p className="auth-hero-sub">내 집마련의 꿈, 여기서 로그인하고 시작하세요!</p>
          </section>

          <section className="auth-card auth-card--login" aria-label="login form">
            <form onSubmit={handleLogin}>
              <input
                ref={usernameRef}
                className="auth-input"
                type="text"
                placeholder="아이디 (집 주소)"
                autoComplete="username"
                name="username"
                disabled={isLoading}
              />
              <input
                ref={passwordRef}
                className="auth-input"
                type="password"
                placeholder="비밀번호 (열쇠)"
                autoComplete="current-password"
                name="password"
                disabled={isLoading}
              />

              <button className="auth-btn" type="submit" disabled={isLoading}>
                {isLoading ? "문을 여는 중..." : "로그인하기"}
              </button>

              {/* ✅ 소셜 로그인 버튼 영역 */}
              <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
                <button
                  type="button"
                  className="auth-btn"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  style={{ flex: 1 }}
                >
                  {isLoading ? "처리 중..." : "Google 로그인"}
                </button>

                <button
                  type="button"
                  className="auth-btn"
                  onClick={handleKakaoLogin}
                  disabled={isLoading}
                  style={{ flex: 1 }}
                >
                  {isLoading ? "처리 중..." : "Kakao 로그인"}
                </button>
              </div>

              <AuthMessage type={msg.type} title={msg.title} desc={msg.desc} />

              <div className="auth-row" style={{ alignItems: "center", gap: 14 }}>
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
