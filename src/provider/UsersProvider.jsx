// src/provider/UsersProvider.jsx

import React, { useEffect, useReducer } from "react";
import usersReducer from "../reducer/usersReducer";
import { AUTH_KEY, USERS } from "../config/constants";

export const UsersContext = React.createContext(null);

const initialState = {
  users: [],
  isAuthenticated: null,
};

export default function UsersProvider({ children }) {
  const [usersInfo, dispatch] = useReducer(usersReducer, initialState);

  useEffect(() => {
    const localUser = localStorage.getItem(AUTH_KEY.USERNAME);
    const sessionUser = sessionStorage.getItem(AUTH_KEY.USERNAME);

    const username = localUser || sessionUser || null;

    // ✅ 세션에만 있던 값도 로컬로 동기화(선택이지만 권장)
    if (!localUser && sessionUser) {
      localStorage.setItem(AUTH_KEY.USERNAME, sessionUser);
    }

    dispatch({
      type: USERS.ALL,
      users: [],
      isAuthenticated: username,
    });
  }, []);

  return (
    <UsersContext.Provider value={{ usersInfo, dispatch }}>
      {children}
    </UsersContext.Provider>
  );
}
