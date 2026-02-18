import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// ✅ signup은 apiClient 사용(유지)
import { api } from "../../api/apiClient";
import { API_BASE, PATH } from "../../config/constants";

import "../../assets/CSS/Auth.css";
import bg from "../../assets/images/background.png";

import AuthSidePanels from "../../components/AuthSidePanels";
import AuthMessage from "../../components/AuthMessage";

export default function Signup() {
  const navigate = useNavigate();

  const usernameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmRef = useRef(null);

  // ✅ 이메일 인증 코드 입력 ref
  const emailCodeRef = useRef(null);

  // ✅ 아이디/이메일 에러(서버 가입 시도 후 등)
  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");

  // ✅ 이메일 인증 상태
  const [emailVerified, setEmailVerified] = useState(false);

  // ✅ 타이머/쿨다운
  const [expiresInSec, setExpiresInSec] = useState(0);
  const [cooldownSec, setCooldownSec] = useState(0);

  // ✅ 로딩
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ 힌트/카드 메시지
  const [emailVerifyHint, setEmailVerifyHint] = useState("");
  const [msg, setMsg] = useState({ type: "info", title: "", desc: "" });

  // ✅ 이메일 값(변경 감지용)
  const [emailValue, setEmailValue] = useState("");
  // ✅ username 값(실시간 체크용)
  const [usernameValue, setUsernameValue] = useState("");

  // ✅ 이메일 정규식
  const emailRegex = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/, []);
  const isEmailValid = useMemo(
    () => emailRegex.test((emailValue || "").trim()),
    [emailValue, emailRegex]
  );

  // ✅ username 규칙(프로젝트 기본)
  const usernameRegex = useMemo(() => /^[a-zA-Z0-9_]{4,20}$/, []);
  const isUsernameValid = useMemo(
    () => usernameRegex.test((usernameValue || "").trim()),
    [usernameValue, usernameRegex]
  );

  // ✅ (중요) 이메일 인증용 엔드포인트
  const EMAIL_SEND_PATH = PATH.EMAIL_SEND || "/api/auth/email/send";
  const EMAIL_VERIFY_PATH = PATH.EMAIL_VERIFY || "/api/auth/email/verify";

  // ✅ (P1) 실시간 중복체크 엔드포인트(백엔드가 없으면 동작 X)
  const CHECK_USERNAME_PATH = PATH.AUTH_CHECK_USERNAME || "/api/auth/check-username";
  const CHECK_EMAIL_PATH = PATH.AUTH_CHECK_EMAIL || "/api/auth/check-email";

  // ✅ 중복 체크 상태
  // status: idle | invalid | checking | ok | dup | error
  const [usernameCheck, setUsernameCheck] = useState({ status: "idle", msg: "" });
  const [emailCheck, setEmailCheck] = useState({ status: "idle", msg: "" });

  // ✅ 디바운스 타이머
  const usernameTimerRef = useRef(null);
  const emailTimerRef = useRef(null);

  // ✅ 이메일 인증 API는 apiClient를 타면 401에서 /login으로 튕길 수 있으니 fetch로 직접 호출
  const postJson = async (path, body) => {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    let data = null;
    try {
      data = await res.json();
    } catch {
      try {
        const t = await res.text();
        data = t ? { message: t } : null;
      } catch {
        data = null;
      }
    }

    if (!res.ok) {
      const err = new Error(data?.message || `요청 실패 (HTTP ${res.status})`);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  };

  // ✅ 중복 체크용 GET
  const getJson = async (path, paramsObj) => {
    const qs = new URLSearchParams(paramsObj).toString();
    const res = await fetch(`${API_BASE}${path}?${qs}`, { method: "GET" });

    let data = null;
    try {
      data = await res.json();
    } catch {
      data = null;
    }

    if (!res.ok) {
      const err = new Error(data?.message || `요청 실패 (HTTP ${res.status})`);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  };

  // =========================================================
  // ✅ 이메일 변경 시: 인증 상태/타이머 초기화
  // =========================================================
  useEffect(() => {
    setEmailVerified(false);
    setExpiresInSec(0);
    setCooldownSec(0);
    setIsSendingCode(false);
    setIsVerifyingCode(false);
    setEmailVerifyHint("");

    if (emailCodeRef.current) emailCodeRef.current.value = "";
  }, [emailValue]);

  // =========================================================
  // ✅ 1초 타이머 감소
  // =========================================================
  useEffect(() => {
    if (emailVerified) return;
    if (expiresInSec <= 0 && cooldownSec <= 0) return;

    const id = setInterval(() => {
      setExpiresInSec((v) => Math.max(0, v - 1));
      setCooldownSec((v) => Math.max(0, v - 1));
    }, 1000);

    return () => clearInterval(id);
  }, [expiresInSec, cooldownSec, emailVerified]);

  const expiresText = useMemo(() => {
    if (emailVerified) return "✅ 인증 완료";
    if (expiresInSec <= 0) return "";
    const m = String(Math.floor(expiresInSec / 60)).padStart(2, "0");
    const s = String(expiresInSec % 60).padStart(2, "0");
    return `⏳ 남은 시간 ${m}:${s}`;
  }, [expiresInSec, emailVerified]);

  const sanitizeCode = (raw) => (raw || "").replace(/\D/g, "").slice(0, 6);

  // =========================================================
  // ✅ (P1) 아이디 실시간 중복 체크 (디바운스)
  // =========================================================
  useEffect(() => {
    if (usernameTimerRef.current) clearTimeout(usernameTimerRef.current);

    const username = (usernameValue || "").trim();

    if (!username) {
      setUsernameCheck({ status: "idle", msg: "" });
      return;
    }

    if (!usernameRegex.test(username)) {
      setUsernameCheck({
        status: "invalid",
        msg: "아이디는 4~20자, 영문/숫자/_ 만 가능합니다.",
      });
      return;
    }

    setUsernameCheck({ status: "checking", msg: "중복 확인 중..." });

    usernameTimerRef.current = setTimeout(async () => {
      try {
        const data = await getJson(CHECK_USERNAME_PATH, { username });
        const available = data?.data?.available === true;

        if (available) setUsernameCheck({ status: "ok", msg: "사용 가능한 아이디입니다." });
        else setUsernameCheck({ status: "dup", msg: "이미 사용 중인 아이디입니다." });
      } catch {
        setUsernameCheck({ status: "error", msg: "중복 확인 실패(서버 오류)" });
      }
    }, 500);

    return () => {
      if (usernameTimerRef.current) clearTimeout(usernameTimerRef.current);
    };
  }, [usernameValue, usernameRegex, CHECK_USERNAME_PATH]);

  // =========================================================
  // ✅ (P1) 이메일 실시간 중복 체크 (디바운스)
  // =========================================================
  useEffect(() => {
    if (emailTimerRef.current) clearTimeout(emailTimerRef.current);

    const email = (emailValue || "").trim();

    if (!email) {
      setEmailCheck({ status: "idle", msg: "" });
      return;
    }

    if (!emailRegex.test(email)) {
      setEmailCheck({ status: "invalid", msg: "이메일 형식이 올바르지 않습니다." });
      return;
    }

    setEmailCheck({ status: "checking", msg: "중복 확인 중..." });

    emailTimerRef.current = setTimeout(async () => {
      try {
        const data = await getJson(CHECK_EMAIL_PATH, { email: email.toLowerCase() });
        const available = data?.data?.available === true;

        if (available) setEmailCheck({ status: "ok", msg: "사용 가능한 이메일입니다." });
        else setEmailCheck({ status: "dup", msg: "이미 가입된 이메일입니다." });
      } catch {
        setEmailCheck({ status: "error", msg: "중복 확인 실패(서버 오류)" });
      }
    }, 500);

    return () => {
      if (emailTimerRef.current) clearTimeout(emailTimerRef.current);
    };
  }, [emailValue, emailRegex, CHECK_EMAIL_PATH]);

  // =========================================================
  // ✅ 이메일 인증코드 발송
  // =========================================================
  const handleSendEmailCode = async () => {
    if (isSendingCode || cooldownSec > 0) return;

    setEmailError("");
    setEmailVerifyHint("");
    setMsg({ type: "info", title: "", desc: "" });

    const email = (emailRef.current?.value || "").trim();
    setEmailValue(email);

    // ✅ 0) 형식 체크
    if (!email) {
      setEmailError("이메일은 필수입니다.");
      setMsg({
        type: "error",
        title: "📮 이메일이 필요해요",
        desc: "이메일을 입력한 뒤 인증코드를 발송해 주세요.",
      });
      emailRef.current?.focus();
      return;
    }

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

    // ✅ 1) 이메일 중복이면 인증 발송 자체를 막음(핵심)
    if (emailCheck.status === "dup") {
      setEmailError("이미 가입된 이메일입니다.");
      setMsg({
        type: "error",
        title: "📮 이미 가입된 이메일입니다",
        desc: "다른 이메일로 변경한 뒤 인증을 진행해 주세요.",
      });
      emailRef.current?.focus();
      return;
    }

    // ✅ 2) 중복 체크 중/오류면 잠깐 기다리게 UX
    if (emailCheck.status === "checking") {
      setMsg({
        type: "info",
        title: "🔎 이메일 중복 확인 중",
        desc: "잠시만요. 이메일 중복을 확인하고 있어요.",
      });
      return;
    }
    if (emailCheck.status === "error") {
      setMsg({
        type: "error",
        title: "📡 이메일 중복 확인 실패",
        desc: "서버가 불안정해 중복 확인에 실패했습니다. 잠시 후 다시 시도해 주세요.",
      });
      return;
    }

    try {
      setIsSendingCode(true);

      const data = await postJson(EMAIL_SEND_PATH, { email });

      setEmailVerifyHint(data?.message || "인증 코드가 발송되었습니다. 메일을 확인해주세요.");

      setExpiresInSec(300);
      setCooldownSec(30);

      setTimeout(() => emailCodeRef.current?.focus(), 0);
    } catch (err) {
      const status = err?.status;
      const serverMsg = err?.data?.message || err?.message || "인증코드 발송에 실패했습니다.";

      if (status === 401) {
        setMsg({
          type: "error",
          title: "🔒 서버가 인증 없이 접근을 막고 있어요(401)",
          desc:
            "Spring Security에서 /api/auth/email/send 를 permitAll로 열었는지 확인하세요. " +
            "또는 해당 API가 아직 구현되지 않았을 수 있어요.",
        });
      } else {
        setMsg({ type: "error", title: "📨 인증코드 발송 실패", desc: serverMsg });
      }

      setEmailVerifyHint(serverMsg);
    } finally {
      setIsSendingCode(false);
    }
  };

  // =========================================================
  // ✅ 이메일 인증코드 검증
  // =========================================================
  const handleVerifyEmailCode = async () => {
    if (isVerifyingCode) return;

    setEmailError("");
    setEmailVerifyHint("");
    setMsg({ type: "info", title: "", desc: "" });

    const email = (emailRef.current?.value || "").trim();
    const code = sanitizeCode(emailCodeRef.current?.value || "");
    setEmailValue(email);

    if (!emailRegex.test(email)) {
      setEmailError("이메일 형식이 올바르지 않습니다.");
      setMsg({
        type: "error",
        title: "📮 이메일 확인 필요",
        desc: "이메일을 먼저 올바르게 입력해 주세요.",
      });
      emailRef.current?.focus();
      return;
    }

    // ✅ 이메일이 중복(이미 가입) 상태면 인증 진행을 막음
    if (emailCheck.status === "dup") {
      setMsg({
        type: "error",
        title: "📮 이미 가입된 이메일입니다",
        desc: "이미 가입된 이메일로는 인증을 진행할 수 없습니다. 다른 이메일로 변경해 주세요.",
      });
      emailRef.current?.focus();
      return;
    }

    if (expiresInSec <= 0) {
      setEmailVerifyHint("인증 시간이 만료되었습니다. 인증코드를 다시 발송해주세요.");
      setMsg({
        type: "error",
        title: "⌛ 인증 코드 만료",
        desc: "인증 시간이 만료되었습니다. [인증코드 보내기]를 다시 눌러주세요.",
      });
      return;
    }

    if (code.length !== 6) {
      setEmailVerifyHint("인증 코드는 6자리 숫자입니다.");
      setMsg({
        type: "error",
        title: "🔢 인증코드를 확인해 주세요",
        desc: "메일로 받은 6자리 숫자 코드를 입력해 주세요.",
      });
      emailCodeRef.current?.focus();
      return;
    }

    try {
      setIsVerifyingCode(true);

      const data = await postJson(EMAIL_VERIFY_PATH, { email, code });

      setEmailVerified(true);
      setEmailVerifyHint(data?.message || "이메일 인증이 완료되었습니다.");

      setExpiresInSec(0);
      setCooldownSec(0);

      setMsg({
        type: "success",
        title: "✅ 이메일 인증 완료",
        desc: "이제 비밀번호를 입력하고 회원가입을 진행할 수 있어요!",
      });
    } catch (err) {
      const status = err?.status;
      const serverMsg = err?.data?.message || err?.message || "인증 확인에 실패했습니다.";

      if (status === 401) {
        setMsg({
          type: "error",
          title: "🔒 서버가 인증 없이 접근을 막고 있어요(401)",
          desc:
            "Spring Security에서 /api/auth/email/verify 를 permitAll로 열었는지 확인하세요. " +
            "또는 해당 API가 아직 구현되지 않았을 수 있어요.",
        });
      } else {
        setMsg({ type: "error", title: "❌ 이메일 인증 실패", desc: serverMsg });
      }

      setEmailVerifyHint(serverMsg);
    } finally {
      setIsVerifyingCode(false);
    }
  };

  // =========================================================
  // ✅ 회원가입 제출
  // =========================================================
  const handleSignup = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    setUsernameError("");
    setEmailError("");
    setMsg({ type: "info", title: "", desc: "" });

    const username = usernameRef.current?.value?.trim() || "";
    const email = emailRef.current?.value?.trim() || "";
    const password = passwordRef.current?.value || "";
    const confirm = confirmRef.current?.value || "";

    // ✅ (핵심) 실시간 중복체크 결과로 선차단
    if (usernameCheck.status === "dup") {
      setUsernameError("이미 사용 중인 아이디입니다.");
      setMsg({
        type: "error",
        title: "🚪 이미 사용 중인 집 주소입니다",
        desc: "다른 아이디로 새로운 집 주소를 정해주세요.",
      });
      usernameRef.current?.focus();
      return;
    }
    if (emailCheck.status === "dup") {
      setEmailError("이미 가입된 이메일입니다.");
      setMsg({
        type: "error",
        title: "📮 이미 가입된 이메일입니다",
        desc: "다른 이메일 주소로 다시 시도해 주세요.",
      });
      emailRef.current?.focus();
      return;
    }

    // ✅ 이메일 인증 먼저
    if (!emailVerified) {
      setMsg({
        type: "error",
        title: "📧 이메일 인증이 필요해요",
        desc: "회원가입 전에 이메일 인증을 먼저 완료해 주세요.",
      });
      return;
    }

    if (!username || !email || !password || !confirm) {
      setMsg({
        type: "error",
        title: "🧱 아직 재료가 부족해요",
        desc: "아이디(집 주소), 이메일, 비밀번호(열쇠)를 모두 입력해야 집을 지을 수 있어요.",
      });
      return;
    }

    // ✅ username 형식 체크도 한 번 더
    if (!usernameRegex.test(username)) {
      setUsernameError("아이디는 4~20자, 영문/숫자/_ 만 가능합니다.");
      setMsg({
        type: "error",
        title: "🚧 아이디 형식 오류",
        desc: "아이디는 4~20자, 영문/숫자/_ 만 가능합니다.",
      });
      usernameRef.current?.focus();
      return;
    }

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

    if (password !== confirm) {
      setMsg({
        type: "error",
        title: "🗝 열쇠가 서로 달라요",
        desc: "비밀번호와 비밀번호 확인이 일치하지 않습니다.",
      });
      confirmRef.current?.focus();
      return;
    }

    setIsLoading(true);

    try {
      const data = await api.post(PATH.AUTH_SIGNUP, {
        username,
        email,
        password,
        confirm,
      });

      if (data?.ok) {
        setMsg({
          type: "success",
          title: "🏠 내 집 마련의 첫 열쇠를 얻었습니다!",
          desc:
            (data?.message &&
              `${data.message} 잠시 후 로그인 화면으로 이동합니다.`) ||
            "가입이 완료되었습니다. 2초 뒤 로그인 화면으로 이동합니다.",
        });

        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 2000);
        return;
      }

      setMsg({
        type: "error",
        title: "⚠️ 응답이 예상과 다릅니다",
        desc: "회원가입 응답 형태가 예상과 다릅니다. 서버 응답을 확인해 주세요.",
      });
    } catch (err) {
      const status = err?.status;
      const serverMsg = err?.data?.message || err?.message || "";

      if (status === 409) {
        if (err?.code === "USER_DUPLICATE_EMAIL" || (serverMsg || "").includes("이메일")) {
          setEmailError(serverMsg || "이메일 중복 사용 불가");
          setMsg({
            type: "error",
            title: "📮 이미 사용 중인 이메일입니다",
            desc: "다른 이메일 주소로 다시 시도해 주세요.",
          });
          emailRef.current?.focus();
          return;
        }

        setUsernameError(serverMsg || "아이디 중복 사용 불가");
        setMsg({
          type: "error",
          title: "🚪 이미 사용 중인 집 주소입니다",
          desc: "다른 아이디로 새로운 집 주소를 정해주세요.",
        });
        usernameRef.current?.focus();
        return;
      }

      if (status === 400 && (serverMsg || "").includes("이메일")) {
        setEmailError(serverMsg);
        setMsg({
          type: "error",
          title: "📮 이메일을 확인해 주세요",
          desc: serverMsg,
        });
        emailRef.current?.focus();
        return;
      }

      if ((serverMsg || "").includes("이메일 인증")) {
        setMsg({
          type: "error",
          title: "📧 이메일 인증이 필요합니다",
          desc: serverMsg,
        });
        return;
      }

      setMsg({
        type: "error",
        title: "📡 가입 도중 문제가 발생했습니다",
        desc: serverMsg || "회원가입 처리 중 오류가 발생했습니다. (서버/콘솔 확인)",
      });
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ 입력 변경 핸들러(실시간 값 반영)
  const handleUsernameChange = (e) => {
    if (usernameError) setUsernameError("");
    setUsernameValue(e.target.value);
  };

  const handleEmailChange = (e) => {
    if (emailError) setEmailError("");
    setEmailValue(e.target.value);
  };

  const handleCodeChange = (e) => {
    const cleaned = sanitizeCode(e.target.value);
    e.target.value = cleaned;
  };

  // ✅ 중복이거나 체크 중이면 인증 못 보내게
  const canSendCode =
    !isLoading &&
    !emailVerified &&
    !isSendingCode &&
    cooldownSec === 0 &&
    isEmailValid &&
    emailCheck.status === "ok"; // ✅ 핵심: 이메일 "사용 가능"일 때만

  const canVerifyCode =
    !isLoading &&
    !emailVerified &&
    !isVerifyingCode &&
    expiresInSec > 0 &&
    isEmailValid &&
    emailCheck.status === "ok";

  // ✅ 가입 가능 조건(둘 중 하나라도 dup면 불가)
  const canSignup =
    !isLoading &&
    emailVerified &&
    usernameCheck.status === "ok" &&
    emailCheck.status === "ok";

  const usernameHintClass =
    usernameCheck.status === "ok"
      ? "ok"
      : usernameCheck.status === "dup"
      ? "dup"
      : usernameCheck.status === "checking"
      ? "checking"
      : usernameCheck.status === "invalid" || usernameCheck.status === "error"
      ? "invalid"
      : "";

  const emailHintClass =
    emailCheck.status === "ok"
      ? "ok"
      : emailCheck.status === "dup"
      ? "dup"
      : emailCheck.status === "checking"
      ? "checking"
      : emailCheck.status === "invalid" || emailCheck.status === "error"
      ? "invalid"
      : "";

  return (
    <div className="auth-page">
      <div className="auth-grid" style={{ whiteSpace: "pre-line" }}>
        <AuthSidePanels
          left={{
            title: "가입 안내",
            text:
              "내집마련의 시작! 간단히 가입하고 참여하세요.\n" +
              "• 아이디/이메일은 중복 불가\n" +
              "• 이메일 인증(필수) 완료 후 비밀번호 입력이 열립니다.\n" +
              "• 인증코드는 5분 유효 / 30초 후 재발송 가능",
            links: [
              { to: "/help", label: "고객센터" },
              { to: "/login", label: "로그인" },
              { to: "/find-id", label: "아이디 찾기" },
              { to: "/find-pw", label: "비밀번호 찾기" },
            ],
            notices: [
              "아이디는 4~20자, 영문/숫자/_ 만 가능합니다.",
              "이메일은 중복 불가이며, 인증이 필요합니다.",
              "✅ 입력 즉시 중복 체크(실시간)로 UX를 개선했습니다.",
            ],
            tips: [
              "아이디/이메일이 중복이면 가입/인증 진행이 막힙니다.",
              "인증코드가 오지 않으면 스팸함을 확인하세요.",
              "인증 완료 후 ‘가입하기’가 활성화됩니다.",
            ],
          }}
          right={{
            title: "가입 가이드",
            text: "story.mp4가 화면에 보이면 자동 재생됩니다.",
            videoSrc: "/video/story.mp4",
            videoControls: false,
            mediaTopText: "집은 ‘주소’로 시작되고,\n‘연락처’로 완성됩니다.",
            mediaBottomText:
              "이메일 인증은 안전한 내집마련을 위한\n가장 작은 잠금장치입니다.",
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
              {/* ✅ username */}
              <input
                ref={usernameRef}
                className="auth-input"
                type="text"
                placeholder="아이디 (집 주소)"
                autoComplete="username"
                name="username"
                onChange={handleUsernameChange}
                disabled={isLoading}
              />

              {usernameError && <div className="auth-input-error">{usernameError}</div>}

              {/* ✅ 실시간 중복 체크 힌트 */}
              {usernameCheck.status !== "idle" && !usernameError && (
                <div className={`auth-hint ${usernameHintClass}`}>{usernameCheck.msg}</div>
              )}

              {/* ✅ email */}
              <input
                ref={emailRef}
                className="auth-input"
                type="email"
                placeholder="이메일 (연락처)"
                autoComplete="email"
                name="email"
                onChange={handleEmailChange}
                disabled={isLoading || emailVerified}
              />

              {emailError && <div className="auth-input-error">{emailError}</div>}

              {/* ✅ 실시간 중복 체크 힌트 */}
              {emailCheck.status !== "idle" && !emailError && (
                <div className={`auth-hint ${emailHintClass}`}>{emailCheck.msg}</div>
              )}

              {/* ✅ 이메일 인증 상태 뱃지(선택) */}
              {emailVerified && <div className="auth-badge-ok">✅ 이메일 인증 완료</div>}

              {/* ✅ 이메일 인증 버튼 / 상태 */}
              <div className="auth-row auth-row--compact">
                <button
                  type="button"
                  className="auth-btn auth-btn--mini"
                  onClick={handleSendEmailCode}
                  disabled={!canSendCode}
                  style={{ flex: 1 }}
                  title={
                    emailCheck.status === "dup"
                      ? "이미 가입된 이메일입니다."
                      : emailCheck.status === "checking"
                      ? "이메일 중복 확인 중입니다."
                      : emailCheck.status === "error"
                      ? "중복 확인 실패(서버 오류)"
                      : !isEmailValid
                      ? "이메일 형식을 확인하세요."
                      : ""
                  }
                >
                  {emailVerified
                    ? "✅ 인증 완료"
                    : cooldownSec > 0
                    ? `재발송(${cooldownSec}s)`
                    : isSendingCode
                    ? "발송 중..."
                    : emailCheck.status === "dup"
                    ? "중복 이메일"
                    : emailCheck.status === "checking"
                    ? "중복 확인 중..."
                    : "인증코드 보내기"}
                </button>

                {/* ✅ 타이머 텍스트는 클래스 통일 */}
                <div className="auth-timer">{expiresText}</div>
              </div>

              {/* ✅ 인증 코드 입력 + 확인 버튼 */}
              <div className="auth-row auth-row--compact">
                <input
                  ref={emailCodeRef}
                  className="auth-input"
                  type="text"
                  placeholder="인증코드 6자리"
                  inputMode="numeric"
                  maxLength={6}
                  onChange={handleCodeChange}
                  disabled={
                    isLoading ||
                    emailVerified ||
                    expiresInSec <= 0 ||
                    emailCheck.status !== "ok"
                  }
                  style={{ flex: 1, marginBottom: 0 }}
                />

                <button
                  type="button"
                  className="auth-btn auth-btn--mini"
                  onClick={handleVerifyEmailCode}
                  disabled={!canVerifyCode}
                  style={{ flex: 1 }}
                >
                  {isVerifyingCode ? "확인 중..." : "인증 확인"}
                </button>
              </div>

              {emailVerifyHint && <div className="auth-input-hint">{emailVerifyHint}</div>}

              {/* ✅ 인증 완료 전에는 비밀번호 입력칸을 보여주지 않음 */}
              {emailVerified && (
                <>
                  <div className="auth-divider" />

                  <input
                    ref={passwordRef}
                    className="auth-input"
                    type="password"
                    placeholder="비밀번호 (열쇠)"
                    autoComplete="new-password"
                    name="password"
                    disabled={isLoading}
                  />

                  <input
                    ref={confirmRef}
                    className="auth-input"
                    type="password"
                    placeholder="비밀번호 확인 (열쇠 재확인)"
                    autoComplete="new-password"
                    name="confirm"
                    disabled={isLoading}
                  />
                </>
              )}

              <button
                className="auth-btn"
                type="submit"
                disabled={!canSignup}
                title={
                  !emailVerified
                    ? "이메일 인증을 먼저 완료해주세요."
                    : usernameCheck.status !== "ok"
                    ? "아이디 중복/형식을 확인해주세요."
                    : emailCheck.status !== "ok"
                    ? "이메일 중복/형식을 확인해주세요."
                    : ""
                }
              >
                {isLoading
                  ? "집을 짓는 중..."
                  : !emailVerified
                  ? "이메일 인증 필요"
                  : !canSignup
                  ? "중복 확인 필요"
                  : "가입하기"}
              </button>

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
