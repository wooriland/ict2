import {  Navigate, redirect} from "react-router-dom";
import { AUTH_KEY } from "../config/constants";

//<loader 함수 정의>
//loader는 라우팅 컴포넌트가 렌더링되기 전에 실행되는 함수
//데이터 로딩, 접근 제어를 담당
//라우팅 설정에서 loader속성으로 지정
//함수에서 return은 데이터,throw는 이동(redirect)시 
export function authLoader() {

  
  const isAuth = sessionStorage.getItem(AUTH_KEY.USERNAME);   

  if (!isAuth) {
    //<<redirect()함수>>
    //함수로 리다이렉트 이동시
    //JSX컴포넌트에서는 사용불가
    //<Navigate>는 컴포넌트임으로 JSX안에서만 사용 가능   
    window.alert('먼저 로그인 하세요')
    throw redirect('/login');
  }

  return null;//라우팅의 loader속성에 null지정
}
