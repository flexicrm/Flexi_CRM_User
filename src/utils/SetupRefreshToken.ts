import { logout, refreshToken } from "../store/Login_Slice";

let refreshTimeout: any = null;

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
const FIFTY_MIN = 50 * 60 * 1000;
const BUFFER_TIME = 5 * 60 * 1000; // 5 min safety buffer

//  Check 7-day expiry
export const isLoginExpired = () => {
  const loginTimestamp = localStorage.getItem("loginTimestamp");
  if (!loginTimestamp) return true;

  return Date.now() - Number(loginTimestamp) > SEVEN_DAYS;
};

//  Main setup
export const setupTokenRefresh = (dispatch: any) => {
  clearTokenRefresh();

  //  Check 7-day session expiry
  if (isLoginExpired()) {
    console.log(" 7-day session expired → logout");
    dispatch(logout());
    return;
  }

  const tokenExpiry = localStorage.getItem("tokenExpiry");

  if (!tokenExpiry) {
    console.log(" No token expiry found");
    return;
  }

  const now = Date.now();
  const expiryTime = Number(tokenExpiry);

  // ⏱ Calculate time left
  const timeLeft = expiryTime - now;

  let refreshTime = 0;

  //  Case 1: Already expired → refresh immediately
  if (timeLeft <= 0) {
    console.log("⚡ Token expired → refreshing now");
    dispatch(refreshToken());
    return;
  }

  //  Case 2: Schedule refresh BEFORE expiry
  if (timeLeft > FIFTY_MIN) {
    refreshTime = FIFTY_MIN;
  } else {
    // refresh before expiry with buffer
    refreshTime = Math.max(timeLeft - BUFFER_TIME, 5000);
  }

  console.log(` Next refresh in ${Math.round(refreshTime / 1000)} sec`);

  refreshTimeout = setTimeout(async () => {
    try {
      console.log(" Auto refreshing token...");
      await dispatch(refreshToken());
    } catch (err) {
      console.error("❌ Refresh failed:", err);
    }

    //  Setup again after refresh
    setupTokenRefresh(dispatch);

  }, refreshTime);
};

//  Clear timer
export const clearTokenRefresh = () => {
  if (refreshTimeout) {
    clearTimeout(refreshTimeout);
    refreshTimeout = null;
  }
};

//  Resume after reload
export const resumeTokenRefresh = (dispatch: any) => {
  setupTokenRefresh(dispatch);
};