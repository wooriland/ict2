import { Link } from "react-router-dom";
import "../../assets/CSS/Auth.css";
import bg from "../../assets/images/background.png";

import AuthSidePanels from "../../components/AuthSidePanels";

export default function FindId() {
  const handleSubmit = (e) => {
    e.preventDefault();
    window.alert("아이디 찾기 기능은 추후 구현 예정입니다.");
  };

  return (
    <div className="auth-page">
      <div className="auth-grid">
        {/* ✅ 좌/우 통짜 패널 + story.mp4 */}
        <AuthSidePanels
          left={{
            title: "도움말",
            text: "아이디를 잊으셨나요? 아래 메뉴를 이용하세요.",
            links: [
              { to: "/help", label: "고객센터" },
              { to: "/login", label: "로그인" },
              { to: "/find-pw", label: "비밀번호 찾기" },
              { to: "/signup", label: "회원가입" },
            ],
            notices: ["현재는 임시 폼입니다.", "추후 본인 인증 기능을 붙일 수 있어요."],
            tips: ["이메일 또는 전화번호로 아이디를 찾는 방식이 일반적입니다."],
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
            <h1 className="auth-hero-title">아이디 찾기</h1>
            <p className="auth-hero-sub">이메일/전화번호로 아이디를 찾아보세요.</p>
          </section>

          <section className="auth-card auth-card--find" aria-label="find id form">
            <form onSubmit={handleSubmit}>
              <input
                className="auth-input auth-input--login"
                type="text"
                placeholder="이메일 또는 전화번호"
                autoComplete="email"
              />

              <button className="auth-btn auth-btn--login" type="submit">
                아이디 찾기
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
