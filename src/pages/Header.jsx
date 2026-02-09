import { Link, NavLink, useNavigate } from "react-router-dom";
import { useUsersContext } from "../context/useUsersContext";
import { AUTH_KEY, USERS } from "../config/constants";

export default function Header(){

    //<<NavLink의 style속성에 사용할 CSS 스타일>>
    const activeStyle={color:'yellow',fontWeight:'bold'};
    const navigate = useNavigate();
    const {usersInfo,dispatch} = useUsersContext();
    const {isAuthenticated} = usersInfo;

    const handleLogout=(e)=>{
        //e.preventDefault(); 코드 추가시 마지막에 navigate('/login')으로 
        //프로그래밍적으로 이동 시켜야 한다
        //미 추가시는 href에 지정한 URL로 이동한다 
        //즉,navigate('/login') 코드 불 필요
        //e.preventDefault();//a태그의 기본 기능인 이동 막기
        //1)세션 스토리지에 "username"이라는 키 삭제
        sessionStorage.removeItem(AUTH_KEY.USERNAME);
        //2)로그인 상태(isAuthenticated)를 null로 변경 
        dispatch({type:USERS.LOGOUT});
       
   
    };
    return <>
        <nav className="navbar navbar-expand-sm bg-dark navbar-dark fixed-top">
            <div className="container-fluid">
                
                <Link className="navbar-brand" to="/"><i className="fa-solid fa-house"></i></Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#collapsibleNavbar">
                <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="collapsibleNavbar">
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item">   
                        {
                            !isAuthenticated ?                                                
                            <NavLink className="nav-link" to="/login" style={({isActive})=>isActive?activeStyle:null}>로그인</NavLink>
                            :
                            <NavLink className="nav-link" onClick={handleLogout} to="/login" >로그아웃</NavLink>
                        }
                        </li>   
                       
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/users" style={({isActive})=>isActive?activeStyle:null}>회원</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className="nav-link"  to="/bbs" style={({isActive})=>isActive?activeStyle:null}>게시판</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/photo" style={({isActive})=>isActive?activeStyle:null}>사진앨범</NavLink>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    </>
}