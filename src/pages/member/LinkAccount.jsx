// src/pages/member/LinkAccount.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams, Link, useLocation } from "react-router-dom";
import AuthSidePanels from "../../components/AuthSidePanels";
import axios from "axios";
import { API_BASE, ROUTE, STORAGE_KEY } from "../../config/constants";

// ✅ Toast
import { toast } from "react-toastify";

/**
 * ✅ LinkAccount
 * - socialTempToken을 받아서 "기존 계정과 연결" 또는 "OTP 연결" 또는 "새 계정 계속" 수행
 *
 * ✅ UX 정책(안내 순서)
 * - 연결 페이지에 진입하면 토스트 1회:
 *   "계정 연결이 필요합니다. 아래 방법으로 연결해주세요."
 *
 * ✅ 안정성 보강
 * - socialTempToken이 state에 아직 세팅되기 전에 버튼 누르면 빈 값 호출되는 문제 방지(가드 + 버튼 비활성)
 * - StrictMode(개발 모드) useEffect 2번 실행 방지(useRef)
 * - 의존성은 location.search 기반이 안전
 * - 진행 중 로딩 상태 관리(중복 요청 방지)
 */
export default function LinkAccount() {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();

  const [socialTempToken, setSocialTempToken] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ StrictMode 중복 실행 방지
  const ranRef = useRef(false);

  // ✅ 로컬 계정 연결 input
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);

  // ✅ OTP input
  const emailRef = useRef(null);
  const otpRef = useRef(null);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    // ✅ 1) 쿼리 우선, 없으면 localStorage
    const q = params.get("socialTempToken");
    const saved = localStorage.getItem(STORAGE_KEY.SOCIAL_TEMP_TOKEN);
    const token = q || saved || "";

    if (!token) {
      // ✅ 토큰이 없으면 연결할 수 없으니 로그인 화면으로 복귀
      toast.warn("연결 정보가 없습니다. 다시 로그인해주세요.", {
        toastId: "link-no-token",
      });
      navigate(ROUTE.LOGIN, { replace: true });
      return;
    }

    setSocialTempToken(token);
    localStorage.setItem(STORAGE_KEY.SOCIAL_TEMP_TOKEN, token);

    // ✅ 2) OAuth2Redirect에서 넘긴 플래그가 있으면 여기서 토스트 1번만
    const flash = sessionStorage.getItem("FLASH_TOAST");
    if (flash === "LINK_REQUIRED") {
      toast.info("계정 연결이 필요합니다. 아래 방법으로 연결해주세요.", {
        toastId: "link-required-page",
      });
      sessionStorage.removeItem("FLASH_TOAST");
    }
  }, [location.search, navigate, params]);

  /**
   * ✅ 공통 가드
   * - socialTempToken이 없거나 로딩 중이면 막음
   */
  const ensureReady = () => {
    if (loading) return false;

    if (!socialTempToken) {
      toast.warn("연결 토큰이 없습니다. 다시 로그인 시도해주세요.", {
        toastId: "link-missing-token",
      });
      navigate(ROUTE.LOGIN, { replace: true });
      return false;
    }

    return true;
  };

  // ✅ 1) 아이디/비번으로 연결
  const handleLinkWithPassword = async (e) => {
    e.preventDefault();
    if (!ensureReady()) return;

    const username = usernameRef.current?.value?.trim() || "";
    const password = passwordRef.current?.value || "";

    if (!username || !password) {
      toast.warn("아이디/비밀번호를 입력하세요.", { toastId: "link-pw-empty" });
      return;
    }

    try {
      setLoading(true);

      // POST /api/oauth2/link/password
      const res = await axios.post(`${API_BASE}/api/oauth2/link/password`, {
        socialTempToken,
        username,
        password,
      });

      // ✅ 성공하면 최종 JWT를 받는다고 가정
      const token = res.data?.token;

      if (token) {
        localStorage.setItem(STORAGE_KEY.ACCESS_TOKEN, token);
        localStorage.removeItem(STORAGE_KEY.SOCIAL_TEMP_TOKEN);

        // ✅ 메인에서 "연결 완료" 토스트 1회
        sessionStorage.setItem("FLASH_TOAST", "LINK_OK");

        navigate(ROUTE.HOME, { replace: true });
      } else {
        toast.error("연결은 되었지만 토큰이 없습니다. 백엔드 응답 확인 필요", {
          toastId: "link-pw-no-token",
        });
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "연결 실패(아이디/비밀번호)", {
        toastId: "link-pw-fail",
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ 2-A) OTP 발송
  const handleSendOtp = async () => {
    if (!ensureReady()) return;

    const email = emailRef.current?.value?.trim() || "";
    if (!email) {
      toast.warn("이메일을 입력하세요.", { toastId: "otp-email-empty" });
      return;
    }

    try {
      setLoading(true);

      // POST /api/oauth2/link/otp/send
      await axios.post(`${API_BASE}/api/oauth2/link/otp/send`, {
        socialTempToken,
        email,
      });

      toast.success("인증코드를 이메일로 보냈습니다.", { toastId: "otp-sent" });
    } catch (err) {
      toast.error(err?.response?.data?.message || "OTP 발송 실패", {
        toastId: "otp-send-fail",
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ 2-B) OTP 확인
  const handleVerifyOtp = async () => {
    if (!ensureReady()) return;

    const email = emailRef.current?.value?.trim() || "";
    const code = otpRef.current?.value?.trim() || "";

    if (!email || !code) {
      toast.warn("이메일/인증코드를 입력하세요.", { toastId: "otp-empty" });
      return;
    }

    try {
      setLoading(true);

      // POST /api/oauth2/link/otp/verify
      const res = await axios.post(`${API_BASE}/api/oauth2/link/otp/verify`, {
        socialTempToken,
        email,
        code,
      });

      const token = res.data?.token;
      if (token) {
        localStorage.setItem(STORAGE_KEY.ACCESS_TOKEN, token);
        localStorage.removeItem(STORAGE_KEY.SOCIAL_TEMP_TOKEN);

        // ✅ 메인에서 "연결 완료" 토스트 1회
        sessionStorage.setItem("FLASH_TOAST", "LINK_OK");

        navigate(ROUTE.HOME, { replace: true });
      } else {
        toast.error("토큰이 없습니다. 백엔드 응답 확인 필요", {
          toastId: "otp-no-token",
        });
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "OTP 인증 실패", {
        toastId: "otp-verify-fail",
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ 3) 새 계정으로 계속(선택)
  const handleContinueAsNew = async () => {
    if (!ensureReady()) return;

    try {
      setLoading(true);

      // POST /api/oauth2/continue-new
      const res = await axios.post(`${API_BASE}/api/oauth2/continue-new`, {
        socialTempToken,
      });

      const token = res.data?.token;
      if (token) {
        localStorage.setItem(STORAGE_KEY.ACCESS_TOKEN, token);
        localStorage.removeItem(STORAGE_KEY.SOCIAL_TEMP_TOKEN);

        sessionStorage.setItem("FLASH_TOAST", "GOOGLE_LOGIN_OK");
        navigate(ROUTE.HOME, { replace: true });
      } else {
        toast.error("토큰이 없습니다.", { toastId: "continue-new-no-token" });
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "새 계정 진행 실패", {
        toastId: "continue-new-fail",
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
            title: "계정 연결이 필요합니다",
            text:
              "Google 로그인은 성공했지만,\n" +
              "기존 계정과 연결이 필요한 상태입니다.\n\n" +
              "방법 1) 아이디/비밀번호로 연결\n" +
              "방법 2) 이메일 인증(OTP)으로 연결\n\n" +
              "연결이 완료되면 자동으로 로그인됩니다.",
            links: [
              { to: "/login", label: "로그인으로" },
              { to: "/signup", label: "회원가입" },
              { to: "/help", label: "고객센터" },
            ],
          }}
          right={{ title: "계정 연결", text: "아래 방법 중 하나를 선택하세요." }}
        />

        <div className="auth-form">
          <h2>계정 연결</h2>

          <form onSubmit={handleLinkWithPassword}>
            <h3>아이디/비밀번호로 연결</h3>
            <input ref={usernameRef} placeholder="아이디" disabled={loading} />
            <input
              ref={passwordRef}
              type="password"
              placeholder="비밀번호"
              disabled={loading}
            />
            <button type="submit" disabled={loading || !socialTempToken}>
              {loading ? "처리 중..." : "연결하기"}
            </button>
          </form>

          <hr style={{ margin: "16px 0" }} />

          <div>
            <h3>이메일 OTP로 연결</h3>
            <input ref={emailRef} placeholder="이메일" disabled={loading} />
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={loading || !socialTempToken}
            >
              {loading ? "처리 중..." : "인증코드 보내기"}
            </button>

            <div style={{ marginTop: 8 }}>
              <input ref={otpRef} placeholder="인증코드 입력" disabled={loading} />
              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={loading || !socialTempToken}
              >
                {loading ? "처리 중..." : "확인"}
              </button>
            </div>
          </div>

          <hr style={{ margin: "16px 0" }} />

          <button
            type="button"
            onClick={handleContinueAsNew}
            disabled={loading || !socialTempToken}
          >
            {loading ? "처리 중..." : "새 계정으로 계속"}
          </button>

          <p style={{ marginTop: 12 }}>
            <Link to={ROUTE.LOGIN}>로그인으로 돌아가기</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
