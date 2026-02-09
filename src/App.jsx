import './App.css'
import Header from './pages/Header'
import { Outlet } from 'react-router-dom'
import UsersProvider from './provider/UsersProvider'

/*
  <<<<리액트에서 인증하기 흐름>>>
  1.아이디와 비번을 백엔드 서버로 전송 
    fetch나 axios와 같은 라이브러리를 사용하여 HTTP 요청

  2.백엔드 서버는 사용자가 제출한 아이디와 비밀번호를 확인
    인증에 성공하면 JWT(JSON Web Token:인증 토큰) 또는 Http Only 쿠키
    또는 사용자 아이디(JSON-SERVER 사용시)를 클라이언트로 반환
    회원이 아닌 경우는 null등 반환

  3.로그인 처리 : 클라이언트는 서버로부터 받은 토큰이나 사용자 아이디를
                localStorage 또는 sessionStorage에 저장
    로그인 여부 판단 : localStorage 또는 sessionStorage 저장 여부 파악
    로그아웃처리 : localStorage 또는 sessionStorage 저장에 된 인증 관련 데이타 삭제
  
  4.리액트 애플리케이션에서 전역으로 인증 상태를 State로 관리  
    즉 토큰이나 혹은 아이디를
    스테이트 값으로 하고 이를 사용하여 사용자의 인증 상태를 유지

  만약 사용자가 인증되지 않은 상태에서 인증이 필요한 라우트에 접근하려고
  하면 로그인 페이지로 리다이렉트
  (react-router-dom v6의 Navigate컴포넌트 혹은 redirect()함수 사용) 한다

*/

/* << Outlet 컴포넌트 사용 버전>> */

 {/*

    [<Outlet/> 사용]
    ->App이 레이아웃 컴포넌트 역할
    
    < <Outlet/> 사용하기 위한 흐름>
    1)src에 router.jsx 생성하여 라우터 설정
      1-1)createBrowserRouter() 호출하여 BrowserRouter객체 생성
      1-2)생성시 인자로 라우팅 정보 설정
      1-3)생성된 BrowserRouter객체를 내보내기
      라우트 설정을 router.jsx로 분리
    2)main.jsx에서  1)에서 생성한 BrowserRouter객체를  
      RouterProvider의 router속성에 지정
      App이 아닌 RouterProvider를 렌더링    
    3)App.jsx에서 <Outlet />으로 자식 컴포넌트가 뿌려질 위치를 레이아웃 
    4)<Outlet />컴포넌트의 context속성에 자식 라우팅 컴포넌트에서 필요한
      데이타 지정  
  
    ※router.jsx에서 라우터 설정을 분리하여 관리
    라우팅 유지보수가 쉬워지고 Props Drilling을 하지 않는다
    React Router Dom v6.4 이상에서는 Outlet에 context를 
    제공하여 모든 자식에게 데이터를 전달할 수 있다(권장) 
      
    자식 컴포넌트에서는 useOutletContext() 훅을 사용하여 
    데이터를 가져올 수 있다
  */}

  //<<ver6에서 할일 -State를 리듀서와 컨텍스트로 관리하기>>
  
  //1) 앱에서 사용하는 상수 정의(config/constants.js)
  //1) State를 변경할 리듀서(함수)를 정의만 한다(reducer/usersReducer.js)
  //2) 사용자 목록 및 인증 데이타를 리듀서와 컨텍스트로 관리하기 위한 Context 객체 
  //   및 Context 객체의 Provider 컴포넌트 생성(provider/UsersProvider.jsx)
  //3) Provider 컴포넌트(UsersProvider)로 데이타를 제공할 자식 컴포넌트들 감싸기(App.jsx)
  //4) useState()로 관리 했던 사용자 목록 및 인증 데이타 제거(App.jsx)
  //5) 자식 컴포넌트들에서 모든 Props 제거후 Context에서 데이타 가져다쓰는 코드로 모두 변경

function App() {
  
  
  return <>
    <UsersProvider>
      <Header/>
      <div className='container'>
        <Outlet/>  
      </div> 
    </UsersProvider>  
  </>

}

export default App
