import { logout, refreshToken } from "../store/Login_Slice";

let refreshTimeout: any = null;

export const isLoginExpired = () => {
  const loginTimestamp = localStorage.getItem("loginTimestamp");
  if (!loginTimestamp) return true;
  const now = Date.now();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  return now - Number(loginTimestamp) > sevenDays;
};

export const setupTokenRefresh = (dispatch: any) => {
  clearTokenRefresh();
  if (isLoginExpired()) {
    console.log("Login expired after 7 days, logging out");
    localStorage.clear();
    dispatch(logout());
    return;
  }

  const tokenExpiry = localStorage.getItem("tokenExpiry");
  if (!tokenExpiry) {
    console.log(" No token expiry found");
    return;
  }

  const currentTime = Date.now();
  const expiresIn = Number(tokenExpiry) - currentTime;
  const refreshInterval = 50 * 60 * 1000;
  if (expiresIn <= 0) {
    console.log(" Token expired, refreshing immediately");
    dispatch(refreshToken());
  } else {
    refreshTimeout = setTimeout(() => {
      console.log(" 50-minute refresh triggered");
      dispatch(refreshToken());
      setTimeout(() => {
        setupTokenRefresh(dispatch);
      }, 1000);
    }, refreshInterval);
    localStorage.setItem("refreshTimeoutId", String(refreshTimeout));
  }
};

export const clearTokenRefresh = () => {
  if (refreshTimeout) {
    clearTimeout(refreshTimeout);
    refreshTimeout = null;
  }
  localStorage.removeItem("refreshTimeoutId");
};

export const resumeTokenRefresh = (dispatch: any) => {
  const savedTimeoutId = localStorage.getItem("refreshTimeoutId");
  if (savedTimeoutId) {
    clearTokenRefresh();
  }
  setupTokenRefresh(dispatch);
};
