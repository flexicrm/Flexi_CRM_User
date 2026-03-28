import { logout, refreshToken } from "../store/Login_Slice";

let refreshTimeout:any = null;

export const isLoginExpired = () => {
  const loginTimestamp = localStorage.getItem("loginTimestamp");
  if (!loginTimestamp) return true;
  const now = Date.now();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  return now - Number(loginTimestamp) > sevenDays;
};

export const setupTokenRefresh = (dispatch:any) => {
  // Clear existing timeout
  clearTokenRefresh();
  
  // Check if login is expired (7 days)
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
  
  // Refresh every 50 minutes (3000000 milliseconds)
  // This ensures token is refreshed before it expires (assuming 1 hour token validity)
  const refreshInterval = 50 * 60 * 1000; // 50 minutes in milliseconds  
  if (expiresIn <= 0) {
    // Token expired, refresh immediately
    console.log(" Token expired, refreshing immediately");
    dispatch(refreshToken());
  } else {
    // Schedule refresh every 50 minutes
    refreshTimeout = setTimeout(() => {
      console.log(" 50-minute refresh triggered");
      dispatch(refreshToken());
      
      // After refreshing, setup next refresh
      setTimeout(() => {
        setupTokenRefresh(dispatch);
      }, 1000);
    }, refreshInterval);
    
    // Store timeout ID in localStorage for persistence
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

// Function to resume token refresh after page reload
export const resumeTokenRefresh = (dispatch:any) => {
  const savedTimeoutId = localStorage.getItem("refreshTimeoutId");
  if (savedTimeoutId) {
    clearTokenRefresh();
  }
  setupTokenRefresh(dispatch);
};