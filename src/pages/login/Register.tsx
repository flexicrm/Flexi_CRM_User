import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RegisterUser, fetchCategories } from "../../store/Login_Slice";
import Auth_Slider from "./Auth_Slider";

interface FormData {
  companyName: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  password: string;
  industry: string;
  companySize: string;
  address: string;
  rememberMe: boolean;
}

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isLoading, error, categories, categoriesLoading } = useSelector((state) => state.auth);

  const categoryList = Array.isArray(categories) ? categories : [];

  const [formData, setFormData] = useState<FormData>({
    companyName: "",
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    password: "",
    industry: "",
    companySize: "",
    address: "",
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const validateForm = () => {
    if (!formData.companyName.trim()) {
      setLocalError("Company name is required");
      return false;
    }
    if (!formData.firstName.trim()) {
      setLocalError("First name is required");
      return false;
    }
    if (!formData.lastName.trim()) {
      setLocalError("Last name is required");
      return false;
    }
    if (!formData.email.trim()) {
      setLocalError("Email is required");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setLocalError("Please enter a valid email address");
      return false;
    }
    if (!formData.mobile.trim()) {
      setLocalError("Mobile number is required");
      return false;
    }
    if (!/^\d{10}$/.test(formData.mobile)) {
      setLocalError("Please enter a valid 10-digit mobile number");
      return false;
    }
    if (!formData.password) {
      setLocalError("Password is required");
      return false;
    }
    if (formData.password.length < 6) {
      setLocalError("Password must be at least 6 characters long");
      return false;
    }
    if (!formData.industry) {
      setLocalError("Please select an industry");
      return false;
    }
    if (!formData.companySize) {
      setLocalError("Please select company size");
      return false;
    }
    if (!formData.address.trim()) {
      setLocalError("Address is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    if (!validateForm()) return;

    const registerData : any = {
     companyName: formData.companyName,
                Admin: {
                    firstname: formData.firstName,
                    lastname: formData.lastName,
                    email: formData.email,
                    mobile: formData.mobile
                },
                industry: formData.industry,
                companySize: formData.companySize,
                address: formData.address
    };

    try {
      const result = await dispatch(RegisterUser(registerData));
      if (RegisterUser.fulfilled.match(result)) {
        localStorage.setItem("mobile", formData.mobile);
        navigate("/login", { state: { mobile: formData.mobile } });
      } else {
        setLocalError(result.payload?.message || "Registration failed");
      }
    } catch {
      setLocalError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="register-page">
      {/* Left Side */}
      <div className="slider-half">
        <Auth_Slider />
      </div>

      {/* Right Side */}
      <div className="form-half">
        <div className="register-box">
          <h1 className="company-title">Create Account</h1>

          <form onSubmit={handleSubmit}>
            {/* Company Name */}
            <div className="input-container">
              <input
                type="text"
                name="companyName"
                placeholder="Company Name"
                className="main-input"
                value={formData.companyName}
                onChange={handleChange}
                required
              />
            </div>

            {/* First Name & Last Name - Two Columns */}
            <div className="two-columns">
              <div className="input-container">
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  className="main-input"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-container">
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  className="main-input"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Email & Mobile - Two Columns */}
            <div className="two-columns">
              <div className="input-container">
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  className="main-input"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-container">
                <input
                  type="number"
                  name="mobile"
                  placeholder="Mobile Number"
                  className="main-input"
                  value={formData.mobile}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Password with Toggle */}
            <div className="input-container password-container">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                className="main-input"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <span
                className="eye-icon"
                onClick={() => setShowPassword(!showPassword)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  width="20"
                  height="20"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.036 12.322a1.012 1.012 0 0 1 0-.644C3.67 8.5 7.652 6 12 6c4.348 0 8.33 2.5 9.964 6.322a1.012 1.012 0 0 1 0 .644C20.33 15.5 16.348 18 12 18c-4.348 0-8.33-2.5-9.964-6.322Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                </svg>
              </span>
            </div>

            {/* Industry Dropdown */}
            {/* Industry Dropdown */}
<div className="input-container">
  <select
    name="industry"
    className="main-input select-input"
    value={formData.industry}
    onChange={handleChange}
    disabled={categoriesLoading}
    required
  >
    <option value="">
      {categoriesLoading ? "Loading industries..." : "Select Industry"}
    </option>

    {categoryList.length > 0 ? (
      categoryList.map((cat: any) => (
        <option key={cat._id} value={cat._id}>
          {cat.categoryname}
        </option>
      ))
    ) : (
      !categoriesLoading && (
        <option value="" disabled>No industries available</option>
      )
    )}
  </select>
</div>

            {/* Company Size & Address - Two Columns */}
            <div className="two-columns">
              <div className="input-container">
                <select
                  name="companySize"
                  className="main-input select-input"
                  value={formData.companySize}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>Company Size</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="501-1000">501-1000 employees</option>
                  <option value="1000+">1000+ employees</option>
                </select>
              </div>
              <div className="input-container">
                <input
                  type="text"
                  name="address"
                  placeholder="Address"
                  className="main-input"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="options-row">
              <label className="custom-checkbox">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
                <span className="checkmark"></span>
                Remember me
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="submit-btn"
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {/* Error Message */}
          {(localError || error) && (
            <p style={{ color: "red", marginTop: "10px", fontSize: "14px" }}>
              {localError || (typeof error === 'string' ? error : error?.message)}
            </p>
          )}

          {/* Login Link */}
          <p className="signup-link">
            Already have an account?{" "}
            <span onClick={() => navigate("/login")}>
              Sign in
            </span>
          </p>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

        .register-page {
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

        .register-box {
          width: 100%;
          max-width: 500px;
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
          position: relative;
        }

        .main-input {
          width: 100%;
          padding: 15px 20px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 16px;
          font-family: 'Poppins', sans-serif;
          transition: all 0.3s ease;
          box-sizing: border-box;
        }

        .main-input:focus {
          outline: none;
          border-color: #05264e;
          box-shadow: 0 0 0 2px rgba(5, 38, 78, 0.1);
        }

        .select-input {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23666'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 15px center;
          background-size: 18px;
          cursor: pointer;
        }

        .select-input:disabled {
          background-color: #f5f5f5;
          cursor: not-allowed;
        }

        .two-columns {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 0;
        }

        .two-columns .input-container {
          margin-bottom: 20px;
        }

        .password-container {
          position: relative;
        }

        .eye-icon {
          position: absolute;
          right: 15px;
          top: 50%;
          transform: translateY(-50%);
          cursor: pointer;
          color: #666;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .eye-icon:hover {
          color: #05264e;
        }

        .options-row {
          margin: 20px 0;
          display: flex;
          justify-content: flex-start;
        }

        .custom-checkbox {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          font-size: 14px;
          color: #666;
          position: relative;
          padding-left: 28px;
        }

        .custom-checkbox input {
          position: absolute;
          opacity: 0;
          cursor: pointer;
          height: 0;
          width: 0;
        }

        .checkmark {
          position: absolute;
          left: 0;
          height: 18px;
          width: 18px;
          background-color: #fff;
          border: 2px solid #ddd;
          border-radius: 4px;
        }

        .custom-checkbox:hover input ~ .checkmark {
          border-color: #05264e;
        }

        .custom-checkbox input:checked ~ .checkmark {
          background-color: #05264e;
          border-color: #05264e;
        }

        .checkmark:after {
          content: "";
          position: absolute;
          display: none;
        }

        .custom-checkbox input:checked ~ .checkmark:after {
          display: block;
        }

        .custom-checkbox .checkmark:after {
          left: 5px;
          top: 1px;
          width: 4px;
          height: 8px;
          border: solid white;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
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
          transition: all 0.3s ease;
          font-family: 'Poppins', sans-serif;
        }

        .submit-btn:hover:not(:disabled) {
          background: #0a3a6e;
          transform: translateY(-1px);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .signup-link {
          text-align: center;
          font-size: 14px;
          margin-top: 20px;
          color: #666;
        }

        .signup-link span {
          color: #3b82f6;
          cursor: pointer;
          font-weight: 500;
        }

        .signup-link span:hover {
          text-decoration: underline;
        }

        @media (max-width: 1024px) {
          .register-page {
            flex-direction: column;
          }
          
          .slider-half {
            min-height: 250px;
          }
          
          .form-half {
            padding: 30px 20px;
          }
          
          .register-box {
            max-width: 100%;
          }
          
          .two-columns {
            grid-template-columns: 1fr;
            gap: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default Register;