// import { createBrowserRouter } from "react-router-dom";
// import App from "../../App";
// import Login from "../../pages/login/Login";
// import Otp from "../../pages/login/Otp";
// import Register from "../../pages/login/Register";
// import { HomeLayout_route } from "../HomeLayout_route";

// export const Main_Route = createBrowserRouter([
//   {
//     path: "/",
//     Component: App,
//     children: [
//       ...HomeLayout_route,
//     ]
//   },
//   {
//     path: "/login",
//     Component: Login,
//   },
//   {
//     path: "/register",
//     Component: Register,
//   },
//   {
//     path: "/otp",
//     Component: Otp,
//   }
// ]);

import { createBrowserRouter } from "react-router-dom";
import App from "../../App";
import Login from "../../pages/login/Login";
import Otp from "../../pages/login/Otp";
import Register from "../../pages/login/Register";
import { getHomeLayoutRoutes } from "../HomeLayout_route";

// Function to get all routes dynamically
export const getMainRoutes = () => {
  const subdomain = localStorage.getItem("subdomain");
  const homeRoutes = getHomeLayoutRoutes(subdomain);
  
  return createBrowserRouter([
    {
      path: "/",
      Component: App,
      children: homeRoutes,
    },
    {
      path: "/login",
      Component: Login,
    },
    {
      path: "/register",
      Component: Register,
    },
    {
      path: "/otp",
      Component: Otp,
    }
  ]);
};

// Create initial routes
export const Main_Route = getMainRoutes();

// Export a function to refresh routes after login
export const refreshRoutes = () => {
  return getMainRoutes();
};