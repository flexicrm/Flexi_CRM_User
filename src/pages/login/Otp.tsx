import { type ChangeEvent, type ClipboardEvent, type KeyboardEvent, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { OtpUser } from "../../store/Login_Slice";
import type { AppDispatch } from "../../store/Store";
import Auth_Slider from "./Auth_Slider";

// Types
interface LocationState {
  mobile?: string;
  otpData?: {
    companyLogo?: string;
    companyName?: string;
  };
}

interface OtpData {
  companyLogo?: string;
  companyName?: string;
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
    const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
    const [timer, setTimer] = useState<number>(27);
    const [localError, setLocalError] = useState<string>("");

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [isAnimating, setIsAnimating] = useState<boolean>(false);

    useEffect(() => {
        // Trigger animation on mount
        setIsAnimating(true);
        const timer = setTimeout(() => setIsAnimating(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    // ✅ Get mobile number on component mount
    useEffect(() => {
        // Try to get mobile from navigation state first
        const state = location.state as LocationState;
        const { mobile: mobileFromState, otpData: otpDataFromState } = state || {};
        const mobileFromStorage = localStorage.getItem("mobile");
        const finalMobile = mobileFromState || mobileFromStorage;

        if (otpDataFromState) {
            setOtpData(otpDataFromState);
        }
        
        if (finalMobile) {
            setMobile(finalMobile);
        } else {
            // If no mobile number found, redirect back to login
            setLocalError("Mobile number not found. Please login again.");
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        }
    }, [location.state, navigate]);

    // ⏳ Timer Logic
    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    // 🔢 Handle OTP Input
    const handleChange = (element: HTMLInputElement, index: number) => {
        const value = element.value;
        if (isNaN(Number(value))) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Move to next
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    // ⬅ Backspace
    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    // 📋 Handle Paste OTP
    const handlePaste = (e: ClipboardEvent<HTMLDivElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text");
        
        // Check if pasted data is a 6-digit number
        if (/^\d{6}$/.test(pastedData)) {
            const otpArray = pastedData.split("");
            setOtp(otpArray);
            
            // Focus on the last input after paste
            inputRefs.current[5]?.focus();
        } else {
            setLocalError("Please paste a valid 6-digit OTP");
            setTimeout(() => setLocalError(""), 3000);
        }
    };

    // ✅ VERIFY OTP
    const handleVerify = async () => {
        const otpValue = otp.join("");

        if (otpValue.length !== 6) {
            setLocalError("Please enter complete OTP");
            return;
        }

        if (!mobile) {
            setLocalError("Mobile number not found. Please login again.");
            setTimeout(() => navigate("/login"), 2000);
            return;
        }

        setLocalError("");

        try {
            const result = await dispatch(
                OtpUser({
                    mobile: mobile,
                    otp: otpValue,
                })
            ) as any;

            if (OtpUser.fulfilled.match(result)) {
                // 🔥 IMPORTANT: normalize response
                const responseData = result.payload;

                const accessToken = responseData?.accessToken || responseData?.data?.accessToken;
                const refreshToken = responseData?.refreshToken || responseData?.data?.refreshToken;
                const expiresIn = responseData?.expiresIn || responseData?.data?.expiresIn;
                const subdomain = responseData?.subdomain || responseData?.data?.subdomain;
                const userData = responseData?.user || responseData?.data?.user;

                // ✅ STORE CLEANLY (ONLY ONCE)
                if (accessToken && refreshToken) {
                    localStorage.setItem("accessToken", accessToken);
                    localStorage.setItem("refreshToken", refreshToken);

                    // ✅ FIXED expiry
                    if (expiresIn) {
                        localStorage.setItem(
                            "tokenExpiry",
                            String(Date.now() + Number(expiresIn))
                        );
                    }
                }

                if (subdomain) {
                    localStorage.setItem("subdomain", subdomain);
                }

                if (userData) {
                    localStorage.setItem("userData", JSON.stringify(userData));
                }

                if (responseData?.isFirstlogin !== undefined) {
                    localStorage.setItem(
                        "isFirstLogin",
                        String(responseData.isFirstlogin)
                    );
                }

                // ❌ REMOVE TEMP DATA
                localStorage.removeItem("mobile");

                // ✅ NAVIGATION
                const sub = subdomain || localStorage.getItem("subdomain");

                navigate(`/${sub}/dashboard`);
            } else {
                setLocalError(
                    result.payload?.message || "OTP verification failed. Please try again."
                );
            }
        } catch (err) {
            console.error("OTP verification failed:", err);
            setLocalError("OTP verification failed. Please try again.");
        }
    };

    // 🔁 Resend OTP
    const handleResend = async () => {
        if (!mobile) {
            setLocalError("Mobile number not found. Please login again.");
            setTimeout(() => {
                navigate("/login");
            }, 2000);
            return;
        }
        
        setTimer(30);
        setOtp(new Array(6).fill(""));
        inputRefs.current[0]?.focus();
        setLocalError("");
        
        // 👉 Call login API again to resend OTP
        try {
            // Import loginAPI if needed
            const { loginAPI } = await import("../../store/Login_Slice");
            const res = await loginAPI({ mobile });
            
            if (res?.data?.message) {
                setLocalError("OTP resent successfully!");
                setTimeout(() => setLocalError(""), 3000);
            }
            console.log("OTP resent successfully");
        } catch (err) {
            console.error("Failed to resend OTP:", err);
            setLocalError("Failed to resend OTP. Please try again.");
        }
    };

    return (
        <div className="login-page">
            {/* Left Side */}
            <div className="slider-half">
                <Auth_Slider />
            </div>

            {/* Right Side */}
            <div className="form-half">
                <div className="otp-card">
                    <div className="text-center">
                        <div className="relative inline-block">
                            <img
                                className={`border-2 border-gray-300 rounded-full p-2 mb-4 transition-all duration-300 hover:scale-110 hover:rotate-6 hover:border-[#05264e] hover:shadow-xl
                                    ${isAnimating ? 'animate-[logoEntrance_0.8s_cubic-bezier(0.68,-0.55,0.265,1.55)]' : ''}
                                    animate-[pulse_2s_ease-in-out_infinite]`}
                                src={otpData?.companyLogo}
                                alt="FlexiCRM"
                                width={60}
                                height={60}
                            />
                            {/* Animated Ring Effect */}
                            <div className={`absolute inset-0 rounded-full border-2 border-[#05264e] opacity-0 ${isAnimating ? 'animate-[ringPulse_0.8s_ease-out]' : ''}`}></div>
                        </div>
                    </div>
                    <p className="text-2xl font-bold bg-gradient-to-r from-blue-900 to-purple-800 bg-clip-text text-transparent animate-slide-up">
                        {otpData?.companyName}
                    </p>
                    <h1 className="otp-title">Verify OTP</h1>

                    <p className="otp-subtitle">
                        Enter the 6-digit code sent to{" "}
                        <span className="phone-num">{mobile || "your mobile"}</span>
                    </p>

                    {/* OTP Inputs */}
                    <div 
                        className="otp-input-container"
                        onPaste={handlePaste}
                    >
                        {otp.map((data, index) => (
                            <input
                                key={index}
                                type="text"
                                maxLength={1}
                                className={`otp-box ${
                                    otp[index] || (index === 0 && !otp[0])
                                        ? "active"
                                        : ""
                                }`}
                                value={data}
                                ref={(el) => {inputRefs.current[index] = el;}}
                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                    handleChange(e.target, index)
                                }
                                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => handleKeyDown(e, index)}
                                onFocus={(e: React.FocusEvent<HTMLInputElement>) => e.target.select()}
                            />
                        ))}
                    </div>

                    {/* Paste Helper Text */}
                    <p style={{ 
                        fontSize: "12px", 
                        color: "#718096", 
                        marginBottom: "10px",
                        textAlign: "center"
                    }}>
                        💡 Tip: You can copy and paste the 6-digit OTP
                    </p>

                    {/* ERROR */}
                    {(localError || error) && (
                        <p style={{ 
                            color: localError?.includes("successfully") ? "green" : "red", 
                            marginBottom: "10px",
                            fontSize: "14px"
                        }}>
                            {localError || error}
                        </p>
                    )}

                    {/* VERIFY BUTTON */}
                    <button
                        className="verify-btn"
                        onClick={handleVerify}
                        disabled={isLoading}
                    >
                        {isLoading ? "Verifying..." : "Verify & Continue"}
                    </button>

                    {/* RESEND */}
                    <div className="resend-section">
                        <button
                            className={`resend-btn ${
                                timer > 0 ? "disabled" : ""
                            }`}
                            disabled={timer > 0}
                            onClick={handleResend}
                        >
                            Resend OTP
                        </button>

                        <span className="timer-text">
                            {timer > 0 ? `in ${timer}s` : ""}
                        </span>
                    </div>
                </div>
            </div>

            {/* STYLES */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

                .login-page {
                    display: flex;
                    min-height: 100vh;
                    font-family: 'Poppins', sans-serif;
                }

                .slider-half {
                    flex: 1;
                    background-color: #05264e;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    color: white;
                }

                .form-half {
                    flex: 1;
                    background: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 40px;
                }

                .otp-card {
                    width: 100%;
                    max-width: 450px;
                    text-align: center;
                }

                .otp-title {
                    color: #05264e;
                    font-size: 28px;
                    font-weight: 700;
                }

                .otp-subtitle {
                    margin: 10px 0 30px;
                    color: #718096;
                }

                .phone-num {
                    font-weight: bold;
                    color: #05264e;
                }

                .otp-input-container {
                    display: flex;
                    justify-content: center;
                    gap: 15px;
                    margin-bottom: 20px;
                }

                .otp-box {
                    width: 55px;
                    height: 70px;
                    border: 1px solid #ccc;
                    border-radius: 10px;
                    text-align: center;
                    font-size: 22px;
                    transition: all 0.3s ease;
                }

                .otp-box:focus {
                    border-color: #ff9800;
                    outline: none;
                    box-shadow: 0 0 0 2px rgba(255, 152, 0, 0.2);
                }

                .verify-btn {
                    width: 100%;
                    padding: 15px;
                    background: #05264e;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 16px;
                    font-weight: 600;
                    transition: all 0.3s ease;
                }

                .verify-btn:hover:not(:disabled) {
                    background: #0a3a6e;
                }

                .verify-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .resend-section {
                    margin-top: 20px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 10px;
                }

                .resend-btn {
                    background: none;
                    border: none;
                    color: #ff9800;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    transition: all 0.3s ease;
                }

                .resend-btn:hover:not(:disabled) {
                    text-decoration: underline;
                }

                .resend-btn.disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .timer-text {
                    color: #718096;
                    font-size: 14px;
                }

                @keyframes logoEntrance {
                    0% {
                        opacity: 0;
                        transform: scale(0.5) rotate(-180deg);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1) rotate(0deg);
                    }
                }

                @keyframes ringPulse {
                    0% {
                        opacity: 0.6;
                        transform: scale(0.8);
                    }
                    100% {
                        opacity: 0;
                        transform: scale(1.2);
                    }
                }

                @keyframes slide-up {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-slide-up {
                    animation: slide-up 0.5s ease-out;
                }

                @media (max-width: 768px) {
                    .login-page {
                        flex-direction: column;
                    }
                    
                    .slider-half {
                        display: none;
                    }
                    
                    .otp-box {
                        width: 45px;
                        height: 60px;
                        font-size: 18px;
                    }
                    
                    .otp-input-container {
                        gap: 10px;
                    }
                }
            `}</style>
        </div>
    );
};

export default Otp;