// ✅ 파일: src/pages/member/Profile.jsx
// - UsersProvider/P0 규칙에 맞춰 토큰 키/URL 키를 통일한 안정화 버전
// - "axios dynamic import" 제거(번들/로딩 꼬임 방지)
// - AUTH_KEY.TOKEN 대신 STORAGE_KEY.ACCESS_TOKEN 사용 (지금 프로젝트 표준)
// - URL.USERS_ME / URL.ME 혼재 방지: URL.ME(= /api/users/me)로 통일
// - 401/403 처리 시 토큰/환영 1회성 값 정리

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import { AUTH_KEY, STORAGE_KEY, URL } from "../../config/constants";

export default function Profile({ user }) {
  const params = useParams();
  const navigate = useNavigate();

  // ✅ prop으로 내려오면 우선 사용, 아니면 /me로 채움
  const [me, setMe] = useState(user || null);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "info", text: "" }); // info|error|success

  // ✅ 토큰은 프로젝트 표준 키로 읽는다 (local/session 둘 다)
  const token = useMemo(() => {
    return (
      localStorage.getItem(STORAGE_KEY.ACCESS_TOKEN) ||
      sessionStorage.getItem(STORAGE_KEY.ACCESS_TOKEN) ||
      null
    );
  }, []);

  // =========================================================
  // ✅ 새로고침 대응: /api/users/me 호출
  // =========================================================
  useEffect(() => {
    // ✅ 이미 있으면 호출 불필요
    if (me) return;

    // ✅ 토큰 없으면 로그인으로
    if (!token) {
      setMsg({ type: "error", text: "로그인이 필요합니다. 다시 로그인해주세요." });
      navigate("/login", { replace: true });
      return;
    }

    // ✅ URL 키 통일: UsersProvider에서 URL.ME를 쓰는 중이므로 동일하게
    // (constants에 URL.ME가 없다면 URL.USERS_ME를 쓰되 둘 중 하나로 통일)
    const ME_URL = URL.ME || URL.USERS_ME || URL.USERS_ME; // 마지막은 방어용

    setLoading(true);
    setMsg({ type: "info", text: "내 정보를 불러오는 중..." });

    axios
      .get(ME_URL, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setMe(res.data);
        setMsg({ type: "success", text: "프로필을 불러왔습니다." });

        // ✅ (호환) username 내려오면 AUTH_KEY.USERNAME에도 저장
        if (res?.data?.username) {
          localStorage.setItem(AUTH_KEY.USERNAME, res.data.username);
        }
      })
      .catch((err) => {
        const status = err?.response?.status;
        const serverMsg =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          "프로필 정보를 불러오지 못했습니다.";

        // ✅ 401/403: 만료/무효 → 인증 흔적 정리 후 로그인 이동
        if (status === 401 || status === 403) {
          // 토큰 제거
          localStorage.removeItem(STORAGE_KEY.ACCESS_TOKEN);
          sessionStorage.removeItem(STORAGE_KEY.ACCESS_TOKEN);

          // 호환키 제거(남아있을 수 있음)
          localStorage.removeItem(AUTH_KEY.TOKEN);
          sessionStorage.removeItem(AUTH_KEY.TOKEN);

          // username 흔적 제거
          localStorage.removeItem(AUTH_KEY.USERNAME);
          sessionStorage.removeItem(AUTH_KEY.USERNAME);

          // ✅ OAuth 환영 1회성 값 제거(있으면)
          sessionStorage.removeItem("oauthProvider");
          sessionStorage.removeItem("oauthWelcomeName");

          setMsg({ type: "error", text: serverMsg });
          navigate("/login", { replace: true });
          return;
        }

        setMsg({ type: "error", text: serverMsg });
      })
      .finally(() => setLoading(false));
  }, [me, token, navigate]);

  const paramUsername = params?.username;

  // ✅ 화면 표시용 안전 처리
  const view = {
    name: me?.name || me?.username || "사용자",
    username: me?.username || paramUsername || "-",
    email: me?.email || "",
    provider: me?.provider || "LOCAL",
    profile:
      me?.profile ||
      (String(me?.provider || "").toUpperCase() === "GOOGLE"
        ? "Google 계정으로 로그인한 사용자입니다."
        : String(me?.provider || "").toUpperCase() === "KAKAO"
        ? "Kakao 계정으로 로그인한 사용자입니다."
        : "일반 로그인 사용자입니다."),
  };

  return (
    <>
      <div className="my-3 p-5 bg-dark text-white rounded">
        <h1>{view.name}의 상세 정보</h1>

        {/* ✅ 상태 메시지 */}
        {msg.text && (
          <p
            style={{
              marginTop: 12,
              padding: "10px 12px",
              borderRadius: 10,
              background:
                msg.type === "error"
                  ? "rgba(255,0,0,0.15)"
                  : msg.type === "success"
                  ? "rgba(0,255,0,0.12)"
                  : "rgba(255,255,255,0.08)",
            }}
          >
            {msg.text}
          </p>
        )}

        <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
          <Link to="/" className="btn btn-outline-light btn-sm">
            홈으로
          </Link>
          <Link to="/help" className="btn btn-outline-light btn-sm">
            고객센터
          </Link>
        </div>
      </div>

      <table className="table" data-bs-theme="dark">
        <tbody>
          <tr>
            <th style={{ width: 140 }}>아이디</th>
            <td className="bg-info">{view.username}</td>
          </tr>

          <tr>
            <th>로그인 방식</th>
            <td className="bg-info">{view.provider}</td>
          </tr>

          <tr>
            <th>이메일</th>
            <td className="bg-info">{view.email || "-"}</td>
          </tr>

          <tr>
            <th>프로필</th>
            <td className="bg-info">{view.profile}</td>
          </tr>
        </tbody>
      </table>

      {loading && (
        <div className="text-center my-3" style={{ opacity: 0.8 }}>
          불러오는 중...
        </div>
      )}
    </>
  );
}
