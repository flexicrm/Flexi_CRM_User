// import { useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { Outlet } from "react-router-dom";
// import Navbar from "./component/common/Navbar";
// import Sidebar from "./component/common/Sidebar";
// import GlobalStatus from "./component/Notification/GlobalStatus";
// import { resumeTokenRefresh } from "./utils/SetupRefreshToken";

// const App = () => {
//   const dispatch = useDispatch();
//   const { token } = useSelector((state: any) => state.auth);

//   useEffect(() => {
//     if (token) {
//       resumeTokenRefresh(dispatch);
//     }
//   }, [dispatch, token]);

//   return (
//     <div className="flex flex-col h-screen bg-gray-50">
//       <Navbar />
//       <div className="flex flex-1 overflow-hidden">
//         <Sidebar />
//         <main className="flex-1 overflow-y-auto p-6 bg-blue-100 font_primary">
//           <Outlet />
//         </main>
//       </div>
//       {/* GlobalStatus should be here - outside of main content but inside the div */}
//       <GlobalStatus />
//     </div>
//   );
// };

// export default App;

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import Navbar from "./component/common/Navbar";
import Sidebar from "./component/common/Sidebar";
import GlobalStatus from "./component/Notification/GlobalStatus";
import { resumeTokenRefresh } from "./utils/SetupRefreshToken";

const App = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useSelector((state: any) => state.auth);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    if (token) {
      resumeTokenRefresh(dispatch);
    }
  }, [dispatch, token]);

  useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      const accessToken = localStorage.getItem("accessToken");
      const subdomain = localStorage.getItem("subdomain");
      
      if (!accessToken || !subdomain) {
        // Not authenticated, redirect to login
        if (!location.pathname.includes("/login") && 
            !location.pathname.includes("/register") && 
            !location.pathname.includes("/otp")) {
          navigate("/login");
        }
      } else {
        // Check if current path matches subdomain
        const currentPath = location.pathname;
        if (!currentPath.includes(subdomain) && currentPath !== "/") {
          // Redirect to correct subdomain path
          navigate(`/${subdomain}/dashboard`);
        }
      }
      setIsCheckingAuth(false);
    };

    checkAuth();
  }, [navigate, location.pathname]);

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated for protected routes
  const isAuthenticatedUser = !!localStorage.getItem("accessToken") && !!localStorage.getItem("subdomain");
  
  if (!isAuthenticatedUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 bg-blue-100 font_primary">
          <Outlet />
        </main>
      </div>
      <GlobalStatus />
    </div>
  );
};

export default App;