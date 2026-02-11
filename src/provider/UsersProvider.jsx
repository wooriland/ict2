// src/provider/UsersProvider.jsx
import React, { useEffect, useReducer } from "react";
import axios from "axios";
import { toast } from "react-toastify";

import usersReducer from "../reducer/usersReducer";
import {
  AUTH_KEY,
  USERS,
  STORAGE_KEY,
  URL,
  FLASH_KEY,
  FLASH,
} from "../config/constants";

export const UsersContext = React.createContext(null);

const initialState = {
  users: [],
  isAuthenticated: false, // ✅ boolean으로 통일
  profile: null, // ✅ { username, email, name, provider ... } (/api/users/me 결과)
};

export default function UsersProvider({ children }) {
  const [usersInfo, dispatch] = useReducer(usersReducer, initialState);

  useEffect(() => {
    /**
     * ✅ 1) 기존 "아이디 로그인" 호환
     */
    const localUser = localStorage.getItem(AUTH_KEY.USERNAME);
    const sessionUser = sessionStorage.getItem(AUTH_KEY.USERNAME);
    const username = localUser || sessionUser || null;

    // ✅ 세션에만 있던 값도 로컬로 동기화(선택)
    if (!localUser && sessionUser) {
      localStorage.setItem(AUTH_KEY.USERNAME, sessionUser);
    }

    /**
     * ✅ 2) 토큰 기반 로그인 복구(핵심)
     * - local/session 둘 다 확인
     */
    const token =
      localStorage.getItem(STORAGE_KEY.ACCESS_TOKEN) ||
      sessionStorage.getItem(STORAGE_KEY.ACCESS_TOKEN);

    // ✅ 토큰이 없으면: 기존 방식(username)으로만 인증 상태 설정
    if (!token) {
      dispatch({
        type: USERS.ALL,
        users: [],
        isAuthenticated: !!username,
        profile: username ? { username } : null,
      });
      return;
    }

    // ✅ 토큰이 있으면: /me 호출해서 profile 복구
    (async () => {
      try {
        // ✅ URL.ME가 constants에 반드시 있어야 함!
        // (없으면 constants.js에 URL.ME = `${API_BASE}/api/users/me` 추가)
        const res = await axios.get(URL.ME, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const profile = res.data; // { username, email, name, provider ... }

        // ✅ (호환) username 내려오면 AUTH_KEY.USERNAME에도 저장
        if (profile?.username) {
          localStorage.setItem(AUTH_KEY.USERNAME, profile.username);
        }

        dispatch({
          type: USERS.ALL,
          users: [],
          isAuthenticated: true,
          profile,
        });

        /**
         * ✅ 3) "한 번만 보여줄 토스트" 처리
         * - profile(email)을 확보한 뒤 정확한 메시지로 1회만 출력
         */
        const flash = sessionStorage.getItem(FLASH_KEY.TOAST);

        if (flash === FLASH.GOOGLE_LOGIN_OK) {
          const email = profile?.email || profile?.name || profile?.username || "알 수 없는 계정";
          toast.success(`${email}로 로그인되었습니다.`, { toastId: "google-login-ok" });
          sessionStorage.removeItem(FLASH_KEY.TOAST);
        } else if (flash === FLASH.LINK_OK) {
          toast.success("계정 연결이 완료되었습니다 ✅", { toastId: "link-ok" });
          sessionStorage.removeItem(FLASH_KEY.TOAST);
        } else if (flash === FLASH.OAUTH2_FALLBACK) {
          toast.warn("로그인 상태를 확인할 수 없어 로그인 화면으로 이동해주세요.", {
            toastId: "oauth2-fallback",
          });
          sessionStorage.removeItem(FLASH_KEY.TOAST);
        }
      } catch (e) {
        const status = e?.response?.status;
        const msg = e?.response?.data?.message;

        console.log("[UsersProvider] /api/users/me 실패", status, msg || e);

        // ✅ 401/403이면 토큰이 유효하지 않음 → 로그아웃 처리(정상)
        if (status === 401 || status === 403) {
          localStorage.removeItem(STORAGE_KEY.ACCESS_TOKEN);
          sessionStorage.removeItem(STORAGE_KEY.ACCESS_TOKEN);
          localStorage.removeItem(STORAGE_KEY.SOCIAL_TEMP_TOKEN);
          sessionStorage.removeItem(STORAGE_KEY.SOCIAL_TEMP_TOKEN);

          toast.warn("로그인이 만료되었습니다. 다시 로그인해주세요.", {
            toastId: "auth-expired",
          });

          dispatch({
            type: USERS.ALL,
            users: [],
            isAuthenticated: false,
            profile: null,
          });

          return;
        }

        // ✅ 500 등 서버 에러는: 토큰을 무조건 지우지 말고(원인 추적),
        //    사용자에게만 안내 + 일단 비로그인으로 처리
        toast.error(
          msg || "서버 오류로 로그인 정보를 불러오지 못했습니다. (백엔드 /me 확인 필요)",
          { toastId: "me-500" }
        );

        dispatch({
          type: USERS.ALL,
          users: [],
          isAuthenticated: false,
          profile: null,
        });
      }
    })();
  }, []);

  return (
    <UsersContext.Provider value={{ usersInfo, dispatch }}>
      {children}
    </UsersContext.Provider>
  );
}
