import { Link, useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import axios from "axios";

import "../../assets/CSS/Auth.css";
import bg from "../../assets/images/background.png";

import AuthSidePanels from "../../components/AuthSidePanels";
import AuthMessage from "../../components/AuthMessage"; // ✅ [추가] 카드 메시지 통일
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
  const [loading, setLoading] = useState(false);   // ✅ 중복 클릭 방지

  // ✅ [변경] msg 문자열 -> 카드 메시지 객체로 통일
  // type: "success" | "error" | "info"
  const [msg, setMsg] = useState({ type: "info", title: "", desc: "" });

  // =========================
  // ✅ 1) 사용자 확인 (username + email)
  // =========================
  const handleVerify = async (e) => {
    e.preventDefault();

    // ✅ 요청 중이면 무시(연타 방지)
    if (loading) return;

    const username = usernameRef.current?.value?.trim() || "";
    const email = emailRef.current?.value?.trim() || "";

    // ✅ 입력값 검증: alert -> 카드 메시지
    if (!username || !email) {
      setMsg({
        type: "error",
        title: "🧱 아직 정보가 부족해요",
        desc: "아이디(집 주소)와 이메일(연락처)을 모두 입력해야 본인 확인이 가능합니다.",
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

      if (res.data?.verified) {
        // ✅ 검증 성공 → 2단계 폼 열기
        setVerified(true);

        setMsg({
          type: "info",
          title: "🛠 문을 고칠 수 있게 되었습니다",
          desc: "확인 완료! 이제 새 비밀번호(새 열쇠)를 입력해 주세요.",
        });
      } else {
        // ✅ 검증 실패
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

      // ✅ 통신/서버 에러도 카드 메시지로
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

    // ✅ 요청 중이면 무시(연타 방지)
    if (loading) return;

    // ✅ verified 상태가 아니면 재설정 못 하게 안전장치(UX)
    if (!verified) {
      setMsg({
        type: "error",
        title: "🚧 아직 공사가 시작되지 않았어요",
        desc: "먼저 사용자 확인(아이디+이메일)을 완료해 주세요.",
      });
      return;
    }

    const username = usernameRef.current?.value?.trim() || "";
    const email = emailRef.current?.value?.trim() || "";

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

      // ✅ 성공 메시지 + 2초 후 로그인으로 이동
      setMsg({
        type: "success",
        title: "🔐 새 열쇠가 만들어졌습니다!",
        desc: (res.data?.message
          ? `${res.data.message} 2초 뒤 로그인 화면으로 이동합니다.`
          : "비밀번호가 재설정되었습니다. 2초 뒤 로그인 화면으로 이동합니다."),
      });

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 2000);
    } catch (err) {
      console.error(err);

      // ✅ 백엔드에서 ApiResponse로 내려주는 경우
      const serverMsg =
        err?.response?.data?.message ||
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
          <section className="auth-card auth-card--find" aria-label="find password form">
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

              {/* ✅ [변경] 안내 메시지: AuthMessage로 통일 */}
              <AuthMessage type={msg.type} title={msg.title} desc={msg.desc} />

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
