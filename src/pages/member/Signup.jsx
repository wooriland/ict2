import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import { URL } from "../../config/constants";

import "../../assets/CSS/Auth.css";
import bg from "../../assets/images/background.png";

import AuthSidePanels from "../../components/AuthSidePanels";
import AuthMessage from "../../components/AuthMessage"; // ✅ [추가] 카드 메시지 컴포넌트

export default function Signup() {
  const navigate = useNavigate();

  const usernameRef = useRef(null);
  const emailRef = useRef(null);        // ✅ 추가
  const passwordRef = useRef(null);
  const confirmRef = useRef(null);

  // ✅ 아이디 중복 메시지(입력칸 아래)
  const [usernameError, setUsernameError] = useState("");

  // ✅ 이메일 관련 에러 메시지(입력칸 아래)
  const [emailError, setEmailError] = useState("");

  // ✅ [추가] alert 대신 카드 안 메시지 상태
  const [msg, setMsg] = useState({ type: "info", title: "", desc: "" });

  // ✅ [추가] 요청 중 중복 클릭 방지 + 버튼 텍스트 변경
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();

    // ✅ 이미 요청 중이면 무시(연타 방지)
    if (isLoading) return;

    // ✅ 매 요청마다 에러 초기화
    setUsernameError("");
    setEmailError("");

    // ✅ 매 요청마다 카드 메시지 초기화(선택)
    setMsg({ type: "info", title: "", desc: "" });

    const username = usernameRef.current?.value?.trim() || "";
    const email = emailRef.current?.value?.trim() || "";
    const password = passwordRef.current?.value || "";
    const confirm = confirmRef.current?.value || "";

    // ✅ 1) 프론트 기본 검증 (공백 체크)
    if (!username || !email || !password || !confirm) {
      setMsg({
        type: "error",
        title: "🧱 아직 재료가 부족해요",
        desc: "아이디(집 주소), 이메일, 비밀번호(열쇠)를 모두 입력해야 집을 지을 수 있어요.",
      });
      return;
    }

    // ✅ 2) 이메일 형식 체크(가벼운 정규식)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("이메일 형식이 올바르지 않습니다.");
      setMsg({
        type: "error",
        title: "📮 주소 형식이 이상해요",
        desc: "이메일 형식을 다시 확인해 주세요. (예: myhome@example.com)",
      });
      emailRef.current?.focus();
      return;
    }

    // ✅ 3) 비밀번호 확인
    if (password !== confirm) {
      setMsg({
        type: "error",
        title: "🗝 열쇠가 서로 달라요",
        desc: "비밀번호와 비밀번호 확인이 일치하지 않습니다.",
      });
      confirmRef.current?.focus();
      return;
    }

    // ✅ 4) 서버 요청 시작
    setIsLoading(true);

    try {
      /**
       * ✅ Spring 회원가입 API 호출
       * - constants.js에 URL.AUTH_SIGNUP 필요
       */
      const res = await axios.post(
        URL.AUTH_SIGNUP,
        {
          username,
          email,
          password,
          confirm,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      // ✅ 성공(201 + { ok:true, message:"..." })
      if (res.status === 201 && res.data?.ok) {
        // ✅ alert 대신 성공 메시지 + 2초 후 로그인 이동
        setMsg({
          type: "success",
          title: "🏠 내 집 마련의 첫 열쇠를 얻었습니다!",
          desc:
            (res.data?.message &&
              `${res.data.message} 잠시 후 로그인 화면으로 이동합니다.`) ||
            "가입이 완료되었습니다. 2초 뒤 로그인 화면으로 이동합니다.",
        });

        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 2000);

        return;
      }

      // ✅ 혹시 서버 응답이 예상과 다른 경우(방어 코드)
      setMsg({
        type: "error",
        title: "⚠️ 응답이 예상과 다릅니다",
        desc: "회원가입 응답 형태가 예상과 다릅니다. 서버 응답을 확인해 주세요.",
      });
    } catch (err) {
      const status = err.response?.status;
      const serverMsg = err.response?.data?.message || "";

      // ✅ 409 = 중복 계열 (아이디/이메일)
      if (status === 409) {
        // 서버 메시지에 "이메일"이 들어가면 이메일 에러로 분기
        if (serverMsg.includes("이메일")) {
          setEmailError(serverMsg || "이메일 중복 사용 불가");
          setMsg({
            type: "error",
            title: "📮 이미 사용 중인 이메일입니다",
            desc: "다른 이메일 주소로 다시 시도해 주세요.",
          });
          emailRef.current?.focus();
          return;
        }

        // 기본은 아이디 중복
        setUsernameError(serverMsg || "아이디 중복 사용 불가");
        setMsg({
          type: "error",
          title: "🚪 이미 사용 중인 집 주소입니다",
          desc: "다른 아이디로 새로운 집 주소를 정해주세요.",
        });
        usernameRef.current?.focus();
        return;
      }

      // ✅ 400에서도 이메일 검증 메시지가 올 수 있으니 방어적으로 처리
      if (status === 400 && serverMsg.includes("이메일")) {
        setEmailError(serverMsg);
        setMsg({
          type: "error",
          title: "📮 이메일을 확인해 주세요",
          desc: serverMsg,
        });
        emailRef.current?.focus();
        return;
      }

      // ✅ 그 외 에러(400/500 등)
      const msgText =
        serverMsg || "회원가입 처리 중 오류가 발생했습니다. (서버/콘솔 확인)";
      console.log(err);

      setMsg({
        type: "error",
        title: "📡 가입 도중 문제가 발생했습니다",
        desc: msgText,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ 아이디를 다시 입력하면 에러 문구 제거
  const handleUsernameChange = () => {
    if (usernameError) setUsernameError("");
  };

  // ✅ 이메일을 다시 입력하면 에러 문구 제거
  const handleEmailChange = () => {
    if (emailError) setEmailError("");
  };

  return (
    <div className="auth-page">
      <div className="auth-grid">
        <AuthSidePanels
          left={{
            title: "가입 안내",
            text: "내집마련의 시작! 간단히 가입하고 참여하세요.",
            links: [
              { to: "/help", label: "고객센터" },
              { to: "/login", label: "로그인" },
              { to: "/find-id", label: "아이디 찾기" },
              { to: "/find-pw", label: "비밀번호 찾기" },
            ],
            notices: [
              "아이디는 중복 불가",
              "이메일은 중복 불가",
              "비밀번호는 추후 정책(길이/특수문자) 강화 가능",
            ],
            tips: [
              "가입 완료 후 로그인 화면으로 이동합니다.",
              "아이디/이메일 중복이면 입력칸 아래 빨간 글씨가 표시됩니다.",
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
            <p className="auth-hero-sub">내집마련의 시작! 간단히 가입해요.</p>
          </section>

          <section className="auth-card auth-card--signup" aria-label="signup form">
            <form onSubmit={handleSignup}>
              <input
                ref={usernameRef}
                className="auth-input"
                type="text"
                placeholder="아이디 (집 주소)"
                autoComplete="username"
                name="username"
                onChange={handleUsernameChange}
                disabled={isLoading} // ✅ [추가] 요청 중 입력 잠금(선택)
              />

              {/* ✅ 아이디 중복 메시지 (입력칸 아래) */}
              {usernameError && (
                <div className="auth-input-error">{usernameError}</div>
              )}

              <input
                ref={emailRef}
                className="auth-input"
                type="email"
                placeholder="이메일 (연락처)"
                autoComplete="email"
                name="email"
                onChange={handleEmailChange}
                disabled={isLoading} // ✅ [추가]
              />

              {/* ✅ 이메일 에러 메시지 (입력칸 아래) */}
              {emailError && <div className="auth-input-error">{emailError}</div>}

              <input
                ref={passwordRef}
                className="auth-input"
                type="password"
                placeholder="비밀번호 (열쇠)"
                autoComplete="new-password"
                name="password"
                disabled={isLoading} // ✅ [추가]
              />
              <input
                ref={confirmRef}
                className="auth-input"
                type="password"
                placeholder="비밀번호 확인 (열쇠 재확인)"
                autoComplete="new-password"
                name="confirm"
                disabled={isLoading} // ✅ [추가]
              />

              <button className="auth-btn" type="submit" disabled={isLoading}>
                {isLoading ? "집을 짓는 중..." : "가입하기"}
              </button>

              {/* ✅ [추가] alert 대신 카드 내부 메시지 */}
              <AuthMessage type={msg.type} title={msg.title} desc={msg.desc} />

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
