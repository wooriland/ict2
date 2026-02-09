// src/provider/UsersProvider.jsx

import React, { useEffect, useReducer } from "react";
import usersReducer from "../reducer/usersReducer";
import { AUTH_KEY, USERS } from "../config/constants";

/*
  ✅ 중간프로젝트(Spring 전환) 버전 UsersProvider
  - 기존 json-server(3002) USERS 전체조회 제거
  - 지금 단계에서는 "세션 로그인 상태"만 유지해도 충분
  - 나중에 필요하면 Spring에 /api/users 만들고 여기서 조회하도록 확장
*/

export const UsersContext = React.createContext(null);

const initialState = {
  users: [],
  isAuthenticated: null, // 로그인한 사용자 아이디
};

export default function UsersProvider({ children }) {
  const [usersInfo, dispatch] = useReducer(usersReducer, initialState);

  // ✅ 앱 시작 시: 세션에 저장된 로그인 아이디만 읽어서 상태 세팅
  // (json-server 호출 제거 → 3002 에러 완전 차단)
  useEffect(() => {
    dispatch({
      type: USERS.ALL,
      users: [],
      isAuthenticated: sessionStorage.getItem(AUTH_KEY.USERNAME),
    });
  }, []);

  return (
    <UsersContext.Provider value={{ usersInfo, dispatch }}>
      {children}
    </UsersContext.Provider>
  );
}
