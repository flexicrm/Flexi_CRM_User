import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { Main_Route } from "../src/routes/main_route/Main_Route";
import "./index.css";
import { store } from "./store/Store";
import { resumeTokenRefresh } from "./utils/SetupRefreshToken";

// Check for existing session and setup token refresh on app start
const token = localStorage.getItem("accessToken");
if (token) {
  resumeTokenRefresh(store.dispatch);
  console.log("Token refresh resumed for existing session");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={Main_Route} />
    </Provider>
  </StrictMode>
);