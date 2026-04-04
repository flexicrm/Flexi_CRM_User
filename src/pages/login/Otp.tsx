import { unwrapResult } from "@reduxjs/toolkit";
import { motion } from "framer-motion";
import { type ChangeEvent, type ClipboardEvent, type KeyboardEvent, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import GlobalStatus from "../../component/Notification/GlobalStatus";
import { confirmAlert, errorAlert, successAlert } from "../../component/Notification/statusHandler";
import { clearError, OtpUser } from "../../store/Login_Slice";
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
    
    const [mobile, setMobile] = useState<string>("");
    const [otpData, setOtpData] = useState<OtpData | null>(null);
    localStorage.setItem("companyLogo", otpData?.companyLogo || "");
localStorage.setItem("companyName", otpData?.companyName || "");
    const [, setDeviceIdData] = useState<DeviceIdData | null>(null);
    const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
    const [timer, setTimer] = useState<number>(27);
    const [localError, setLocalError] = useState<string>("");
    
    const [deviceInfo, setDeviceInfo] = useState({
        deviceId: "",
        deviceType: "web",
        forceLogin: false
    });

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [, setIsAnimating] = useState<boolean>(false);

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

    const handleChange = (element: HTMLInputElement, index: number) => {
        const value = element.value;
        if (isNaN(Number(value))) return;

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
            setOtp(otpArray);
            inputRefs.current[5]?.focus();
        } else {
            errorAlert("Please paste a valid 6-digit OTP");
        }
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
            
            // Handle 201 Response (Success but Needs Confirmation)
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
            
            // Handle TRUE Login Success
            const accessToken = responseData?.accessToken || responseData?.data?.accessToken;
            const refreshToken = responseData?.refreshToken || responseData?.data?.refreshToken;
            
            if (accessToken && refreshToken) {
                const expiresIn = responseData?.expiresIn || responseData?.data?.expiresIn;
                const subdomain = responseData?.subdomain || responseData?.data?.subdomain;
                const userData = responseData?.user || responseData?.data?.user;
                
                localStorage.setItem("accessToken", accessToken);
                localStorage.setItem("refreshToken", refreshToken);
                
                if (expiresIn) localStorage.setItem("tokenExpiry", String(Date.now() + Number(expiresIn)));
                if (subdomain) localStorage.setItem("subdomain", subdomain);
                if (userData) localStorage.setItem("userData", JSON.stringify(userData));
                if (responseData?.isFirstlogin !== undefined) localStorage.setItem("isFirstLogin", String(responseData.isFirstlogin));
                
                localStorage.removeItem("mobile");
                
                const successMsg = responseData?.message || "Login successful!";
                successAlert(successMsg, "Continue");
                setLocalError("");
                
                const sub = subdomain || localStorage.getItem("subdomain");
                setTimeout(() => navigate(`/${sub}/dashboard`), 1500);
            } else {
                const errorMsg = responseData?.errors || responseData?.message || "OTP verification failed.";
                errorAlert(errorMsg, "Try Again");
                setLocalError(errorMsg);
            }
            
        } catch (errorData: any) {
            console.log("API Error Response:", errorData);

            // Handle 409 Response (Error because already logged in)
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

            // Standard Errors (Wrong OTP, Network Error, etc.)
            const errorMsg = errorData?.errors || errorData?.message || "OTP verification failed. Please try again.";
            errorAlert(errorMsg, "Try Again");
            setLocalError(errorMsg);
        }
    };

    const handleVerify = async () => {
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

    const displayError =
    localError ||
    (typeof error === "string"
        ? error
        :  "");

    return (
        <>
            <div className="login-page">
                <div className="slider-half">
                    <Auth_Slider />
                </div>

                <div className="form-half">
                    <div className="otp-card">
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
    />
  </motion.div>
</div>
                        </div>
                        <p className="text-2xl font-bold bg-gradient-to-r from-blue-900 to-purple-800 bg-clip-text text-transparent animate-slide-up">
                            {otpData?.companyName || "FlexiCRM"}
                        </p>
                        
                        <h1 className="otp-title">Verify OTP</h1>

                        <p className="otp-subtitle">
                            Enter the 6-digit code sent to{" "}
                            <span className="phone-num">{mobile || "your mobile"}</span>
                        </p>

                        <div style={{ fontSize: "11px", color: "#999", marginBottom: "10px" }}>
                            Device: {deviceInfo.deviceType} | ID: {deviceInfo.deviceId.substring(0, 10)}...
                        </div>

                        <div className="otp-input-container" onPaste={handlePaste}>
                            {otp.map((data, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    maxLength={1}
                                    className={`otp-box ${otp[index] || (index === 0 && !otp[0]) ? "active" : ""}`}
                                    value={data}
                                    ref={(el) => {inputRefs.current[index] = el;}}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(e.target, index)}
                                    onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => handleKeyDown(e, index)}
                                    onFocus={(e: React.FocusEvent<HTMLInputElement>) => e.target.select()}
                                />
                            ))}
                        </div>

                        <p style={{ fontSize: "12px", color: "#718096", marginBottom: "10px", textAlign: "center" }}>
                            💡 Tip: You can copy and paste the 6-digit OTP
                        </p>

                        {displayError && (
                            <p style={{ color: "red", marginBottom: "10px", fontSize: "14px" }}>
                                {displayError}
                            </p>
                        )}

                        <button className="verify-btn" onClick={handleVerify} disabled={isLoading}>
                            {isLoading ? "Verifying..." : "Verify & Continue"}
                        </button>

                        <div className="resend-section">
                            <button className={`resend-btn ${timer > 0 ? "disabled" : ""}`} disabled={timer > 0} onClick={handleResend}>
                                Resend OTP
                            </button>
                            <span className="timer-text">{timer > 0 ? `in ${timer}s` : ""}</span>
                        </div>
                    </div>
                </div>

                <style>{`
                    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
                    .login-page { display: flex; min-height: 100vh; font-family: 'Poppins', sans-serif; }
                    .slider-half { flex: 1; background-color: #05264e; display: flex; justify-content: center; align-items: center; color: white; }
                    .form-half { flex: 1; background: white; display: flex; align-items: center; justify-content: center; padding: 40px; }
                    .otp-card { width: 100%; max-width: 450px; text-align: center; }
                    .otp-title { color: #05264e; font-size: 28px; font-weight: 700; }
                    .otp-subtitle { margin: 10px 0 30px; color: #718096; }
                    .phone-num { font-weight: bold; color: #05264e; }
                    .otp-input-container { display: flex; justify-content: center; gap: 15px; margin-bottom: 20px; }
                    .otp-box { width: 55px; height: 70px; border: 1px solid #ccc; border-radius: 10px; text-align: center; font-size: 22px; transition: all 0.3s ease; }
                    .otp-box:focus { border-color: #ff9800; outline: none; box-shadow: 0 0 0 2px rgba(255, 152, 0, 0.2); }
                    .verify-btn { width: 100%; padding: 15px; background: #05264e; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 600; transition: all 0.3s ease; }
                    .verify-btn:hover:not(:disabled) { background: #0a3a6e; }
                    .verify-btn:disabled { opacity: 0.6; cursor: not-allowed; }
                    .resend-section { margin-top: 20px; display: flex; justify-content: center; align-items: center; gap: 10px; }
                    .resend-btn { background: none; border: none; color: #ff9800; cursor: pointer; font-size: 14px; font-weight: 500; transition: all 0.3s ease; }
                    .resend-btn:hover:not(:disabled) { text-decoration: underline; }
                    .resend-btn.disabled { opacity: 0.5; cursor: not-allowed; }
                    .timer-text { color: #718096; font-size: 14px; }
                    @keyframes logoEntrance { 0% { opacity: 0; transform: scale(0.5) rotate(-180deg); } 100% { opacity: 1; transform: scale(1) rotate(0deg); } }
                    @keyframes ringPulse { 0% { opacity: 0.6; transform: scale(0.8); } 100% { opacity: 0; transform: scale(1.2); } }
                    @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                    .animate-slide-up { animation: slide-up 0.5s ease-out; }
                    @media (max-width: 768px) { .login-page { flex-direction: column; } .slider-half { display: none; } .otp-box { width: 45px; height: 60px; font-size: 18px; } .otp-input-container { gap: 10px; } }
                `}</style>
            </div>
            <GlobalStatus />
        </>
    );
};

export default Otp;