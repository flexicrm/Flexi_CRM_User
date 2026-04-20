import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import Navbar from "./component/common/Navbar";
import Sidebar from "./component/common/Sidebar";
import GlobalStatus from "./component/Notification/GlobalStatus";
import { fetchMeData } from "./store/Login_Slice";
import { resumeTokenRefresh } from "./utils/SetupRefreshToken";

const App = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { token, meLoading, isAuthenticated } = useSelector((state: any) => state.auth);

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  /* ================= TOKEN REFRESH ================= */
  useEffect(() => {
    if (token) {
      resumeTokenRefresh(dispatch);
    }
  }, [dispatch, token]);

  /* ================= 🔥 FETCH USER + PERMISSIONS ================= */
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");

    if (accessToken) {
      dispatch(fetchMeData() as any); // ✅ THIS FIXES YOUR ISSUE
    }
  }, [dispatch]);

  /* ================= ROUTE CHECK ================= */
  useEffect(() => {
    const checkAuth = () => {
      const accessToken = localStorage.getItem("accessToken");
      const subdomain = localStorage.getItem("subdomain");

      if (!accessToken || !subdomain) {
        if (
          !location.pathname.includes("/login") &&
          !location.pathname.includes("/register") &&
          !location.pathname.includes("/otp")
        ) {
          navigate("/login");
        }
      } else {
        const currentPath = location.pathname;
        if (!currentPath.includes(subdomain) && currentPath !== "/") {
          navigate(`/${subdomain}/dashboard`);
        }
      }

      setIsCheckingAuth(false);
    };

    checkAuth();
  }, [navigate, location.pathname]);

  /* ================= LOADING STATE ================= */
  if (isCheckingAuth || meLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  /* ================= AUTH CHECK ================= */
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  /* ================= MAIN LAYOUT ================= */
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Navbar isSidebarExpanded={isSidebarExpanded} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar onHoverChange={setIsSidebarExpanded} />
        <main className="flex-1 overflow-y-auto bg-blue-100 font_primary">
          <Outlet />
        </main>
      </div>
      <GlobalStatus />
    </div>
  );
};

export default App;