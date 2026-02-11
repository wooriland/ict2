// src/pages/member/login.jsx

import { useEffect, useRef, useState } from "react";
import { useUsersContext } from "../../context/useUsersContext";
import { AUTH_KEY, URL, USERS } from "../../config/constants";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";

import "../../assets/CSS/Auth.css";
import bg from "../../assets/images/background.png";

import AuthSidePanels from "../../components/AuthSidePanels";
import AuthMessage from "../../components/AuthMessage"; // ✅ 카드 메시지 컴포넌트

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const usernameRef = useRef(null);
  const passwordRef = useRef(null);

  const { dispatch } = useUsersContext();

  const [saveId, setSaveId] = useState(false);
  const SAVED_USERNAME_KEY = "saved_username";

  // ✅ alert 대신 카드 메시지 상태
  // type: "success" | "error" | "info"
  const [msg, setMsg] = useState({ type: "info", title: "", desc: "" });

  // ✅ 로그인 요청 중 중복 클릭 방지 + 버튼 텍스트 변경
  const [isLoading, setIsLoading] = useState(false);

  // =========================================================
  // ✅ [추가] Google OAuth2 로그인 시작
  // - 버튼 클릭 -> 백엔드 /oauth2/authorization/google로 이동
  // =========================================================
  const handleGoogleLogin = () => {
    // ✅ 이미 로그인 요청 중이면(일반 로그인), 소셜 이동도 막기(선택)
    if (isLoading) return;

    // ✅ UX: 카드 안내 메시지(선택)
    setMsg({
      type: "info",
      title: "🔄 Google 로그인으로 이동합니다",
      desc: "잠시 후 Google 인증 페이지로 이동합니다.",
    });

    // ✅ 백엔드 OAuth2 시작점으로 이동 (Spring Security가 구글로 리다이렉트)
    window.location.href = URL.OAUTH2_GOOGLE_AUTH;
  };

  useEffect(() => {
    const saved = localStorage.getItem(SAVED_USERNAME_KEY);
    if (saved) {
      if (usernameRef.current) usernameRef.current.value = saved;
      setSaveId(true);

      // ✅ (선택) 저장된 아이디가 있으면 "안내" 메시지로 UX 업그레이드
      setMsg({
        type: "info",
        title: "📌 저장된 집 주소가 있습니다",
        desc: "아이디가 자동으로 입력되었습니다. 열쇠(비밀번호)만 입력해 주세요.",
      });
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();

    // ✅ 이미 로그인 요청 중이면 무시(연타 방지)
    if (isLoading) return;

    const username = usernameRef.current?.value?.trim() || "";
    const password = passwordRef.current?.value || "";

    // ✅ 1) 입력값 검증: alert -> 카드 메시지
    if (!username || !password) {
      setMsg({
        type: "error",
        title: "🧱 아직 벽돌이 다 채워지지 않았어요",
        desc: "아이디(집 주소)와 비밀번호(열쇠)를 모두 입력해야 문이 열립니다.",
      });
      return;
    }

    // ✅ 2) 요청 시작: 로딩 ON + 기존 메시지 초기화(선택)
    setIsLoading(true);
    setMsg({ type: "info", title: "", desc: "" });

    axios
      .post(
        URL.AUTH_LOGIN,
        { username, password },
        { headers: { "Content-Type": "application/json" } }
      )
      .then(() => {
        // ✅ 3) 아이디 저장
        if (saveId) localStorage.setItem(SAVED_USERNAME_KEY, username);
        else localStorage.removeItem(SAVED_USERNAME_KEY);

        // ✅ 4) 로그인 유지: localStorage + sessionStorage 동시 저장(호환)
        localStorage.setItem(AUTH_KEY.USERNAME, username);
        sessionStorage.setItem(AUTH_KEY.USERNAME, username);

        // ✅ 5) 전역 인증 상태 반영
        dispatch({ type: USERS.LOGIN, isAuthenticated: username });

        // ✅ 6) 성공 메시지 + 2초 후 자동 이동 (내집마련 컨셉)
        setMsg({
          type: "success",
          title: "🔑 문이 열렸습니다!",
          desc: "내 집으로 들어가는 중입니다… 2초 뒤 이동합니다.",
        });

        // ✅ AuthRoute가 state={{from: location}} 로 저장했으므로 from.pathname으로 복귀
        // ✅ 기본값은 "/" (Home)
        const from = location.state?.from?.pathname || "/";

        // ✅ 2초 후 이동
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 2000);
      })
      .catch((err) => {
        // ✅ 실패 시에도 로딩은 풀어줘야 한다
        const status = err?.response?.status;
        const msgFromServer =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.response?.data;

        // ✅ 7) 실패 메시지: alert -> 카드 메시지
        if (status === 401 || status === 400) {
          setMsg({
            type: "error",
            title: "🔒 열쇠가 맞지 않습니다",
            desc: "아이디 또는 비밀번호가 일치하지 않습니다. 다시 확인해 주세요.",
          });
        } else if (status === 404) {
          setMsg({
            type: "error",
            title: "🧭 길을 잃었습니다 (API 없음)",
            desc: "로그인 API를 찾을 수 없습니다. URL.AUTH_LOGIN 경로를 확인해 주세요.",
          });
        } else {
          setMsg({
            type: "error",
            title: "📡 통신이 불안정합니다",
            desc: "로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
          });
        }

        console.error("LOGIN ERROR:", status, msgFromServer || err);
      })
      .finally(() => {
        // ✅ 성공이든 실패든 요청이 끝났으니 로딩 OFF
        // (성공이면 2초 뒤 이동하지만, 버튼은 즉시 풀려도 UX상 문제 없음)
        setIsLoading(false);
      });
  };

  return (
    <div className="auth-page">
      <div className="auth-grid">
        <AuthSidePanels
          left={{
            // ✅ [수정] 왼쪽 패널을 "로그인 안내" 중심으로 강화
            title: "로그인 안내",
            text:
              "• 일반 로그인: 아이디/비밀번호로 로그인합니다.\n" +
              "• Google 로그인: 구글 계정으로 로그인 후, 필요하면 기존 계정과 연결합니다.\n" +
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
              "Google 로그인은 OAuth2 인증 후 자동으로 처리됩니다.",
            ],
            tips: [
              "로그인 후 게시판(/bbs) 및 사진(/photo) 이용이 가능합니다.",
              "비밀번호를 잊으면 비밀번호 찾기를 이용하세요.",
              "Google 로그인 후 연결이 필요하면 안내 화면이 뜹니다.",
            ],
          }}
          right={{
            title: "가이드 영상",
            text: "story.mp4가 화면에 보이면 자동 재생됩니다.",
            videoSrc: "/video/story.mp4",
            videoControls: false,
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
            <p className="auth-hero-sub">
              내 집마련의 꿈, 여기서 로그인하고 시작하세요!
            </p>
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
                disabled={isLoading} // ✅ 요청 중 입력 잠금(선택)
              />
              <input
                ref={passwordRef}
                className="auth-input"
                type="password"
                placeholder="비밀번호 (열쇠)"
                autoComplete="current-password"
                name="password"
                disabled={isLoading} // ✅ 요청 중 입력 잠금(선택)
              />

              <button className="auth-btn" type="submit" disabled={isLoading}>
                {isLoading ? "문을 여는 중..." : "로그인하기"}
              </button>

              {/* =========================================================
                  ✅ [추가] 소셜 로그인 버튼 영역
                  - 일반 로그인과 구분되도록 버튼을 아래에 배치
                  ========================================================= */}
              <div style={{ marginTop: 12 }}>
                <button
                  type="button"
                  className="auth-btn"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                >
                  {isLoading ? "처리 중..." : "Google 로그인"}
                </button>
              </div>

              {/* ✅ alert 대신 카드 내부 메시지 */}
              <AuthMessage type={msg.type} title={msg.title} desc={msg.desc} />

              <div className="auth-row">
                <label className="auth-check">
                  <input
                    type="checkbox"
                    checked={saveId}
                    onChange={(e) => setSaveId(e.target.checked)}
                    disabled={isLoading} // ✅ 요청 중 체크 변경 방지(선택)
                  />
                  <span>아이디 저장</span>
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
