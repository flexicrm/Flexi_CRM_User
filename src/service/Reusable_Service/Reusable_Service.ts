import type { AxiosError, AxiosRequestConfig } from "axios";
import axios from "axios";

// Extend Axios config to include _retry
interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

// Queue type
type QueueItem = {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
};

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

//  Handle queued requests
const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const Reusable_Service = () => {
  const baseURL = import.meta.env.VITE_BASE_URL;

  const api = axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // ----------------------
  //  REQUEST INTERCEPTOR
  // ----------------------
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("accessToken");
      const deviceId =
        localStorage.getItem("flexicrm-device-id") || "web";

      if (config.headers) {
        //  Correct Authorization header
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        //  Separate device id header
        config.headers["x-device-id"] = deviceId;
      }

      //  Debug (optional)
      // console.log("Request Headers:", config.headers);

      return config;
    },
    (error) => Promise.reject(error)
  );

  // ----------------------
  //  RESPONSE INTERCEPTOR
  // ----------------------
  api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as CustomAxiosRequestConfig;

      //  Handle 401 (token expired)
      if (error.response?.status === 401 && !originalRequest?._retry) {
        if (isRefreshing) {
          return new Promise<string>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                originalRequest.headers["x-device-id"] =
                  localStorage.getItem("flexicrm-device-id") || "web";
              }
              return api(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = localStorage.getItem("refreshToken");

        //  No refresh token → logout
        if (!refreshToken) {
          localStorage.clear();
          window.location.href = "/login";
          return Promise.reject(error);
        }

        try {
          const response = await axios.post(
            `${baseURL}/auth/refresh-token`,
            { refreshToken }
          );

          const {
            accessToken,
            refreshToken: newRefreshToken,
            expiresIn,
          } = response.data as {
            accessToken: string;
            refreshToken: string;
            expiresIn: number;
          };

          //  Save new tokens
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", newRefreshToken);
          localStorage.setItem(
            "tokenExpiry",
            String(Date.now() + expiresIn)
          );

          //  Process queued requests
          processQueue(null, accessToken);

          //  Retry original request with new token + device id
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            originalRequest.headers["x-device-id"] =
              localStorage.getItem("flexicrm-device-id") || "web";
          }

          return api(originalRequest);
        } catch (err) {
          processQueue(err, null);
          localStorage.clear();
          window.location.href = "/login";
          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );

  return api;
};