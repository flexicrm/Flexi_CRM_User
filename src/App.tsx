import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet } from "react-router-dom";
import Navbar from "./component/common/Navbar";
import Sidebar from "./component/common/Sidebar";
import { resumeTokenRefresh } from "./utils/SetupRefreshToken";

const App = () => {
  const dispatch = useDispatch();
  const { token } = useSelector((state: any) => state.auth);

  useEffect(() => {
    if (token) {
      resumeTokenRefresh(dispatch);
    }
  }, [dispatch, token]);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 bg-blue-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default App;
