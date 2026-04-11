import { unwrapResult } from "@reduxjs/toolkit";
import { motion } from "framer-motion";
import { type ChangeEvent, type ClipboardEvent, type KeyboardEvent, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import Reusable_Button from "../../component/button/Reusable_Button";
import GlobalStatus from "../../component/Notification/GlobalStatus";
import { confirmAlert, errorAlert, successAlert } from "../../component/Notification/statusHandler";
import { clearError, OtpUser, setAuthData } from "../../store/Login_Slice";
import type { AppDispatch } from "../../store/Store";
import Auth_Slider from "./Auth_Slider";

// Types
interface LocationState {
  mobile: number;
  otp: number;
  deviceId: string;
  deviceType: string;
  forceLogin: boolean;
  otpData?: OtpData;
  deviceIdData?: DeviceIdData;
}

interface OtpData {
  companyLogo?: string;
  companyName?: string;
}

interface DeviceIdData {
  deviceId?: string;
  deviceType?: string;
  forceLogin?: boolean;
}

interface AuthState {
  auth: {
    isLoading: boolean;
    error: string | null;
  };
}

const Otp: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch<AppDispatch>();
    const { isLoading, error } = useSelector((state: AuthState) => state.auth);
    const { primaryColor, darkMode } = useSelector((state: any) => state.theme);
    
    const [mobile, setMobile] = useState<string>("");
    const [otpData, setOtpData] = useState<OtpData | null>(null);
    const [, setDeviceIdData] = useState<DeviceIdData | null>(null);
    const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
    const [timer, setTimer] = useState<number>(27);
    const [localError, setLocalError] = useState<string>("");
    const [isNavigating, setIsNavigating] = useState<boolean>(false);
    
    const [deviceInfo, setDeviceInfo] = useState({
        deviceId: "",
        deviceType: "web",
        forceLogin: false
    });

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [, setIsAnimating] = useState<boolean>(false);

    // Save company data on load
    useEffect(() => {
        if (otpData) {
            localStorage.setItem("companyLogo", otpData.companyLogo || "");
            localStorage.setItem("companyName", otpData.companyName || "");
        }
    }, [otpData]);

    const getDeviceId = (): string => {
        const appName = "flexicrm";
        const storageKey = `${appName}-device-id`;
        
        let deviceId = localStorage.getItem(storageKey);
        
        if (!deviceId) {
            deviceId = `${appName}_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
            localStorage.setItem(storageKey, deviceId);
        }
        
        return deviceId;
    };

    const getDeviceType = (): string => {
        const userAgent = navigator.userAgent.toLowerCase();
        if (userAgent.includes('mobile')) return 'mobile';
        if (userAgent.includes('tablet')) return 'tablet';
        return 'web';
    };

    useEffect(() => {
        setIsAnimating(true);
        const timer = setTimeout(() => setIsAnimating(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const state = location.state as LocationState;
        const { mobile: mobileFromState, otpData: otpDataFromState, deviceIdData: deviceIdFromState } = state || {};
        const mobileFromStorage = localStorage.getItem("mobile");
        const finalMobile = mobileFromState || mobileFromStorage;

        if (otpDataFromState) {
            setOtpData(otpDataFromState);
        }
        
        if (deviceIdFromState) {
            setDeviceIdData(deviceIdFromState);
            setDeviceInfo({
                deviceId: deviceIdFromState.deviceId || getDeviceId(),
                deviceType: deviceIdFromState.deviceType || getDeviceType(),
                forceLogin: deviceIdFromState.forceLogin || false
            });
        } else {
            const deviceId = getDeviceId();
            const deviceType = getDeviceType();
            const forceLogin = false;
            
            setDeviceInfo({ deviceId, deviceType, forceLogin });
            localStorage.setItem("deviceType", deviceType);
            localStorage.setItem("forceLogin", String(forceLogin));
        }
        
        if (finalMobile) {
            setMobile(String(finalMobile));
        } else {
            setLocalError("Mobile number not found. Please login again.");
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        }
    }, [location.state, navigate]);

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    // Auto-submit logic
    useEffect(() => {
        const otpValue = otp.join("");
        if (otpValue.length === 6 && !isLoading && !isNavigating) {
            handleVerify();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [otp]); 

    const handleChange = (element: HTMLInputElement, index: number) => {
        const value = element.value;
        if (isNaN(Number(value))) return;

        setLocalError("");

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: ClipboardEvent<HTMLDivElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text");
        
        if (/^\d{6}$/.test(pastedData)) {
            const otpArray = pastedData.split("");
            setLocalError("");
            setOtp(otpArray);
            inputRefs.current[5]?.focus();
        } else {
            errorAlert("Please paste a valid 6-digit OTP");
        }
    };

    // Function to refresh Redux store with latest data
    const refreshReduxStore = async (subdomain: string, userData: any, accessToken: string) => {
        try {
            // Dispatch action to update Redux store with auth data
            await dispatch(setAuthData({
                isAuthenticated: true,
                user: userData,
                subdomain: subdomain,
                accessToken: accessToken
            }));
            console.log("✅ Redux store refreshed with auth data");
            return true;
        } catch (error) {
            console.error("Failed to refresh Redux store:", error);
            return false;
        }
    };

    // Function to ensure localStorage is properly set
    const ensureLocalStorageData = (subdomain: string, userData: any, accessToken: string, refreshToken: string) => {
        // Double-check and set subdomain
        if (subdomain) {
            localStorage.setItem("subdomain", subdomain);
            console.log("✅ Subdomain saved to localStorage:", subdomain);
        }
        
        // Verify subdomain was saved
        const savedSubdomain = localStorage.getItem("subdomain");
        if (!savedSubdomain && subdomain) {
            // Retry saving if failed
            localStorage.setItem("subdomain", subdomain);
            console.log("🔄 Retry saving subdomain:", subdomain);
        }
        
        // Ensure tokens are saved
        if (accessToken) {
            localStorage.setItem("accessToken", accessToken);
        }
        if (refreshToken) {
            localStorage.setItem("refreshToken", refreshToken);
        }
        
        // Ensure user data is saved
        if (userData) {
            localStorage.setItem("userData", JSON.stringify(userData));
        }
        
        console.log("✅ localStorage verified - subdomain:", localStorage.getItem("subdomain"));
    };

    // Function to wait for localStorage to be ready
    const waitForLocalStorage = (key: string, expectedValue?: string, maxAttempts = 10): Promise<string | null> => {
        return new Promise((resolve) => {
            let attempts = 0;
            const checkInterval = setInterval(() => {
                const value = localStorage.getItem(key);
                attempts++;
                
                if (value && (!expectedValue || value === expectedValue)) {
                    clearInterval(checkInterval);
                    resolve(value);
                } else if (attempts >= maxAttempts) {
                    clearInterval(checkInterval);
                    resolve(value);
                }
            }, 100);
        });
    };

    const callOtpApi = async (forceLoginValue: boolean) => {
        const otpValue = otp.join("");
        
        const payload = {
            mobile: mobile,
            otp: otpValue,
            deviceId: deviceInfo.deviceId,
            deviceType: deviceInfo.deviceType,
            forceLogin: forceLoginValue
        };

        console.log(`Sending OTP payload (forceLogin: ${forceLoginValue}):`, payload);

        try {
            const actionResult = await dispatch(OtpUser(payload));
            const responseData = unwrapResult(actionResult); 

            console.log("API Success Response:", responseData);
            
            if (responseData?.requiresConfirmation && responseData?.data?.alreadyLoggedIn) {
                dispatch(clearError());
                setLocalError("");
                
                setTimeout(() => {
                    confirmAlert({
                        title: "Already Logged In",
                        message: responseData?.errors || "This account is already logged in. Do you want to continue?",
                        confirmText: "Yes, Force Login",
                        cancelText: "Cancel",
                        onConfirm: () => {
                            console.log("Retrying with forceLogin: true");
                            callOtpApi(true);
                        }
                    });
                }, 100);
                return;
            }
            
            const accessToken = responseData?.accessToken || responseData?.data?.accessToken;
            const refreshToken = responseData?.refreshToken || responseData?.data?.refreshToken;
            
            if (accessToken && refreshToken) {
                const expiresIn = responseData?.expiresIn || responseData?.data?.expiresIn;
                let subdomain = responseData?.subdomain || responseData?.data?.subdomain;
                let userData = responseData?.user || responseData?.data?.user;
                
                // Save data to localStorage
                ensureLocalStorageData(subdomain, userData, accessToken, refreshToken);
                
                if (expiresIn) localStorage.setItem("tokenExpiry", String(Date.now() + Number(expiresIn)));
                if (responseData?.isFirstlogin !== undefined) localStorage.setItem("isFirstLogin", String(responseData.isFirstlogin));
                
                localStorage.removeItem("mobile");
                
                // Wait for subdomain to be properly saved
                await waitForLocalStorage("subdomain", subdomain);
                
                // Refresh Redux store with latest data
                await refreshReduxStore(subdomain, userData, accessToken);
                
                const successMsg = responseData?.message || "Login successful!";
                successAlert(successMsg, "Continue");
                setLocalError("");
                
                // Get the final subdomain value
                const finalSubdomain = subdomain || localStorage.getItem("subdomain");
                console.log(" Final subdomain for navigation:", finalSubdomain);
                
                if (!finalSubdomain) {
                    console.error(" No subdomain found after login!");
                    errorAlert("Login failed: Missing company subdomain", "Retry");
                    setIsNavigating(false);
                    return;
                }
                
                setIsNavigating(true);
                setIsNavigating(true);
setTimeout(() => {
    console.log(` Redirecting to /${finalSubdomain}/dashboard with auto-refresh`);
    window.location.replace(`/${finalSubdomain}/dashboard`);
    
}, 2000);
                
            } else {
                const errorMsg = responseData?.errors || responseData?.message || "OTP verification failed.";
                errorAlert(errorMsg, "Try Again");
                setLocalError(errorMsg);
                setOtp(new Array(6).fill(""));
                inputRefs.current[0]?.focus();
                setIsNavigating(false);
            }
            
        } catch (errorData: any) {
            console.log("API Error Response:", errorData);
            setIsNavigating(false);

            if (errorData?.data?.alreadyLoggedIn) {
                dispatch(clearError());
                setLocalError("");
                
                setTimeout(() => {
                    confirmAlert({
                        title: "Already Logged In",
                        message: errorData?.errors || "This account is already logged in. Do you want to logout the previous session?",
                        confirmText: "Yes, Force Login",
                        cancelText: "Cancel",
                        onConfirm: () => {
                            console.log("Retrying with forceLogin: true");
                            callOtpApi(true);
                        }
                    });
                }, 100);
                return;
            }

            const errorMsg = errorData?.errors || errorData?.message || "OTP verification failed. Please try again.";
            errorAlert(errorMsg, "Try Again");
            setLocalError(errorMsg);
            setOtp(new Array(6).fill(""));
            inputRefs.current[0]?.focus();
        }
    };

    const handleVerify = async () => {
        if (isNavigating) {
            console.log("Already navigating, please wait...");
            return;
        }
        
        const otpValue = otp.join("");

        if (otpValue.length !== 6) {
            errorAlert("Please enter complete 6-digit OTP", "OK");
            return;
        }

        if (!mobile) {
            errorAlert("Mobile number not found. Please login again.", "OK");
            setTimeout(() => navigate("/login"), 2000);
            return;
        }

        setLocalError("");
        dispatch(clearError());
        
        await callOtpApi(false);
    };

    const handleResend = async () => {
        if (isNavigating) return;
        
        if (!mobile) {
            errorAlert("Mobile number not found. Please login again.", "OK");
            setTimeout(() => navigate("/login"), 2000);
            return;
        }
        
        setTimer(30);
        setOtp(new Array(6).fill(""));
        inputRefs.current[0]?.focus();
        setLocalError("");
        dispatch(clearError());
        
        try {
            const { loginAPI } = await import("../../store/Login_Slice");
            const payload = {
                mobile: mobile,
                deviceId: deviceInfo.deviceId,
                deviceType: deviceInfo.deviceType
            };
            
            const res = await loginAPI(payload);
            
            if (res?.data?.message || res?.data?.success) {
                const successMsg = res?.data?.message || "OTP resent successfully!";
                successAlert(successMsg, "OK");
            }
        } catch (err: any) {
            const errorMsg = err?.response?.data?.errors || err?.response?.data?.message || "Failed to resend OTP. Please try again.";
            errorAlert(errorMsg, "Try Again");
        }
    };

    const displayError = localError || (typeof error === "string" ? error : "");

    return (
        <>
            <div className={`flex min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-gray-100'}`}>
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

                {/* Right Side - OTP Form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="w-full max-w-md"
                    >
                        <div className="text-center">
                            <div className="relative inline-block mb-6">
                                <motion.div
                                    whileHover={{ scale: 1.05, rotate: 5 }}
                                    transition={{ type: "spring", stiffness: 400 }}
                                >
                                    <img
                                        src={otpData?.companyLogo || "/default-logo.png"}
                                        alt="FlexiCRM"
                                        className="w-20 h-20 mx-auto rounded-full"
                                        style={{ 
                                            boxShadow: `0 0 0 3px ${primaryColor}20, 0 0 0 6px ${primaryColor}10` 
                                        }}
                                    />
                                </motion.div>
                            </div>
                        </div>
                        
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-2xl font-bold text-center mb-2"
                            style={{ 
                                background: `linear-gradient(135deg, ${primaryColor || '#05264e'}, ${primaryColor ? `${primaryColor}cc` : '#0a3a6e'})`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                            }}
                        >
                            {otpData?.companyName || "FlexiCRM"}
                        </motion.p>
                        
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className={`text-3xl font-bold text-center mt-4 mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}
                        >
                            Verify OTP
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className={`text-center mb-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
                        >
                            Enter the 6-digit code sent to{" "}
                            <span className="font-bold" style={{ color: primaryColor || '#05264e' }}>
                                {mobile || "your mobile"}
                            </span>
                        </motion.p>

                        {/* OTP Input Container */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 }}
                            className="flex justify-center gap-3 sm:gap-4 mb-4"
                            onPaste={handlePaste}
                        >
                            {otp.map((data, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    maxLength={1}
                                    className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-semibold rounded-xl border-2 transition-all duration-200 focus:outline-none ${
                                        darkMode 
                                            ? 'bg-gray-800 text-white border-gray-700 focus:border-gray-500' 
                                            : 'bg-white text-gray-900 border-gray-200 focus:border-gray-400'
                                    } ${otp[index] ? 'border-opacity-100' : 'border-opacity-50'}`}
                                    style={{
                                        borderColor: otp[index] ? primaryColor : undefined,
                                        boxShadow: otp[index] ? `0 0 0 2px ${primaryColor}20` : undefined
                                    }}
                                    value={data}
                                    ref={(el) => {inputRefs.current[index] = el;}}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(e.target, index)}
                                    onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => handleKeyDown(e, index)}
                                    onFocus={(e: React.FocusEvent<HTMLInputElement>) => e.target.select()}
                                    disabled={isLoading || isNavigating}
                                />
                            ))}
                        </motion.div>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.55 }}
                            className={`text-xs text-center mb-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}
                        >
                            💡 Tip: You can copy and paste the 6-digit OTP
                        </motion.p>

                        {/* Error Message */}
                        {displayError && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-3 rounded-lg mb-4"
                                style={{ 
                                    backgroundColor: darkMode ? '#450a0a' : '#fef2f2',
                                    borderColor: darkMode ? '#7f1d1d' : '#fecaca',
                                    borderWidth: '1px'
                                }}
                            >
                                <p className={`text-sm text-center ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                                    {displayError}
                                </p>
                            </motion.div>
                        )}

                        {/* Verify Button */}
                        <Reusable_Button
                            type="button"
                            text={isLoading || isNavigating ? (isNavigating ? "Redirecting..." : "Verifying...") : "Verify & Continue"}
                            variant="primary"
                            size="lg"
                            fullWidth={true}
                            isLoading={isLoading || isNavigating}
                            disabled={isLoading || isNavigating || otp.join("").length < 6}
                            onClick={handleVerify}
                        />

                        {/* Resend Section */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="flex justify-center items-center gap-3 mt-6"
                        >
                            <button
                                onClick={handleResend}
                                disabled={timer > 0 || isLoading || isNavigating}
                                className={`text-sm font-medium transition-all duration-200 ${
                                    timer > 0 || isLoading || isNavigating
                                        ? `${darkMode ? 'text-gray-600' : 'text-gray-400'} cursor-not-allowed`
                                        : 'hover:opacity-80 cursor-pointer'
                                }`}
                                style={{ color: timer > 0 || isLoading || isNavigating ? undefined : primaryColor || '#ff9800' }}
                            >
                                Resend OTP
                            </button>
                            {timer > 0 && (
                                <span className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                    in {timer}s
                                </span>
                            )}
                        </motion.div>

                        {/* Back to Login Link */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.65 }}
                            className="text-center mt-6"
                        >
                            <button
                                onClick={() => navigate("/login")}
                                className="text-sm hover:opacity-80 transition-opacity"
                                style={{ color: primaryColor || '#6366f1' }}
                                disabled={isNavigating}
                            >
                                ← Back to Login
                            </button>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
            <GlobalStatus />
        </>
    );
};

export default Otp;