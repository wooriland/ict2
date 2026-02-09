import { Link } from "react-router-dom";
import "../../assets/CSS/Auth.css";
import bg from "../../assets/images/background.png";

import AuthSidePanels from "../../components/AuthSidePanels";

export default function FindPw() {
  const handleSubmit = (e) => {
    e.preventDefault();
    window.alert("비밀번호 재설정 기능은 추후 구현 예정입니다.");
  };

  return (
    <div className="auth-page">
      <div className="auth-grid">
        {/* ✅ 좌/우 통짜 패널 + story.mp4 */}
        <AuthSidePanels
          left={{
            title: "비밀번호 도움말",
            text: "비밀번호 재설정은 아래 순서로 진행됩니다.",
            links: [
              { to: "/help", label: "고객센터" },
              { to: "/login", label: "로그인" },
              { to: "/find-id", label: "아이디 찾기" },
              { to: "/signup", label: "회원가입" },
            ],
            notices: ["현재는 임시 폼입니다.", "추후 본인 인증 기능이 추가됩니다."],
            tips: [
              "일반적으로 '아이디 확인 → 본인 인증 → 재설정' 순서로 진행됩니다.",
              "정확한 아이디를 입력해야 합니다.",
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

          <section className="auth-hero">
            <h1 className="auth-hero-title">비밀번호 찾기</h1>
            <p className="auth-hero-sub">아이디 확인 후 재설정 안내를 받습니다.</p>
          </section>

          <section className="auth-card auth-card--find" aria-label="find password form">
            <form onSubmit={handleSubmit}>
              <input
                className="auth-input auth-input--login"
                type="text"
                placeholder="아이디"
                autoComplete="username"
              />

              <button className="auth-btn auth-btn--login" type="submit">
                재설정 안내 받기
              </button>

              <div className="auth-row" style={{ justifyContent: "flex-end" }}>
                <div className="auth-links">
                  <Link to="/login">로그인으로 돌아가기</Link>
                </div>
              </div>
            </form>
          </section>
        </main>
      </div>
    </div>
  );
}
