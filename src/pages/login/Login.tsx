import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import flexiCRM from "../../assets/logo/flexiCRM.png";
import { loginAPI } from "../../store/Login_Slice";
import Auth_Slider from "./Auth_Slider";

const Login = () => {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({
    mobile: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Trigger animation on mount
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    //  Basic validation
    if (!loginData.mobile) {
      setError("Mobile number is required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await loginAPI(loginData);
      //  Store token and mobile number in localStorage
      if (res?.data?.token) {
        localStorage.setItem("token", res.data.token);
      }
      
      //  Store mobile number in localStorage for OTP page
      localStorage.setItem("mobile", loginData.mobile);

      //  Navigate after success with mobile in state (as backup)
      navigate("/otp", { state: { mobile: loginData.mobile, otpData: res?.data?.data } });

    } catch (err) {
      console.log( err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      
      {/* Left Side */}
      <div className="slider-half">
        <Auth_Slider />
      </div>

      {/* Right Side */}
      <div className="form-half flex flex-col items-center justify-center">
         {/* Logo Container with Animation */}
          <div className="text-center mb-10">
            <div className="relative inline-block">
              <img
                className={`border-2 border-gray-300 rounded-full p-2 mb-4 transition-all duration-300 hover:scale-110 hover:rotate-6 hover:border-[#05264e] hover:shadow-xl
                  ${isAnimating ? 'animate-[logoEntrance_0.8s_cubic-bezier(0.68,-0.55,0.265,1.55)]' : ''}
                  animate-[pulse_2s_ease-in-out_infinite]`}
                src={flexiCRM}
                alt="FlexiCRM"
                width={60}
                height={60}
              />
              {/* Animated Ring Effect */}
              <div className={`absolute inset-0 rounded-full border-2 border-[#05264e] opacity-0 ${isAnimating ? 'animate-[ringPulse_0.8s_ease-out]' : ''}`}></div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#05264e] to-[#0a3a6e] bg-clip-text text-transparent mb-2">
              FlexiCRM
            </h1>
            <p className="text-gray-500 text-sm">Your Business, Simplified</p>
          </div>
        <div className="login-box">
         

          <form onSubmit={handleSubmit}>
            <div className="input-container">
              <input
                type="number"
                name="mobile"
                placeholder="Mobile"
                className="main-input"
                value={loginData.mobile}
                onChange={handleChange}
                required
              />
            </div>

            <div className="options-row">
              <label className="custom-checkbox">
                <input type="checkbox" />
                <span className="checkmark"></span>
                Remember me
              </label>
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/*  Error Message */}
          {error && (
            <p style={{ color: "red", marginTop: "10px" }}>
              {error}
            </p>
          )}

          <p className="signup-link flex items-center gap-2">
            Don't have an account ?
            <span
              className="text-blue-600 cursor-pointer"
              onClick={() => navigate("/register")}
            >
              Register
            </span>
          </p>
        </div>
      </div>

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

        .login-box {
          width: 100%;
          max-width: 400px;
        }

        .company-title {
          color: #05264e;
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 40px;
          text-align: center;
        }

        .input-container {
          margin-bottom: 20px;
        }

        .main-input {
          width: 100%;
          padding: 15px 20px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 16px;
        }

        .submit-btn {
          width: 100%;
          background: #05264e;
          color: white;
          border: none;
          padding: 15px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .signup-link {
          text-align: center;
          font-size: 14px;
          margin-top: 20px;
        }
      `}</style>
    </div>
  );
};

export default Login;