//<접근 제한이 필요한 라우팅 컴포넌트들 제한하기위 위한 Protected Router컴포넌트>
//라우터 단계에서 인증 여부 검사하기 위한 컴포넌트(Router Guard)

import { Navigate, Outlet, useLocation, useOutletContext } from "react-router-dom";
import { AUTH_KEY } from "../config/constants"

//이 AuthRoute컴포넌트로 접근 제한이 필요한 컴포넌트들을 자식으로 라우팅 설정
export default function AuthRoute(){

   
    const isAuth = sessionStorage.getItem(AUTH_KEY.USERNAME);   
    const context = useOutletContext();
    console.log('(AuthRoute.jsx)context:',context);

    //원래 페이지로 이동하기 위해 useLocation훅 사용
    const location = useLocation(); 
    console.log('(AuthRoute.jsx)location:',location);
    //로그인이 안되어 있으면
    if(!isAuth){
        window.alert('로그인 후 이용하세요');
        //<Navigate>
        //Navigate 컴포넌트 렌더링 시점에 조건부로 
        //다른 경로로 리다이렉트(이동)하기 위한 컴포넌트
        //즉,화면없이 이동시키기 위한 컴포넌트다 
        //to는 필수 속성
        //replace는 로그인 후 뒤로가기시 로그인 페이지로 못가게
        //즉,/login이 히스토리 스택에 남지 않는다

        return <Navigate 
                to="/login" 
                replace
                state={{ from: location.pathname }}//원래 가려던 path저장(state: { from: "/bbs" })
                />
    } 
    //로그인 된 경우
    //자식 라우트로 렌더링하기위해 무조건 <Outlet>반환    
    return <Outlet/>;
    
}