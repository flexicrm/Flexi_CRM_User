import { AnimatePresence, motion } from "framer-motion";
import { Mail, Phone } from "lucide-react";
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

// Helper function to validate email
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Helper function to validate mobile number
const isValidMobile = (mobile: string): boolean => {
  return /^\d{10}$/.test(mobile);
};

// Helper function to detect input type
const detectInputType = (value: string): "mobile" | "email" | null => {
  if (!value) return null;
  if (value.includes('@')) return "email";
  if (/^\d+$/.test(value) && value.length >= 10) return "mobile";
  return null;
};

const Login = () => {
  const navigate = useNavigate();
  const { primaryColor, darkMode } = useSelector((state: any) => state.theme);
  
  const [loginData, setLoginData] = useState({
    identifier: "",
  });

  const [loginType, setLoginType] = useState<"mobile" | "email" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    // Check for remembered identifier
    const rememberedIdentifier = localStorage.getItem("rememberedIdentifier");
    if (rememberedIdentifier) {
      setLoginData({ identifier: rememberedIdentifier });
      // Detect if remembered identifier is email or mobile
      if (rememberedIdentifier.includes('@')) {
        setLoginType("email");
      } else if (/^\d{10}$/.test(rememberedIdentifier)) {
        setLoginType("mobile");
      }
      setRememberMe(true);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setLoginData({
      ...loginData,
      [e.target.name]: value,
    });
    if (error) setError("");
    
    // Auto-detect login type based on input
    const detectedType = detectInputType(value);
    setLoginType(detectedType);
  };

  const validateInput = (): boolean => {
    if (!loginData.identifier.trim()) {
      setError("Mobile number or email is required");
      return false;
    }
    
    // Try to detect type if not set
    const detectedType = detectInputType(loginData.identifier);
    
    if (!detectedType) {
      setError("Please enter a valid mobile number (10 digits) or email address");
      return false;
    }
    
    if (detectedType === "mobile") {
      if (!isValidMobile(loginData.identifier)) {
        setError("Please enter a valid 10-digit mobile number");
        return false;
      }
    } else {
      if (!isValidEmail(loginData.identifier)) {
        setError("Please enter a valid email address");
        return false;
      }
    }
    
    setLoginType(detectedType);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateInput()) return;

    try {
      setLoading(true);
      setError("");
      const deviceId = getDeviceId();
      console.log("Device ID:", deviceId);
      console.log("Login type:", loginType);
      console.log("Identifier:", loginData.identifier);

      // Handle remember me
      if (rememberMe) {
        localStorage.setItem("rememberedIdentifier", loginData.identifier);
      } else {
        localStorage.removeItem("rememberedIdentifier");
      }

      // Prepare payload based on detected login type
      const payload = loginType === "mobile" 
        ? { mobile: loginData.identifier }
        : { email: loginData.identifier };

      const res = await loginAPI(payload);
      
      if (res?.data?.token) {
        localStorage.setItem("token", res.data.token);
      }
      
      // Store the identifier and type for OTP page
      localStorage.setItem("identifier", loginData.identifier);
      localStorage.setItem("loginType", loginType || "mobile");

      // Extract success message from API
      const successMessage = res?.data?.message || res?.data?.data?.message || "OTP sent successfully";
      
      successAlert(successMessage, "Continue");

      // Delay navigation to show success popup
      setTimeout(() => {
        navigate("/otp", { 
          state: { 
            identifier: loginData.identifier, 
            loginType: loginType,
            otpData: res?.data?.data 
          } 
        });
      }, 2000);

    } catch (err: any) {
      const errorMessage = extractErrorMessage(err);
      setError(errorMessage);
      errorAlert(errorMessage, "Retry");
      console.error(err);
      setLoading(false);
    }
  };

  // Dynamic icon based on input
  const getInputIcon = () => {
    if (loginType === "mobile") {
      return <Phone className="w-5 h-5" />;
    }
    if (loginType === "email") {
      return <Mail className="w-5 h-5" />;
    }
    return <Phone className="w-5 h-5" />;
  };

  // Dynamic placeholder
  const getInputPlaceholder = () => {
    return "Enter mobile number or email address";
  };

  return (
    <>
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 ">
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
                  className="w-20 h-20 mx-auto"
                />
              </motion.div>
            </div>
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
              type="text"
              label="Mobile Number or Email"
              name="identifier"
              value={loginData.identifier}
              onChange={handleChange}
              placeholder={getInputPlaceholder()}
              required={true}
              icon={getInputIcon()}
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

            {/* Submit Button */}
            <Reusable_Button
              type="submit"
              text={loading ? "Sending OTP..." : "Continue →"}
              variant="primary"
              size="lg"
              fullWidth={true}
              isLoading={loading}
              disabled={loading}
              icon={loginType === "mobile" ? <Phone className="w-4 h-4" /> : loginType === "email" ? <Mail className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
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
            className={`text-center text-sm mt-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
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