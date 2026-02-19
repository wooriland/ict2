// src/reducer/usersReducer.js

import { USERS } from "../config/constants";

const usersReducer = (state, action) => {
  console.log("(usersReducer.js)state:", state);
  console.log("(usersReducer.js)action:", action);

  switch (action.type) {
    case USERS.ALL: // 모든 사용자 목록 요청
      return { ...state, users: action.users, isAuthenticated: action.isAuthenticated };

    case USERS.LIKES: // 좋아요 수정 요청
      return {
        ...state,
        users: state.users.map((user) =>
          user.username === action.username ? { ...user, likes: user.likes + 1 } : user
        ),
      };

    case USERS.LOGIN: // 로그인 처리 요청
      // ✅ Login.jsx / Provider에서 isAuthenticated로 보내는 구조 유지
      return { ...state, isAuthenticated: action.isAuthenticated };

    case USERS.LOGOUT: // 로그아웃 처리 요청
      return { ...state, isAuthenticated: null };

    default:
      throw new Error(`존재하지 않는 액션 요청:${action.type}`);
  }
};

export default usersReducer;
