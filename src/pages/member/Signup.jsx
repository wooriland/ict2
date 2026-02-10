import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import { URL } from "../../config/constants";

import "../../assets/CSS/Auth.css";
import bg from "../../assets/images/background.png";

import AuthSidePanels from "../../components/AuthSidePanels";

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

  const handleSignup = async (e) => {
    e.preventDefault();

    // ✅ 매 요청마다 에러 초기화
    setUsernameError("");
    setEmailError("");

    const username = usernameRef.current?.value?.trim() || "";
    const email = emailRef.current?.value?.trim() || ""; // ✅ 추가
    const password = passwordRef.current?.value || "";
    const confirm = confirmRef.current?.value || "";

    // ✅ 1) 프론트 기본 검증 (공백 체크)
    if (!username || !email || !password || !confirm) {
      window.alert("모든 항목을 입력하세요.");
      return;
    }

    // ✅ 2) 이메일 형식 체크(가벼운 정규식)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("이메일 형식이 올바르지 않습니다.");
      emailRef.current?.focus();
      return;
    }

    // ✅ 3) 비밀번호 확인
    if (password !== confirm) {
      window.alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      /**
       * ✅ Spring 회원가입 API 호출
       * - 서버: POST http://localhost:8080/api/auth/signup
       *
       * ⚠️ 중요: constants.js에 아래를 추가해야 함
       * export const URL = {
       *   ...,
       *   AUTH_SIGNUP: "http://localhost:8080/api/auth/signup"
       * }
       */
      const res = await axios.post(URL.AUTH_SIGNUP, {
        username,
        email,    // ✅ 서버 SignupRequest(email) 필드로 전달
        password,
        confirm,  // ✅ 서버 SignupRequest(confirm) 필드로 전달
      });

      // ✅ 성공(201 + { ok:true, message:"..." })
      if (res.status === 201 && res.data?.ok) {
        window.alert(
          res.data?.message ||
            "환영합니다! 🏠\n이제 내 집 마련이 진짜 가능해질 것 같은 첫걸음이에요!"
        );
        navigate("/login", { replace: true });
        return;
      }

      // 혹시 서버 응답이 예상과 다른 경우(방어 코드)
      window.alert("회원가입 응답이 예상과 다릅니다. 서버 응답을 확인하세요.");
    } catch (err) {
      const status = err.response?.status;
      const serverMsg = err.response?.data?.message || "";

      // ✅ 409 = 중복 계열 (아이디/이메일)
      if (status === 409) {
        // 서버 메시지에 "이메일"이 들어가면 이메일 에러로 분기
        if (serverMsg.includes("이메일")) {
          setEmailError(serverMsg || "이메일 중복 사용 불가");
          emailRef.current?.focus();
          return;
        }

        // 기본은 아이디 중복으로 처리
        setUsernameError(serverMsg || "아이디 중복 사용 불가");
        usernameRef.current?.focus();
        return;
      }

      // ✅ 400에서도 이메일 중복/검증 메시지가 올 수 있으니 방어적으로 처리
      if (status === 400 && serverMsg.includes("이메일")) {
        setEmailError(serverMsg);
        emailRef.current?.focus();
        return;
      }

      // ✅ 그 외 에러(400/500 등)
      const msg =
        serverMsg || "회원가입 처리 중 오류가 발생했습니다. (서버/콘솔 확인)";
      console.log(err);
      window.alert(msg);
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
                placeholder="아이디"
                autoComplete="username"
                name="username"
                onChange={handleUsernameChange}
              />

              {/* ✅ 아이디 중복 메시지 */}
              {usernameError && <div className="auth-input-error">{usernameError}</div>}

              {/* ✅ 이메일 입력 추가 (레이아웃 유지: input 한 줄 추가) */}
              <input
                ref={emailRef}
                className="auth-input"
                type="email"
                placeholder="이메일"
                autoComplete="email"
                name="email"
                onChange={handleEmailChange}
              />

              {/* ✅ 이메일 에러 메시지 */}
              {emailError && <div className="auth-input-error">{emailError}</div>}

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
