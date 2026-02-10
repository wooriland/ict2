// src/util/authLoader.js
import { redirect } from "react-router-dom";
import { AUTH_KEY } from "../config/constants";

export function authLoader() {
  // ✅ localStorage 우선 + sessionStorage 보조(호환)
  const isAuth =
    localStorage.getItem(AUTH_KEY.USERNAME) ||
    sessionStorage.getItem(AUTH_KEY.USERNAME);

  if (!isAuth) {
    window.alert("먼저 로그인 하세요");
    throw redirect("/login");
  }

  return null;
}
