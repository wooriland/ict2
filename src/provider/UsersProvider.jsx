// ✅ 파일: src/provider/UsersProvider.jsx
import React, { useEffect, useReducer } from "react";
import axios from "axios";
import { toast } from "react-toastify";

import usersReducer from "../reducer/usersReducer";
import { AUTH_KEY, USERS, STORAGE_KEY, URL, FLASH_KEY, FLASH } from "../config/constants";

export const UsersContext = React.createContext(null);

const initialState = {
  users: [],
  isAuthenticated: false, // ✅ boolean
  profile: null,          // ✅ { username, email, name, provider ... } (/api/users/me)
};

export default function UsersProvider({ children }) {
  const [usersInfo, dispatch] = useReducer(usersReducer, initialState);

  useEffect(() => {
    // =========================================================
    // ✅ 0) (가장 먼저) OAuth2Redirect가 심어둔 "1회성 환영값"을 읽어둔다
    // - 핵심 포인트:
    //   - 지금은 useEffect가 1회만 실행([])이지만,
    //     "호출 직후 저장된 값"을 안정적으로 소비하려면
    //     여기서 '미리 읽어두기' + '/me 성공 후 소비'가 가장 안전
    // =========================================================
    const oauthWelcomeNameRaw = sessionStorage.getItem("oauthWelcomeName");
    const oauthProviderRaw = sessionStorage.getItem("oauthProvider");

    const oauthWelcomeName =
      oauthWelcomeNameRaw && oauthWelcomeNameRaw.trim() ? oauthWelcomeNameRaw.trim() : null;
    const oauthProvider =
      oauthProviderRaw && oauthProviderRaw.trim() ? oauthProviderRaw.trim() : null;

    // =========================================================
    // ✅ 1) 기존 "아이디 로그인" 호환 (username 흔적)
    // - 표시/토스트는 username 기반으로 하지 말 것
    // =========================================================
    const localUser = localStorage.getItem(AUTH_KEY.USERNAME);
    const sessionUser = sessionStorage.getItem(AUTH_KEY.USERNAME);
    const username = localUser || sessionUser || null;

    // (선택) 세션에만 있던 username을 로컬로 동기화
    if (!localUser && sessionUser) {
      localStorage.setItem(AUTH_KEY.USERNAME, sessionUser);
    }

    // =========================================================
    // ✅ 2) 토큰 기반 로그인 복구(핵심)
    // =========================================================
    const token =
      localStorage.getItem(STORAGE_KEY.ACCESS_TOKEN) ||
      sessionStorage.getItem(STORAGE_KEY.ACCESS_TOKEN);

    // ✅ 토큰이 없으면: 기존 방식(username)으로만 인증 상태 설정
    // - 소셜 성공이면 토큰이 있어야 정상.
    // - 따라서 여기서는 oauthWelcomeName 토스트를 띄우지 않는다.
    if (!token) {
      dispatch({
        type: USERS.ALL,
        users: [],
        isAuthenticated: !!username,
        profile: username ? { username } : null,
      });
      return;
    }

    // =========================================================
    // ✅ 토큰이 있으면: /me 호출해서 profile 복구
    // =========================================================
    (async () => {
      try {
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

        // =========================================================
        // ✅ 3) 환영 토스트(딱 1번만)
        //
        // 우선순위:
        // 1) OAuth2Redirect가 심어둔 oauthWelcomeName (카카오 닉네임 등)
        // 2) FLASH 기반 기존 로직 (구글 로그인, 링크 완료 등)
        // =========================================================

        // (A) ✅ OAuth redirect 1회성 환영 값 (가장 우선)
        if (oauthWelcomeName) {
          // ✅ 1회 소비(중복 방지)
          sessionStorage.removeItem("oauthWelcomeName");
          sessionStorage.removeItem("oauthProvider");

          // ✅ 토스트 문구(원하면 provider로 약간의 문구 분기 가능)
          // - 지금은 "이름으로 로그인" 고정
          toast.success(`${oauthWelcomeName}로 로그인되었습니다.`, {
            toastId: "oauth-welcome",
          });

          // ✅ 여기서 끝내면 FLASH 토스트가 중복으로 안 뜸
          return;
        }

        // (B) ✅ 기존 FLASH 기반
        const flash = sessionStorage.getItem(FLASH_KEY.TOAST);

        if (flash === FLASH.GOOGLE_LOGIN_OK) {
          const email =
            profile?.email ||
            profile?.name ||
            profile?.username ||
            "알 수 없는 계정";

          toast.success(`${email}로 로그인되었습니다.`, {
            toastId: "google-login-ok",
          });

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

        // ✅ (선택) oauthProvider만 남아있을 수 있으니 정리
        // - oauthWelcomeName이 없어서 토스트 안 뜬 케이스라도,
        //   provider 값이 남아 UX에 혼선을 줄 수 있음
        if (oauthProvider) {
          sessionStorage.removeItem("oauthProvider");
        }
      } catch (e) {
        const status = e?.response?.status;
        const msg = e?.response?.data?.message;

        console.log("[UsersProvider] /api/users/me 실패", status, msg || e);

        // ✅ 401/403이면 토큰이 유효하지 않음 → 로그아웃 처리
        if (status === 401 || status === 403) {
          localStorage.removeItem(STORAGE_KEY.ACCESS_TOKEN);
          sessionStorage.removeItem(STORAGE_KEY.ACCESS_TOKEN);
          localStorage.removeItem(STORAGE_KEY.SOCIAL_TEMP_TOKEN);
          sessionStorage.removeItem(STORAGE_KEY.SOCIAL_TEMP_TOKEN);

          // ✅ OAuth 1회성 값도 정리
          sessionStorage.removeItem("oauthProvider");
          sessionStorage.removeItem("oauthWelcomeName");

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

        // ✅ 서버 에러(500 등)
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
