import { Link, NavLink, useNavigate } from "react-router-dom";
import { useUsersContext } from "./context/useUsersContext";
import { AUTH_KEY, USERS } from "./config/constants";

export default function Header() {
  const activeStyle = { color: "yellow", fontWeight: "bold" };

  const navigate = useNavigate();
  const { usersInfo, dispatch } = useUsersContext();
  const { isAuthenticated } = usersInfo;

  const handleLogout = (e) => {
    e.preventDefault();

    // ✅ localStorage + sessionStorage 모두 삭제
    localStorage.removeItem(AUTH_KEY.USERNAME);
    sessionStorage.removeItem(AUTH_KEY.USERNAME);

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
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                {!isAuthenticated ? (
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
    </>
  );
}
