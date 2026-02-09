//<<리듀서(사용자 정의 함수)>>
//현재 State 와 action을 인자로 받는 함수로
//action의 type(요청 종류)에 따라 
//현재 State를 변경해서 새로운 State를 반환하는 함수
//action은 dispatch함수에 의해 전달된다 
//함수의 기능은 State변경이 목적이다

import { USERS } from "../config/constants";

const usersReducer = (state,action)=>{

    console.log('(usersReducer.js)state:',state);//{users:[],isAuthenticated:null}
    console.log('(usersReducer.js)action:',action);//{users:[{],{},...],isAuthenticated:'kim'}
    switch(action.type){
        case USERS.ALL://모든 사용자 목록 요청
            return {...state,users:action.users,isAuthenticated:action.isAuthenticated}
        case USERS.LIKES://좋아요 수정 요청
            return {...state,users:state.users.map(user=>user.username===action.username?{...user,likes:user.likes+1}:user)}
        case USERS.LOGIN://로그인 처리 요청
            return {...state,isAuthenticated:action.isAuthenticated};
        case USERS.LOGOUT://로그아웃 처리 요청
            return {...state,isAuthenticated:null};
        
        default:
            throw new Error(`존재하지 않는 액션 요청:${action.type}`);

    }

};
export default usersReducer;