//<<1.사용자 관련 Provider 컴포넌트 정의>>
/*
	1.Context객체 생성
    2.하위 컴포넌트에 제공하는 모든 데이타(State,함수등) 정의
    3.Provider정의시 children으로 하위 컴포넌트들을 받는다
      그리고 1에서 생성한 Context객체의 Provider로 감싼다
      value속성에 데이타 지정

    4.커스텀 훅 작성(useUsersContext.js)
    5.하위 컴포넌트에서는 커스텀 훅 함수를 호출해서 데이타를 가져다 쓴다
*/

import React, { useEffect, useReducer } from "react";
import usersReducer from "../reducer/usersReducer";
import axios from "axios";
import { AUTH_KEY, URL, USERS } from "../config/constants";

/*
    ※children키워드은 React에서 기본 제공하는 Props다
      해당 컴포넌트(UsersProvider)의 자식 요소를 Props로 전달하는 역할을 한다
      즉 <컴포넌트>자식 JSX들</컴포넌트>형태로 사용하면 
      이 자식 JSX들이 props.children 으로 전달 된다
*/


//1.Context객체 생성
//커스텀 훅(useUsersContext.js)에서 import하기위해 export시킨다
export const UsersContext = React.createContext(null);

//2. 리듀서를 사용해 관리할 초기 State 정의
const initialState={
    users:[],//사용자 목록 저장
    isAuthenticated:null//로그인한 사용자 아이디 저장
};



//3.Provider정의
export default function UsersProvider({children}){
    //3.사용자 목록 및 인증여부를 State(usersInfo)로 관리하기 위한 리듀서 객체 생성 
    const [usersInfo,dispatch]=useReducer(usersReducer,initialState);

   

    //<<원격에서 모든 사용자 조회>>
    useEffect(()=>{
        axios
            .get(URL.USERS)
            .then(res=>{

                dispatch({
                    type:USERS.ALL,
                    users:res.data,
                    isAuthenticated:sessionStorage.getItem(AUTH_KEY.USERNAME)});
            })
            .catch(e=>console.log(e))

    },[]);

    return <>
        {/* Context영역에 사용자 및 인증 관련 State및 dispatch 저장 */}
        <UsersContext.Provider value={{usersInfo,dispatch}}>
            {children}
        </UsersContext.Provider>
    
    </>
}