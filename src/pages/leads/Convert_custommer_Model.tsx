import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import Reusable_Button from "../../component/button/Reusable_Button";
import RippleLoader from "../../component/Loader/RippleLoader";
import { errorAlert, successAlert } from "../../component/Notification/statusHandler";
import {
  convertCustomer,
  fetchStatuses,
} from "../../store/homepage_slice/Leads_slice";
import type { AppDispatch } from "../../store/Store";

interface ConvertCustomerModalProps {
  tableId: string;
  selectedData?: any;
  onSuccess?: () => void;
}

const Convert_custommer_Model: React.FC<ConvertCustomerModalProps> = ({ 
  tableId, 
  selectedData, 
  onSuccess 
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams, setSearchParams] = useSearchParams();
  const {  darkMode } = useSelector((state: any) => state.theme);

  const { statusOptions, loading: statusLoading } = useSelector(
    (state: any) => state.leads
  );

  const [loading, setLoading] = useState(false);

  // Find the appropriate status for conversion (Won or Converted)
  const leadStatusArray = Array.isArray(statusOptions) ? statusOptions : [];
  
  // Try to find 'Won' status first, then 'Converted'
  const conversionStatus = leadStatusArray.find(
    (item: any) => {
      const statusName = item?.statusName || item?.name || item?.label || "";
      return statusName.toLowerCase() === 'won' || statusName.toLowerCase() === 'converted';
    }
  );

  // Get theme-based styles
  const getModalBg = () => darkMode ? 'bg-gray-800' : 'bg-white';
  const getModalTextColor = () => darkMode ? 'text-gray-200' : 'text-gray-800';
  const getBorderColor = () => darkMode ? 'border-gray-700' : 'border-gray-200';
  const getInputBg = () => darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-gray-50 border-gray-300 text-gray-600';
  const getLabelColor = () => darkMode ? 'text-gray-300' : 'text-gray-700';
  const getInfoBoxBg = () => darkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-100';
  const getInfoTextColor = () => darkMode ? 'text-blue-400' : 'text-blue-600';
  const getSuccessBoxBg = () => darkMode ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-100';
  const getSuccessTextColor = () => darkMode ? 'text-green-400' : 'text-green-700';
  const getErrorBoxBg = () => darkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200';
  const getErrorTextColor = () => darkMode ? 'text-red-400' : 'text-red-700';

  useEffect(() => {
    if (!statusOptions?.length) {
      dispatch(fetchStatuses() as any);
    }
  }, [dispatch, statusOptions]);

  const handleClose = () => {
    searchParams.delete("modal");
    searchParams.delete("LeadId");
    setSearchParams(searchParams);
    if (onSuccess) onSuccess();
  };

  // Enhanced function to extract error message from API response
  const extractErrorMessage = (err: any): string => {
    console.log("Full error object:", err);
    
    if (err?.response?.data) {
      const responseData = err.response.data;
      
      if (responseData.errors) {
        if (typeof responseData.errors === 'string') {
          if (responseData.errors.includes("E11000 duplicate key") || 
              responseData.errors.includes("duplicate key error")) {
            const emailMatch = responseData.errors.match(/email: \"([^\"]+)\"/);
            if (emailMatch) {
              return `Customer with email "${emailMatch[1]}" already exists.`;
            }
            return "Customer with this email already exists.";
          }
          return responseData.errors;
        }
        if (typeof responseData.errors === 'object') {
          const errorMessages = Object.values(responseData.errors).join(', ');
          return errorMessages;
        }
      }
      
      if (responseData.message) {
        if (typeof responseData.message === 'string') {
          if (responseData.message.includes("E11000 duplicate key")) {
            const emailMatch = responseData.message.match(/email: \"([^\"]+)\"/);
            if (emailMatch) {
              return `Customer with email "${emailMatch[1]}" already exists.`;
            }
            return "Customer with this email already exists.";
          }
          return responseData.message;
        }
      }
      
      if (responseData.error) {
        if (typeof responseData.error === 'string') {
          return responseData.error;
        }
      }
    }
    
    if (err?.errors) {
      if (typeof err.errors === 'string') {
        if (err.errors.includes("E11000 duplicate key")) {
          const emailMatch = err.errors.match(/email: \"([^\"]+)\"/);
          if (emailMatch) {
            return `Customer with email "${emailMatch[1]}" already exists.`;
          }
          return "Customer with this email already exists.";
        }
        return err.errors;
      }
      if (typeof err.errors === 'object') {
        const errorMessages = Object.values(err.errors).join(', ');
        return errorMessages;
      }
    }
    
    if (err?.message) {
      if (typeof err.message === 'string') {
        if (err.message.includes("E11000 duplicate key")) {
          const emailMatch = err.message.match(/email: \"([^\"]+)\"/);
          if (emailMatch) {
            return `Customer with email "${emailMatch[1]}" already exists.`;
          }
          return "Customer with this email already exists.";
        }
        return err.message;
      }
    }
    
    if (typeof err === 'string') {
      if (err.includes("E11000 duplicate key")) {
        const emailMatch = err.match(/email: \"([^\"]+)\"/);
        if (emailMatch) {
          return `Customer with email "${emailMatch[1]}" already exists.`;
        }
        return "Customer with this email already exists.";
      }
      return err;
    }
    
    return "Conversion failed. Please try again.";
  };

  // Prefilled values for display only
  const values = {
    companyName: selectedData?.manualData?.company || selectedData?.Company || "",
    email: selectedData?.manualData?.email || selectedData?.Email || "",
    phone: selectedData?.manualData?.mobileNo || selectedData?.Phone || "",
    name: selectedData?.manualData?.name || selectedData?.Name || "",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tableId) {
      errorAlert("Lead ID is missing", "OK", "Error");
      return;
    }

    if (!conversionStatus?._id) {
      console.error("Conversion status not found. Available statuses:", leadStatusArray);
      errorAlert(
        "No suitable status found for conversion. Please add 'Won' or 'Converted' status in settings.",
        "OK",
        "Status Missing"
      );
      return;
    }

    setLoading(true);

    try {
      const subdomain = localStorage.getItem("subdomain") || "default";

      const convertData = {
        subdomain: subdomain,
        leadId: tableId,
        status: conversionStatus._id,
      };

      console.log("Converting lead with data:", convertData);

      const convertResult = await dispatch(convertCustomer(convertData)).unwrap();
      
      console.log("Conversion result:", convertResult);
      
      if (convertResult?.data?.message) {
        successAlert(convertResult.data.message, "Done", "Conversion Successful");
      } else if (convertResult?.message) {
        successAlert(convertResult.message, "Done", "Conversion Successful");
      } else {
        successAlert("Lead converted to customer successfully!", "Done", "Conversion Successful");
      }

      setTimeout(() => {
        handleClose();
      }, 1500);

    } catch (err: any) {
      console.error("Conversion error details:", err);
      const errorMessage = extractErrorMessage(err);
      errorAlert(errorMessage, "Try Again", "Conversion Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {(loading || statusLoading) && <RippleLoader />}
      
      <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
        <div className={`w-[450px] rounded-lg shadow-lg ${getModalBg()}`}>
          <div className={`flex justify-between items-center p-4 border-b ${getBorderColor()}`}>
            <h2 className={`text-lg font-semibold ${getModalTextColor()}`}>
              Convert Lead to Customer
            </h2>
            <button
              onClick={handleClose}
              className={`text-2xl leading-none transition-colors ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
              disabled={loading}
            >
              &times;
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div className={`mb-4 p-3 rounded-lg border ${getInfoBoxBg()}`}>
              <p className={`text-xs font-semibold mb-1 ${getInfoTextColor()}`}>
                Converting Lead:
              </p>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {values.name || "Unnamed Lead"}
                <span className={`text-xs ml-2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  (ID: {tableId})
                </span>
              </p>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${getLabelColor()}`}>
                Lead Name *
              </label>
              <input
                value={values.name}
                disabled
                className={`w-full px-3 py-2 border rounded-lg ${getInputBg()}`}
                placeholder="Lead Name"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${getLabelColor()}`}>
                Company Name *
              </label>
              <input
                value={values.companyName}
                disabled
                className={`w-full px-3 py-2 border rounded-lg ${getInputBg()}`}
                placeholder="Company Name"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${getLabelColor()}`}>
                Email *
              </label>
              <input
                value={values.email}
                disabled
                className={`w-full px-3 py-2 border rounded-lg ${getInputBg()}`}
                placeholder="Email"
                type="email"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${getLabelColor()}`}>
                Phone Number *
              </label>
              <input
                value={values.phone}
                disabled
                className={`w-full px-3 py-2 border rounded-lg ${getInputBg()}`}
                placeholder="Phone Number"
                type="tel"
              />
            </div>

            {/* Show conversion status info */}
            {conversionStatus && (
              <div className={`mb-4 p-3 rounded-lg border ${getSuccessBoxBg()}`}>
                <p className={`text-xs font-semibold mb-1 ${getSuccessTextColor()}`}>
                  ✓ Ready to Convert:
                </p>
                <p className={`text-xs ${getSuccessTextColor()}`}>
                  Lead will be marked as "{conversionStatus.statusName || conversionStatus.name}"
                </p>
              </div>
            )}

            {!conversionStatus && leadStatusArray.length > 0 && (
              <div className={`mb-4 p-3 rounded-lg border ${getErrorBoxBg()}`}>
                <p className={`text-xs font-semibold mb-1 ${getErrorTextColor()}`}>
                  ⚠️ Status Issue:
                </p>
                <p className={`text-xs ${getErrorTextColor()}`}>
                  No "Won" or "Converted" status found. Available statuses:{" "}
                  {leadStatusArray.map(s => s.statusName || s.name).join(", ")}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Reusable_Button
                onClick={handleClose}
                disabled={loading}
                text="Cancel"
                variant="secondary"
              />
              <Reusable_Button
                type="submit"
                disabled={loading || !conversionStatus}
                text={loading ? "Converting..." : "Convert to Customer"}
                variant="primary"
              />
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Convert_custommer_Model;