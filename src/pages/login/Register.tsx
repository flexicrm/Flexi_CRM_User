import { AnimatePresence, motion } from "framer-motion";
import {
  Briefcase,
  Building2,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Reusable_Button from "../../component/button/Reusable_Button";
import Reusable_Fields from "../../component/Fields/Reusable_Fiealds";
import GlobalStatus from "../../component/Notification/GlobalStatus";
import { errorAlert, successAlert } from "../../component/Notification/statusHandler";
import { RegisterUser, fetchCategories } from "../../store/Login_Slice";
import type { AppDispatch } from "../../store/Store";
import Auth_Slider from "./Auth_Slider";

interface FormData {
  companyName: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  industry: string;
  companySize: string;
  address: string;
  rememberMe: boolean;
}

// Helper function to extract error message from API response
const extractErrorMessage = (error: any): string => {
  console.log("Extracting error from:", error);
  
  // Check for errors in response data
  if (error?.response?.data) {
    const responseData = error.response.data;
    
    // Check for errors object
    if (responseData.errors) {
      if (typeof responseData.errors === 'string') {
        return responseData.errors;
      }
      if (typeof responseData.errors === 'object') {
        // Get first error message from object
        const firstKey = Object.keys(responseData.errors)[0];
        if (firstKey && responseData.errors[firstKey]) {
          return responseData.errors[firstKey];
        }
        return JSON.stringify(responseData.errors);
      }
    }
    
    // Check for message field
    if (responseData.message) {
      return responseData.message;
    }
    
    // Check for error field
    if (responseData.error) {
      return responseData.error;
    }
  }
  
  // Check for error in payload (from rejected action)
  if (error?.payload) {
    const payload = error.payload;
    if (payload.errors) {
      if (typeof payload.errors === 'string') return payload.errors;
      if (typeof payload.errors === 'object') {
        const firstKey = Object.keys(payload.errors)[0];
        if (firstKey && payload.errors[firstKey]) {
          return payload.errors[firstKey];
        }
      }
    }
    if (payload.message) return payload.message;
    if (payload.error) return payload.error;
  }
  
  // Check for error in error object
  if (error?.error) {
    if (typeof error.error === 'string') return error.error;
    if (error.error.message) return error.error.message;
  }
  
  // Check for message directly
  if (error?.message) return error.message;
  
  return "Registration failed. Please try again.";
};

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, categories, categoriesLoading } = useSelector((state: { auth: any }) => state.auth);
  const { primaryColor, darkMode } = useSelector((state: any) => state.theme);

  const categoryList = Array.isArray(categories) ? categories : [];

  const [formData, setFormData] = useState<FormData>({
    companyName: "",
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    industry: "",
    companySize: "",
    address: "",
    rememberMe: false,
  });

  const [localError, setLocalError] = useState("");
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    dispatch(fetchCategories() as any);
  }, [dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target;
    setFormData({
      ...formData,
      [target.name]: target.type === "checkbox" ? (target as HTMLInputElement).checked : target.value,
    });
    if (localError) setLocalError("");
  };

  const validateForm = () => {
    if (!formData.companyName.trim()) {
      setLocalError("Company name is required");
      errorAlert("Company name is required", "OK");
      return false;
    }
    if (!formData.firstName.trim()) {
      setLocalError("First name is required");
      errorAlert("First name is required", "OK");
      return false;
    }
    if (!formData.lastName.trim()) {
      setLocalError("Last name is required");
      errorAlert("Last name is required", "OK");
      return false;
    }
    if (!formData.email.trim()) {
      setLocalError("Email is required");
      errorAlert("Email is required", "OK");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setLocalError("Please enter a valid email address");
      errorAlert("Please enter a valid email address", "OK");
      return false;
    }
    if (!formData.mobile.trim()) {
      setLocalError("Mobile number is required");
      errorAlert("Mobile number is required", "OK");
      return false;
    }
    if (!/^\d{10}$/.test(formData.mobile)) {
      setLocalError("Please enter a valid 10-digit mobile number");
      errorAlert("Please enter a valid 10-digit mobile number", "OK");
      return false;
    }
    if (!formData.industry) {
      setLocalError("Please select an industry");
      errorAlert("Please select an industry", "OK");
      return false;
    }
    if (!formData.companySize) {
      setLocalError("Please select company size");
      errorAlert("Please select company size", "OK");
      return false;
    }
    if (!formData.address.trim()) {
      setLocalError("Address is required");
      errorAlert("Address is required", "OK");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    if (!validateForm()) return;

    const registerData: any = {
      companyName: formData.companyName,
      Admin: {
        firstname: formData.firstName,
        lastname: formData.lastName,
        email: formData.email,
        mobile: formData.mobile,
      },
      industry: formData.industry,
      companySize: formData.companySize,
      address: formData.address,
    };

    try {
      const result = await dispatch(RegisterUser(registerData));
      console.log("Registration result:", result);
      
      if (RegisterUser.fulfilled.match(result)) {
        // Success - registration worked
        const successMessage = result.payload?.data?.message || 
                              result.payload?.message || 
                              "Registration successful! Please login.";
        successAlert(successMessage, "Go to Login");
        
        if (formData.rememberMe) {
          localStorage.setItem("rememberedMobile", formData.mobile);
        }
        localStorage.setItem("mobile", formData.mobile);
        
        // Navigate after a short delay to show success popup
        setTimeout(() => {
          navigate("/login", { state: { mobile: formData.mobile } });
        }, 2000);
      } else {
        // Failed registration - extract error message
        const errorMessage = extractErrorMessage(result);
        console.log("Extracted error message:", errorMessage);
        
        // Show popup with the actual error message
        errorAlert(errorMessage, "Try Again");
        setLocalError(errorMessage);
      }
    } catch (err: any) {
      console.error("Registration error:", err);
      const errorMessage = extractErrorMessage(err);
      console.log("Extracted error from catch:", errorMessage);
      
      // Show popup with the actual error message
      errorAlert(errorMessage, "Try Again");
      setLocalError(errorMessage);
    }
  };

  const companySizeOptions = [
    { label: "1-10 employees", value: "1-10" },
    { label: "11-50 employees", value: "11-50" },
    { label: "51-200 employees", value: "51-200" },
    { label: "201-500 employees", value: "201-500" },
    { label: "501-1000 employees", value: "501-1000" },
    { label: "1000+ employees", value: "1000+" },
  ];

  const industryOptions = categoryList.map((cat: any) => ({
    label: cat.categoryname,
    value: cat._id,
  }));


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

        {/* Right Side - Register Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            {/* Header Section */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="text-center mb-8"
            >
              <motion.h1
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}
              >
                Create Account
              </motion.h1>
              <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
              >
                Join FlexiCRM and start managing your business
              </motion.p>
            </motion.div>

            {/* Progress Steps - Compact */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mb-8"
            >
              <div className="flex justify-between items-center max-w-xs mx-auto">
                {[
                  { step: 1, label: "Company" },
                  { step: 2, label: "Admin" },
                  { step: 3, label: "Business" },
                ].map((item) => (
                  <div key={item.step} className="flex-1 text-center">
                    <div
                      className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
                        currentStep >= item.step
                          ? `shadow-lg ${darkMode ? 'bg-gradient-to-r from-gray-700 to-gray-800' : 'bg-gradient-to-r from-[#05264e] to-[#0a3a6e]'} text-white`
                          : `${darkMode ? 'bg-gray-800 text-gray-500' : 'bg-gray-200 text-gray-500'}`
                      }`}
                      style={currentStep >= item.step && !darkMode && primaryColor ? 
                        { background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)` } : 
                        {}}
                    >
                      {item.step}
                    </div>
                    <p className={`text-xs mt-1 hidden sm:block ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
              <div className="relative mt-2 max-w-xs mx-auto">
                <div className={`absolute top-0 left-0 h-1 rounded-full w-full ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ 
                      background: darkMode 
                        ? '#6b7280' 
                        : `linear-gradient(90deg, ${primaryColor || '#05264e'}, ${primaryColor ? `${primaryColor}cc` : '#0a3a6e'})`
                    }}
                    initial={{ width: "0%" }}
                    animate={{ width: `${((currentStep - 1) / 2) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Form - Compact Fields */}
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              onSubmit={handleSubmit}
              className="space-y-8"
            >
              {/* Step 1: Company Information */}
              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <Reusable_Fields
                      type="text"
                      label="Company Name"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      placeholder="Enter your company name"
                      required={true}
                      icon={<Building2 className="w-4 h-4" />}
                    />

                    <Reusable_Fields
                      type="textarea"
                      label="Address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Enter your company address"
                      required={true}
                      icon={<MapPin className="w-4 h-4" />}
                      rows={2}
                    />

                    <div className="flex justify-end">
                      <Reusable_Button
                        type="button"
                        text="Next →"
                        variant="primary"
                        size="md"
                        onClick={() => setCurrentStep(2)}
                      />
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Admin Details */}
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <Reusable_Fields
                        type="text"
                        label="First Name"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="First name"
                        required={true}
                        icon={<User className="w-4 h-4" />}
                      />

                      <Reusable_Fields
                        type="text"
                        label="Last Name"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Last name"
                        required={true}
                        icon={<User className="w-4 h-4" />}
                      />
                    </div>

                    <Reusable_Fields
                      type="email"
                      label="Email Address"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter email address"
                      required={true}
                      icon={<Mail className="w-4 h-4" />}
                    />

                    <Reusable_Fields
                      type="phone"
                      label="Mobile Number"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      placeholder="Enter 10-digit mobile number"
                      required={true}
                      icon={<Phone className="w-4 h-4" />}
                    />

                    <div className="flex justify-between gap-3">
                      <Reusable_Button
                        type="button"
                        text="← Back"
                        variant="secondary"
                        size="md"
                        onClick={() => setCurrentStep(1)}
                      />
                      <Reusable_Button
                        type="button"
                        text="Next →"
                        variant="primary"
                        size="md"
                        onClick={() => setCurrentStep(3)}
                      />
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Business Information */}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <Reusable_Fields
                      type="select"
                      label="Industry"
                      name="industry"
                      value={formData.industry}
                      onChange={handleChange}
                      placeholder="Select your industry"
                      options={industryOptions}
                      required={true}
                      icon={<Briefcase className="w-4 h-4" />}
                      disabled={categoriesLoading}
                    />

                    <Reusable_Fields
                      type="select"
                      label="Company Size"
                      name="companySize"
                      value={formData.companySize}
                      onChange={handleChange}
                      placeholder="Select company size"
                      options={companySizeOptions}
                      required={true}
                      icon={<Building2 className="w-4 h-4" />}
                    />

                    {/* Remember Me Checkbox */}
                    <div className="flex items-center gap-2 py-1">
                      <input
                        type="checkbox"
                        id="rememberMe"
                        name="rememberMe"
                        checked={formData.rememberMe}
                        onChange={handleChange}
                        className="w-3.5 h-3.5 rounded focus:ring-2"
                        style={{ 
                          accentColor: primaryColor || '#3B82F6',
                          borderColor: darkMode ? '#4b5563' : '#d1d5db'
                        }}
                      />
                      <label htmlFor="rememberMe" className={`text-xs cursor-pointer ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Remember me
                      </label>
                    </div>

                    <div className="flex justify-between gap-3">
                      <Reusable_Button
                        type="button"
                        text="← Back"
                        variant="secondary"
                        size="md"
                        onClick={() => setCurrentStep(2)}
                      />
                      <Reusable_Button
                        type="submit"
                        text={isLoading ? "Creating..." : "Create Account →"}
                        variant="primary"
                        size="md"
                        fullWidth={true}
                        isLoading={isLoading}
                        disabled={isLoading}
                        icon={<Building2 className="w-4 h-4" />}
                        iconPosition="left"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.form>

            {/* Login Link */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className={`text-center text-sm mt-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
            >
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="font-semibold cursor-pointer transition-colors hover:opacity-80"
                style={{ color: primaryColor || '#6366f1' }}
              >
                Sign in
              </button>
            </motion.p>
          </motion.div>
        </div>
      </div>
      <GlobalStatus />
    </>
  );
};

export default Register;