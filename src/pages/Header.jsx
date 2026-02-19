// ✅ 파일: src/pages/Header.jsx
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useUsersContext } from "../context/useUsersContext";
import { USERS, STORAGE_KEY, AUTH_KEY } from "../config/constants";

export default function Header() {
  const activeStyle = { color: "yellow", fontWeight: "bold" };

  const navigate = useNavigate();
  const { usersInfo, dispatch } = useUsersContext();

  const isAuthenticated = !!usersInfo?.isAuthenticated;
  const profile = usersInfo?.profile || null;

  const token =
    localStorage.getItem(STORAGE_KEY.ACCESS_TOKEN) ||
    sessionStorage.getItem(STORAGE_KEY.ACCESS_TOKEN) ||
    "";

  const isAuth = isAuthenticated || !!token;

  // ✅ 표시 이름 우선순위 개선
  // - kakao placeholderEmail(@social.local) 그대로 노출 방지
  const who = (() => {
    const dn = profile?.displayName?.trim();
    if (dn) return dn;

    const name = profile?.name?.trim();
    if (name) return name;

    const email = profile?.email?.trim();
    if (email) return email;

    const un = profile?.username?.trim();
    if (!un) return "";

    // placeholderEmail이면 표시 숨기기(또는 "소셜 사용자" 같은 문구로 대체)
    if (un.includes("@social.local")) return "소셜 사용자";
    return un;
  })();

  const handleLogout = (e) => {
    e.preventDefault();

    localStorage.removeItem(STORAGE_KEY.ACCESS_TOKEN);
    sessionStorage.removeItem(STORAGE_KEY.ACCESS_TOKEN);

    localStorage.removeItem(AUTH_KEY.TOKEN);
    sessionStorage.removeItem(AUTH_KEY.TOKEN);

    localStorage.removeItem(AUTH_KEY.USERNAME);
    sessionStorage.removeItem(AUTH_KEY.USERNAME);

    localStorage.removeItem(STORAGE_KEY.SOCIAL_TEMP_TOKEN);
    sessionStorage.removeItem(STORAGE_KEY.SOCIAL_TEMP_TOKEN);

    sessionStorage.removeItem("oauthProvider");
    sessionStorage.removeItem("oauthWelcomeName");

    dispatch({ type: USERS.LOGOUT });
    navigate("/login", { replace: true });
  };

  return (
    <nav className="navbar navbar-expand-sm bg-dark navbar-dark fixed-top">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          <i className="fa-solid fa-house"></i>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#collapsibleNavbar"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="collapsibleNavbar">
          <ul className="navbar-nav ms-auto align-items-center">
            {isAuth && who && (
              <li className="nav-item me-2">
                <span
                  className="navbar-text"
                  style={{ color: "#ddd", fontSize: 14 }}
                  title={who}
                >
                  로그인:{" "}
                  <b style={{ color: "white" }}>
                    {who.length > 22 ? `${who.slice(0, 22)}...` : who}
                  </b>
                </span>
              </li>
            )}

            <li className="nav-item">
              {!isAuth ? (
                <NavLink
                  className="nav-link"
                  to="/login"
                  style={({ isActive }) => (isActive ? activeStyle : null)}
                >
                  로그인
                </NavLink>
              ) : (
                <NavLink className="nav-link" to="/login" onClick={handleLogout}>
                  로그아웃
                </NavLink>
              )}
            </li>

            <li className="nav-item">
              <NavLink
                className="nav-link"
                to="/users"
                style={({ isActive }) => (isActive ? activeStyle : null)}
              >
                회원
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                className="nav-link"
                to="/bbs"
                style={({ isActive }) => (isActive ? activeStyle : null)}
              >
                게시판
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                className="nav-link"
                to="/photo"
                style={({ isActive }) => (isActive ? activeStyle : null)}
              >
                사진앨범
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
