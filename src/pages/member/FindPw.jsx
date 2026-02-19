import { Link, useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import axios from "axios";

import "../../assets/CSS/Auth.css";
import bg from "../../assets/images/background.png";

import AuthSidePanels from "../../components/AuthSidePanels";
import AuthMessage from "../../components/AuthMessage";
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
  const [loading, setLoading] = useState(false); // ✅ 중복 클릭 방지

  // type: "success" | "error" | "info"
  const [msg, setMsg] = useState({ type: "info", title: "", desc: "" });

  // =========================
  // ✅ 1) 사용자 확인 (username + email)
  // =========================
  const handleVerify = async (e) => {
    e.preventDefault();
    if (loading) return;

    // ✅ 입력값 정리(공백 제거 + 이메일 소문자)
    const username = (usernameRef.current?.value || "").trim();
    const email = (emailRef.current?.value || "").trim().toLowerCase();

    // ✅ 입력값 검증
    if (!username || !email) {
      setMsg({
        type: "error",
        title: "🧱 아직 정보가 부족해요",
        desc: "아이디(username)와 이메일(email)을 모두 입력해야 본인 확인이 가능합니다.",
      });
      return;
    }

    try {
      setLoading(true);
      setMsg({ type: "info", title: "", desc: "" });

      // ✅ POST /api/auth/verify-user
      const res = await axios.post(
        URL.AUTH_VERIFY_USER,
        { username, email },
        { headers: { "Content-Type": "application/json" } }
      );

      /**
       * ✅ 백엔드 응답 구조(네가 캡처한 그대로)
       * { ok:true, code:"OK", message:null, data:{ verified:true } }
       *
       * ❌ res.data.verified  (undefined)
       * ✅ res.data.data.verified
       */
      const isVerified = res?.data?.data?.verified === true;

      if (isVerified) {
        setVerified(true);

        setMsg({
          type: "success",
          title: "✅ 사용자 확인 완료",
          desc: "확인 완료! 이제 새 비밀번호(새 열쇠)를 입력해 주세요.",
        });

        // ✅ UX: 새 비밀번호 입력칸으로 포커스 이동
        setTimeout(() => newPwRef.current?.focus(), 0);
      } else {
        setVerified(false);
        setMsg({
          type: "error",
          title: "🗺 등록된 정보를 찾지 못했습니다",
          desc: "아이디와 이메일이 일치하지 않습니다. 다시 확인해 주세요.",
        });
      }
    } catch (err) {
      console.error(err);

      const status = err?.response?.status;
      const serverMsg =
        err?.response?.data?.message ||
        "서버 통신 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";

      setVerified(false);
      setMsg({
        type: "error",
        title: "📡 통신이 불안정합니다",
        desc: `본인 확인 중 오류가 발생했습니다. (${status || "unknown"}) ${serverMsg}`,
      });
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // ✅ 2) 비밀번호 재설정
  // =========================
  const handleReset = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!verified) {
      setMsg({
        type: "error",
        title: "🚧 아직 공사가 시작되지 않았어요",
        desc: "먼저 사용자 확인(아이디+이메일)을 완료해 주세요.",
      });
      return;
    }

    // ✅ 입력값 정리(공백 제거 + 이메일 소문자)
    const username = (usernameRef.current?.value || "").trim();
    const email = (emailRef.current?.value || "").trim().toLowerCase();

    const newPassword = newPwRef.current?.value || "";
    const newPassword2 = newPw2Ref.current?.value || "";

    if (!newPassword || !newPassword2) {
      setMsg({
        type: "error",
        title: "🗝 새 열쇠가 비어 있어요",
        desc: "새 비밀번호와 비밀번호 확인을 모두 입력해 주세요.",
      });
      return;
    }

    if (newPassword !== newPassword2) {
      setMsg({
        type: "error",
        title: "🗝 열쇠가 서로 달라요",
        desc: "새 비밀번호와 새 비밀번호 확인이 일치하지 않습니다.",
      });
      newPw2Ref.current?.focus();
      return;
    }

    try {
      setLoading(true);
      setMsg({ type: "info", title: "", desc: "" });

      // ✅ PUT /api/auth/reset-password
      const res = await axios.put(
        URL.AUTH_RESET_PASSWORD,
        { username, email, newPassword },
        { headers: { "Content-Type": "application/json" } }
      );

      // ✅ 백엔드가 ApiResponse를 쓰는 경우 message는 res.data.message 또는 res.data.data.message일 수 있음
      const serverMsg =
        res?.data?.message ||
        res?.data?.data?.message ||
        "비밀번호가 재설정되었습니다.";

      setMsg({
        type: "success",
        title: "🔐 새 열쇠가 만들어졌습니다!",
        desc: `${serverMsg} 2초 뒤 로그인 화면으로 이동합니다.`,
      });

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 2000);
    } catch (err) {
      console.error(err);

      const serverMsg =
        err?.response?.data?.message ||
        err?.response?.data?.data?.message ||
        "비밀번호 재설정 실패(사용자 정보 불일치 또는 서버 오류).";

      setMsg({
        type: "error",
        title: "🚧 열쇠 제작에 실패했습니다",
        desc: serverMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-grid">
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

          <section className="auth-card auth-card--find" aria-label="find password form">
            <form onSubmit={verified ? handleReset : handleVerify}>
              {/* ✅ 1단계: 사용자 확인 */}
              <input
                ref={usernameRef}
                className="auth-input auth-input--login"
                type="text"
                placeholder="아이디(username)"
                autoComplete="username"
                disabled={verified || loading}
              />

              <input
                ref={emailRef}
                className="auth-input auth-input--login"
                type="email"
                placeholder="이메일(email)"
                autoComplete="email"
                disabled={verified || loading}
              />

              {/* ✅ 메시지 */}
              <AuthMessage type={msg.type} title={msg.title} desc={msg.desc} />

              {/* ✅ 1단계 버튼 */}
              {!verified && (
                <button className="auth-btn auth-btn--login" type="submit" disabled={loading}>
                  {loading ? "확인 중..." : "사용자 확인"}
                </button>
              )}

              {/* ✅ 2단계: 새 비밀번호 입력 */}
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

                  <button className="auth-btn auth-btn--login" type="submit" disabled={loading}>
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
