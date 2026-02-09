import { Link } from "react-router-dom";
import "../../assets/CSS/Auth.css";
import bg from "../../assets/images/background.png";

import AuthSidePanels from "../../components/AuthSidePanels";

export default function Help() {
  const handleSubmit = (e) => {
    e.preventDefault();
    window.alert("문의 접수 기능은 추후 구현 예정입니다.");
  };

  return (
    <div className="auth-page">
      <div className="auth-grid">
        {/* ✅ 좌/우 통짜 패널 + story.mp4 */}
        <AuthSidePanels
          left={{
            title: "고객센터 안내",
            text: "문의 전 아래 정보를 확인해주세요.",
            links: [
              { to: "/login", label: "로그인" },
              { to: "/signup", label: "회원가입" },
              { to: "/find-id", label: "아이디 찾기" },
              { to: "/find-pw", label: "비밀번호 찾기" },
            ],
            notices: ["응답은 영업일 기준 1~2일 내 처리됩니다(예정)."],
            tips: [
              "문의 제목과 내용을 구체적으로 적어주세요.",
              "스크린샷이 있으면 해결이 빨라집니다.",
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
              <Link to="/login">로그인</Link>
              <span className="auth-header-sep">|</span>
              <Link to="/signup">회원가입</Link>
            </nav>
          </header>

          <section className="auth-hero">
            <h1 className="auth-hero-title">고객센터</h1>
            <p className="auth-hero-sub">문의 내용을 남겨주세요. (임시 폼)</p>
          </section>

          <section className="auth-card auth-card--find" aria-label="help form">
            <form onSubmit={handleSubmit}>
              <input
                className="auth-input auth-input--login"
                type="text"
                placeholder="연락 가능한 이메일"
                autoComplete="email"
              />

              <input
                className="auth-input auth-input--login"
                type="text"
                placeholder="문의 제목"
              />

              <button className="auth-btn auth-btn--login" type="submit">
                문의 남기기
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
