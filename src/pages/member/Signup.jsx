import { useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import { URL } from "../../config/constants";

import "../../assets/CSS/Auth.css";
import bg from "../../assets/images/background.png";

import AuthSidePanels from "../../components/AuthSidePanels";

export default function Signup() {
  const navigate = useNavigate();

  const usernameRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmRef = useRef(null);

  const handleSignup = async (e) => {
    e.preventDefault();

    const username = usernameRef.current?.value?.trim() || "";
    const password = passwordRef.current?.value || "";
    const confirm = confirmRef.current?.value || "";

    if (!username || !password || !confirm) {
      window.alert("모든 항목을 입력하세요.");
      return;
    }
    if (password !== confirm) {
      window.alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const res = await axios.get(URL.USERS);
      const exists = res.data?.some((u) => u.username === username);

      if (exists) {
        window.alert("이미 사용 중인 아이디입니다.");
        return;
      }

      await axios.post(URL.USERS, { username, password });

      window.alert("회원가입이 완료되었습니다. 로그인 해주세요!");
      navigate("/login", { replace: true });
    } catch (err) {
      console.log(err);
      window.alert("회원가입 처리 중 오류가 발생했습니다. (콘솔 확인)");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-grid">
        {/* ✅ 좌/우 통짜 패널 + story.mp4 */}
        <AuthSidePanels
          left={{
            title: "가입 안내",
            text: "회원가입 전 아래 내용을 확인해주세요.",
            links: [
              { to: "/help", label: "고객센터" },
              { to: "/login", label: "로그인" },
              { to: "/find-id", label: "아이디 찾기" },
              { to: "/find-pw", label: "비밀번호 찾기" },
            ],
            notices: [
              "아이디는 중복 불가(USERS 데이터 기준)",
              "비밀번호는 추후 정책(길이/특수문자) 적용 가능",
            ],
            tips: [
              "가입 완료 후 로그인 화면으로 이동합니다.",
              "오류가 나면 콘솔에서 네트워크 응답을 확인하세요.",
            ],
          }}
          right={{
            title: "가입 가이드",
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
              <Link to="/login">로그인</Link>
              <span className="auth-header-sep">|</span>
              <Link to="/help">고객센터</Link>
            </nav>
          </header>

          <section className="auth-hero auth-hero--signup">
            <h1 className="auth-hero-title">회원가입</h1>
            <p className="auth-hero-sub">
              내집마련의 시작! 간단히 가입하고 참여하세요.
            </p>
          </section>

          <section className="auth-card auth-card--signup" aria-label="signup form">
            <form onSubmit={handleSignup}>
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
                autoComplete="new-password"
                name="password"
              />
              <input
                ref={confirmRef}
                className="auth-input"
                type="password"
                placeholder="비밀번호 확인"
                autoComplete="new-password"
                name="confirm"
              />

              <button className="auth-btn" type="submit">
                가입하기
              </button>

              <div className="auth-row">
                <div className="auth-links">
                  <Link to="/login">이미 계정이 있나요? 로그인</Link>
                </div>
              </div>
            </form>
          </section>
        </main>
      </div>
    </div>
  );
}
