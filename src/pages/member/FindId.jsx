import { Link } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

import "../../assets/CSS/Auth.css";
import bg from "../../assets/images/background.png";

import AuthSidePanels from "../../components/AuthSidePanels";
import AuthMessage from "../../components/AuthMessage"; // ✅ 카드 메시지 통일
import { URL } from "../../config/constants";

export default function FindId() {
  // ✅ 입력값(email)
  const [email, setEmail] = useState("");

  // ✅ UX 상태
  const [loading, setLoading] = useState(false);

  // ✅ resultMsg / errorMsg -> msg 하나로 통일
  // type: "success" | "error" | "info"
  const [msg, setMsg] = useState({ type: "info", title: "", desc: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ 제출할 때마다 이전 메시지 초기화
    setMsg({ type: "info", title: "", desc: "" });

    // ✅ 입력값 정리(공백 제거)
    const trimmed = email.trim();

    // ✅ 프론트 1차 검증(UX) - alert 대신 메시지
    if (!trimmed) {
      setMsg({
        type: "error",
        title: "📮 집 주소(이메일)가 비어 있어요",
        desc: "가입할 때 입력한 이메일을 적어주셔야 아이디를 찾아드릴 수 있어요.",
      });
      return;
    }

    try {
      setLoading(true);

      /**
       * ✅ 백엔드(현재 실제 응답)
       * POST /api/auth/find-username
       * Request: { "email": "..." }
       * Success: { ok:true, code:"OK", message:null, data:{ username:"..." } }
       * Fail(404): { ok:false, message:"일치하는 회원 정보가 없습니다" ... }
       */
      const res = await axios.post(
        URL.AUTH_FIND_USERNAME,
        { email: trimmed },
        { headers: { "Content-Type": "application/json" } }
      );

      // ✅ 핵심 수정: username은 최상단이 아니라 data.username에 있음
      const username = res?.data?.data?.username;

      // ✅ 방어: 서버가 ok=true라도 data가 비었으면 에러로 처리
      if (!username) {
        setMsg({
          type: "error",
          title: "📭 아이디를 가져오지 못했습니다",
          desc: "서버 응답 형식을 확인해 주세요. (data.username 누락)",
        });
        return;
      }

      // ✅ 성공 UX (내집마련 컨셉)
      setMsg({
        type: "success",
        title: "📬 집 주소를 찾았습니다!",
        desc: `회원님의 아이디는 "${username}" 입니다.`,
      });
    } catch (err) {
      /**
       * ✅ 실패 케이스 처리
       * - 404: "일치하는 회원 정보가 없습니다"
       * - 400(@Valid 실패): message 내려올 수 있음
       * - 그 외: 일반 오류 메시지
       */
      const serverMsg =
        err?.response?.data?.message ||
        err?.response?.data?.msg ||
        err?.message;

      const status = err?.response?.status;

      // ✅ 내집마련 컨셉으로 실패 메시지 정리
      if (status === 404) {
        setMsg({
          type: "error",
          title: "🗺 등록된 집을 찾지 못했습니다",
          desc: serverMsg || "해당 이메일로 가입된 회원 정보가 없습니다.",
        });
      } else if (status === 400) {
        setMsg({
          type: "error",
          title: "📮 이메일을 확인해 주세요",
          desc: serverMsg || "요청 형식이 올바르지 않습니다.",
        });
      } else {
        setMsg({
          type: "error",
          title: "📡 요청 처리 중 문제가 발생했습니다",
          desc: serverMsg || "잠시 후 다시 시도해 주세요.",
        });
      }
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
            title: "도움말",
            text: "아이디를 잊으셨나요? 아래 메뉴를 이용하세요.",
            links: [
              { to: "/help", label: "고객센터" },
              { to: "/login", label: "로그인" },
              { to: "/find-pw", label: "비밀번호 찾기" },
              { to: "/signup", label: "회원가입" },
            ],
            notices: [
              "현재는 이메일로 아이디를 찾습니다.",
              "추후 본인 인증 기능을 붙일 수 있어요.",
            ],
            tips: ["가입 시 입력한 이메일로 아이디를 조회합니다."],
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
            <p className="auth-hero-sub">
              가입 시 입력한 이메일로 아이디를 찾아보세요.
            </p>
          </section>

          <section className="auth-card auth-card--find" aria-label="find id form">
            <form onSubmit={handleSubmit}>
              <input
                className="auth-input auth-input--login"
                type="email"
                placeholder="이메일 (집 주소)"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />

              <button
                className="auth-btn auth-btn--login"
                type="submit"
                disabled={loading}
              >
                {loading ? "집 주소를 찾는 중..." : "아이디 찾기"}
              </button>

              {/* ✅ 결과/오류/안내: 카드 메시지 컴포넌트로 통일 */}
              <AuthMessage type={msg.type} title={msg.title} desc={msg.desc} />

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
