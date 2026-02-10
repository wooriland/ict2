import { useRef } from "react";
import { useUsersContext } from "../../context/useUsersContext";
import { AUTH_KEY, URL, USERS } from "../../config/constants";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";

import "../../assets/CSS/Auth.css";
import bg from "../../assets/images/background.png";

import AuthSidePanels from "../../components/AuthSidePanels";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const usernameRef = useRef(null);
  const passwordRef = useRef(null);

  const { dispatch } = useUsersContext();

  const handleLogin = (e) => {
    e.preventDefault();

    const username = usernameRef.current?.value?.trim() || "";
    const password = passwordRef.current?.value || "";

    if (!username || !password) {
      window.alert("아이디와 비밀번호를 입력하세요.");
      return;
    }

    // ✅ (중요) 이제 /api/users GET + filter 방식이 아니라
    // ✅ Spring 로그인 API로 POST 요청
    axios
      .post(
        URL.AUTH_LOGIN,
        { username, password },
        { headers: { "Content-Type": "application/json" } }
      )
      .then((res) => {
        // ✅ 성공 시: 세션 저장 + 전역 상태 업데이트 + 이동
        sessionStorage.setItem(AUTH_KEY.USERNAME, username);
        dispatch({ type: USERS.LOGIN, isAuthenticated: username });

        // ✅ 기존 흐름 유지: 원래 가려던 페이지가 있으면 그곳으로
        const from = location.state?.from || `/users/${username}`;
        navigate(from, { replace: true });
      })
      .catch((err) => {
        // ✅ 실패 시: 서버 응답 기반으로 메시지 표시
        const status = err?.response?.status;
        const msgFromServer =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.response?.data;

        if (status === 401 || status === 400) {
          window.alert("아이디와 비번 불일치");
        } else if (status === 404) {
          window.alert(
            "로그인 API를 찾을 수 없습니다. (URL.AUTH_LOGIN 경로 확인 필요)"
          );
        } else {
          window.alert("로그인 중 오류가 발생했습니다. 콘솔을 확인하세요.");
        }

        console.error("LOGIN ERROR:", status, msgFromServer || err);
      });
  };

  return (
    <div className="auth-page">
      <div className="auth-grid">
        {/* ✅ 좌/우 통짜 패널 + story.mp4 */}
        <AuthSidePanels
          left={{
            title: "안내 메뉴",
            text: "로그인 문제가 있으면 아래 기능을 이용하세요.",
            links: [
              { to: "/help", label: "고객센터" },
              { to: "/find-id", label: "아이디 찾기" },
              { to: "/find-pw", label: "비밀번호 찾기" },
              { to: "/signup", label: "회원가입" },
            ],
            notices: [
              "현재는 데모 버전입니다.",
              "아이디/비밀번호는 Spring 로그인 API 기준으로 검사합니다.",
            ],
            tips: [
              "로그인 후 게시판(/bbs) 및 사진(/photo) 이용이 가능합니다.",
              "비밀번호를 잊으면 비밀번호 찾기를 이용하세요.",
            ],
          }}
          right={{
            title: "가이드 영상",
            text: "story.mp4가 화면에 보이면 자동 재생됩니다.",
            videoSrc: "/video/story.mp4",
            videoControls: false,
          }}
        />

        {/* ✅ 가운데 캔버스 */}
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
                placeholder="아이디"
                autoComplete="username"
                name="username"
              />
              <input
                ref={passwordRef}
                className="auth-input"
                type="password"
                placeholder="비밀번호"
                autoComplete="current-password"
                name="password"
              />

              <button className="auth-btn" type="submit">
                로그인하기
              </button>

              <div className="auth-row">
                <label className="auth-check">
                  <input type="checkbox" />
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
