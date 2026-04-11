import { AnimatePresence, motion } from "framer-motion";
import { Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import favIconForFlexi from "../../assets/logo/favIconForFlexi.png";
import Reusable_Button from "../../component/button/Reusable_Button";
import Reusable_Fields from "../../component/Fields/Reusable_Fiealds";
import GlobalStatus from "../../component/Notification/GlobalStatus";
import { errorAlert, successAlert } from "../../component/Notification/statusHandler";
import { getDeviceId } from "../../component/UUID/getDeviceId";
import { loginAPI } from "../../store/Login_Slice";
import Auth_Slider from "./Auth_Slider";

// Helper function to extract exact error message from API
const extractErrorMessage = (error: any): string => {
  let errorMessage = "Login failed. Please try again.";
  
  if (error?.response?.data) {
    const responseData = error.response.data;
    if (responseData.errors) {
      if (typeof responseData.errors === 'string') errorMessage = responseData.errors;
      else if (typeof responseData.errors === 'object') {
        const firstErrorKey = Object.keys(responseData.errors)[0];
        errorMessage = firstErrorKey && responseData.errors[firstErrorKey] ? responseData.errors[firstErrorKey] : JSON.stringify(responseData.errors);
      }
    }
    else if (responseData.message) errorMessage = responseData.message;
    else if (responseData.error) errorMessage = responseData.error;
  }
  else if (error?.errors) {
    if (typeof error.errors === 'string') errorMessage = error.errors;
    else if (typeof error.errors === 'object') {
      const firstErrorKey = Object.keys(error.errors)[0];
      errorMessage = firstErrorKey && error.errors[firstErrorKey] ? error.errors[firstErrorKey] : JSON.stringify(error.errors);
    }
  }
  else if (error?.message) errorMessage = error.message;
  
  return errorMessage;
};

const Login = () => {
  const navigate = useNavigate();
  const { primaryColor, darkMode } = useSelector((state: any) => state.theme);
  
  const [loginData, setLoginData] = useState({
    mobile: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    // Check for remembered mobile number
    const rememberedMobile = localStorage.getItem("rememberedMobile");
    if (rememberedMobile) {
      setLoginData({ mobile: rememberedMobile });
      setRememberMe(true);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validation
    if (!loginData.mobile) {
      setError("Mobile number is required");
      return;
    }
    if (!/^\d{10}$/.test(loginData.mobile)) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const deviceId = getDeviceId();
      console.log("Device ID:", deviceId);

      // Handle remember me
      if (rememberMe) {
        localStorage.setItem("rememberedMobile", loginData.mobile);
      } else {
        localStorage.removeItem("rememberedMobile");
      }

      const res = await loginAPI(loginData);
      
      if (res?.data?.token) {
        localStorage.setItem("token", res.data.token);
      }
      
      localStorage.setItem("mobile", loginData.mobile);

      // Extract success message from API and trigger Global Reusable Alert
      const successMessage = res?.data?.message || res?.data?.data?.message || "OTP sent successfully";
      
      // Pass message as 1st arg, button text as 2nd arg
      successAlert(successMessage, "Continue");

      // Delay navigation by 2000ms so the user can see the success popup
      setTimeout(() => {
        navigate("/otp", { state: { mobile: loginData.mobile, otpData: res?.data?.data } });
      }, 2000);

    } catch (err: any) {
      // Extract error message exactly like Create_User does
      const errorMessage = extractErrorMessage(err);
      
      // Update inline error & trigger Global Reusable Error Alert
      setError(errorMessage);
      
      // Pass message as 1st arg, button text as 2nd arg
      errorAlert(errorMessage, "Retry");
      
      console.error(err);
      
      // Set loading to false ONLY on error. 
      // If successful, we want the button to stay in the "loading" state during the 2000ms wait.
      setLoading(false);
    }
  };

  return (
    <>
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Left Side - Slider */}
      <div 
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={{ 
          background: darkMode 
            ? "linear-gradient(135deg, #0f172a, #1e293b)" 
            : `linear-gradient(135deg, ${primaryColor || '#05264e'}, ${primaryColor ? `${primaryColor}cc` : '#0a3a6e'})`
        }}
      >
        <Auth_Slider />
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo Section */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="text-center mb-8"
          >
            <div className="relative inline-block">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <img
                  src={favIconForFlexi}
                  alt="FlexiCRM"
                  className="w-20 h-20 mx-auto rounded-full"
                />
              </motion.div>
            </div>
            <motion.h1
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-gray-900 dark:text-white mt-4"
            >
              Welcome Back
            </motion.h1>
            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-500 dark:text-gray-400 text-sm mt-1"
            >
              Sign in to continue to FlexiCRM
            </motion.p>
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <Reusable_Fields
              type="phone"
              label="Mobile Number"
              name="mobile"
              value={loginData.mobile}
              onChange={handleChange}
              placeholder="Enter your mobile number"
              required={true}
              icon={<Phone className="w-5 h-5" />}
              error={error}
            />

            {/* Remember Me Checkbox */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.55 }}
              className="flex items-center justify-between"
            >
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-600"
                  style={{ 
                    accentColor: primaryColor || '#3B82F6'
                  }}
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Remember me
                </span>
              </label>
            
            </motion.div>

            {/* Submit Button - Using Reusable Button */}
            <Reusable_Button
              type="submit"
              text={loading ? "Logging in..." : "Login →"}
              variant="primary"
              size="lg"
              fullWidth={true}
              isLoading={loading}
              disabled={loading}
              icon={<Phone className="w-4 h-4" />}
              iconPosition="left"
            />

            {/* Inline Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-3 rounded-lg"
                  style={{ 
                    backgroundColor: darkMode ? '#450a0a' : '#fef2f2',
                    borderColor: darkMode ? '#7f1d1d' : '#fecaca',
                    borderWidth: '1px'
                  }}
                >
                  <p className="text-red-600 dark:text-red-400 text-sm text-center">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.form>

          {/* Sign Up Link */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6"
          >
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/register")}
              className="font-semibold cursor-pointer transition-colors hover:opacity-80"
              style={{ color: primaryColor || '#6366f1' }}
            >
              Create Account
            </button>
          </motion.p>
        </motion.div>
      </div>
    </div>
      <GlobalStatus />
    </>
  );
};

export default Login;