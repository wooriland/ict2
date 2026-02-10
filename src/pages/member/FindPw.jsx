import { Link, useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import axios from "axios";

import "../../assets/CSS/Auth.css";
import bg from "../../assets/images/background.png";

import AuthSidePanels from "../../components/AuthSidePanels";
import { URL } from "../../config/constants";

export default function FindPw() {
  const navigate = useNavigate();

  // =========================
  // ✅ ref (입력값)
  // =========================
  const usernameRef = useRef(null);
  const emailRef = useRef(null);
  const newPwRef = useRef(null);
  const newPw2Ref = useRef(null);

  // =========================
  // ✅ 상태
  // =========================
  const [verified, setVerified] = useState(false); // ✅ username+email 검증 성공 여부
  const [msg, setMsg] = useState("");              // ✅ 안내 메시지
  const [loading, setLoading] = useState(false);   // ✅ 중복 클릭 방지

  // =========================
  // ✅ 1) 사용자 확인 (username + email)
  // =========================
  const handleVerify = async (e) => {
    e.preventDefault();

    const username = usernameRef.current?.value?.trim() || "";
    const email = emailRef.current?.value?.trim() || "";

    if (!username || !email) {
      window.alert("아이디와 이메일을 입력하세요.");
      return;
    }

    try {
      setLoading(true);
      setMsg("");

      // ✅ POST /api/auth/verify-user
      const res = await axios.post(URL.AUTH_VERIFY_USER, { username, email });

      if (res.data?.verified) {
        setVerified(true);
        setMsg("✅ 확인되었습니다. 새 비밀번호를 입력하세요.");
      } else {
        setVerified(false);
        setMsg("❌ 아이디/이메일이 일치하지 않습니다.");
      }
    } catch (err) {
      console.error(err);
      window.alert("서버 통신 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // ✅ 2) 비밀번호 재설정
  // =========================
  const handleReset = async (e) => {
    e.preventDefault();

    // ✅ verified 상태가 아니면 재설정 못 하게 안전장치
    if (!verified) {
      window.alert("먼저 사용자 확인을 진행하세요.");
      return;
    }

    const username = usernameRef.current?.value?.trim() || "";
    const email = emailRef.current?.value?.trim() || "";

    const newPassword = newPwRef.current?.value || "";
    const newPassword2 = newPw2Ref.current?.value || "";

    if (!newPassword || !newPassword2) {
      window.alert("새 비밀번호를 모두 입력하세요.");
      return;
    }

    if (newPassword !== newPassword2) {
      window.alert("새 비밀번호가 서로 일치하지 않습니다.");
      return;
    }

    try {
      setLoading(true);
      setMsg("");

      // ✅ PUT /api/auth/reset-password
      const res = await axios.put(URL.AUTH_RESET_PASSWORD, {
        username,
        email,
        newPassword,
      });

      window.alert(res.data?.message || "비밀번호가 재설정되었습니다.");
      navigate("/login");
    } catch (err) {
      console.error(err);

      // ✅ 백엔드에서 ApiResponse로 내려주는 경우(전역 예외 처리기)
      const serverMsg =
        err?.response?.data?.message ||
        "비밀번호 재설정 실패(사용자 정보 불일치 또는 서버 오류).";

      window.alert(serverMsg);
    } finally {
      setLoading(false);
    }
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
            notices: [
              "현재는 학습/프로젝트 단계라 메일 인증 없이 진행됩니다.",
              "추후 본인 인증(토큰/메일 인증) 기능이 추가될 수 있습니다.",
            ],
            tips: [
              "1) 아이디 + 이메일이 일치해야 재설정이 가능합니다.",
              "2) 확인이 완료되면 새 비밀번호 입력칸이 나타납니다.",
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
            <p className="auth-hero-sub">
              아이디와 이메일을 확인한 뒤 새 비밀번호로 재설정합니다.
            </p>
          </section>

          {/* ✅ verified 되면 아래 입력들이 추가되므로 카드가 자동으로 늘어남 */}
          <section
            className="auth-card auth-card--find"
            aria-label="find password form"
          >
            {/* ✅ verified에 따라 submit 핸들러를 바꿔서 "한 카드 안에서" 단계적으로 진행 */}
            <form onSubmit={verified ? handleReset : handleVerify}>
              {/* =========================
                  ✅ 1단계: 사용자 확인 입력
                 ========================= */}
              <input
                ref={usernameRef}
                className="auth-input auth-input--login"
                type="text"
                placeholder="아이디(username)"
                autoComplete="username"
                disabled={verified || loading} // ✅ verified 되면 잠금
              />

              <input
                ref={emailRef}
                className="auth-input auth-input--login"
                type="email"
                placeholder="이메일(email)"
                autoComplete="email"
                disabled={verified || loading}
              />

              {/* ✅ 안내 메시지 (성공/실패 표시) */}
              {msg && <p className="auth-help-text">{msg}</p>}

              {/* =========================
                  ✅ 1단계 버튼 (verify)
                 ========================= */}
              {!verified && (
                <button
                  className="auth-btn auth-btn--login"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "확인 중..." : "사용자 확인"}
                </button>
              )}

              {/* =========================
                  ✅ 2단계: 새 비밀번호 입력 (verified 후 노출)
                 ========================= */}
              {verified && (
                <>
                  <div className="auth-divider" />

                  <input
                    ref={newPwRef}
                    className="auth-input auth-input--login"
                    type="password"
                    placeholder="새 비밀번호"
                    autoComplete="new-password"
                    disabled={loading}
                  />

                  <input
                    ref={newPw2Ref}
                    className="auth-input auth-input--login"
                    type="password"
                    placeholder="새 비밀번호 확인"
                    autoComplete="new-password"
                    disabled={loading}
                  />

                  <button
                    className="auth-btn auth-btn--login"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? "재설정 중..." : "비밀번호 재설정"}
                  </button>
                </>
              )}

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
