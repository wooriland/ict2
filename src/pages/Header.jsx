// src/pages/Header.jsx (또는 src/pages/Header/index.jsx 프로젝트 구조에 맞춰 위치 유지)
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useUsersContext } from "../context/useUsersContext";
import { AUTH_KEY, USERS, STORAGE_KEY } from "../config/constants";

export default function Header() {
  // NavLink active style
  const activeStyle = { color: "yellow", fontWeight: "bold" };

  const navigate = useNavigate();
  const { usersInfo, dispatch } = useUsersContext();

  /**
   * ✅ 최종 목표(0~3) 기준 Header 정책
   * 1) "로그인 여부"는 전역 상태가 최우선(UsersProvider가 /api/users/me로 복구)
   * 2) 전역 상태가 아직 준비 전일 수 있으니(local render 타이밍),
   *    localStorage에 토큰/유저네임이 있으면 임시로 로그인으로 판단(안정성)
   * 3) "누구로 로그인했는지"는 profile(email/name)을 표시
   */

  // ✅ 스토리지 fallback(전역 상태 아직 안 올라왔을 때)
  const storageUsername =
    localStorage.getItem(AUTH_KEY.USERNAME) ||
    sessionStorage.getItem(AUTH_KEY.USERNAME) ||
    "";

  const storageToken =
    localStorage.getItem(STORAGE_KEY.ACCESS_TOKEN) ||
    sessionStorage.getItem(STORAGE_KEY.ACCESS_TOKEN) ||
    "";

  // ✅ 전역 상태(UsersProvider가 /me로 채워주는 값)
  const isAuthenticated = !!usersInfo?.isAuthenticated;
  const profile = usersInfo?.profile || null;

  // ✅ 최종 로그인 판정(전역 우선 + 스토리지 보조)
  const isAuth = isAuthenticated || !!storageToken || !!storageUsername;

  // ✅ 표시 이름(가능하면 email -> name -> username 순)
  const who =
    profile?.email ||
    profile?.name ||
    profile?.username ||
    storageUsername ||
    "";

  const handleLogout = (e) => {
    e.preventDefault();

    // ✅ 아이디 로그인 키 제거
    localStorage.removeItem(AUTH_KEY.USERNAME);
    sessionStorage.removeItem(AUTH_KEY.USERNAME);

    // ✅ 소셜 로그인 토큰 제거
    localStorage.removeItem(STORAGE_KEY.ACCESS_TOKEN);
    sessionStorage.removeItem(STORAGE_KEY.ACCESS_TOKEN);

    // ✅ 계정 연결 임시 토큰 제거
    localStorage.removeItem(STORAGE_KEY.SOCIAL_TEMP_TOKEN);
    sessionStorage.removeItem(STORAGE_KEY.SOCIAL_TEMP_TOKEN);

    // ✅ 플래시 토스트도 혹시 남아있으면 제거(선택)
    sessionStorage.removeItem("FLASH_TOAST");

    // ✅ 전역 상태 로그아웃
    dispatch({ type: USERS.LOGOUT });

    navigate("/login", { replace: true });
  };

  return (
    <>
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
              {/* ✅ "누구로 로그인했는지" 표시 */}
              {isAuth && (
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
                  <NavLink
                    className="nav-link"
                    to="/login"
                    onClick={handleLogout}
                  >
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
    </>
  );
}
