import { Link, NavLink, useNavigate } from "react-router-dom";

export default function Header(){

    //<<NavLink의 style속성에 사용할 CSS 스타일>>
    const activeStyle={color:'yellow',fontWeight:'bold'};

    const navigate = useNavigate();
    return <>
        <nav className="navbar navbar-expand-sm bg-dark navbar-dark fixed-top">
            <div className="container-fluid">
                {/*
                a태그의 기본 기능인 새로고침으로 인해 클릭시 새로고침이 일어난다
                <a className="navbar-brand" href="/"><i className="fa-solid fa-house"></i></a>
                */}
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
                            
                                <NavLink className="nav-link" onClick={()=>processLogout()} to="/logout">로그아웃</NavLink>
                            
                        }
                        </li>
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/users" style={({isActive})=>isActive?activeStyle:null}>회원</NavLink>
                        </li>

                        <li className="nav-item">
                            <NavLink className="nav-link" to="/bbs" style={({isActive})=>isActive?activeStyle:null}>게시판</NavLink>
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