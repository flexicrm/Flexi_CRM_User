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

  // Debug: Log available statuses
  useEffect(() => {
    if (leadStatusArray.length > 0) {
      console.log("Available statuses:", leadStatusArray.map(s => s.statusName || s.name));
      console.log("Conversion status found:", conversionStatus);
    }
  }, [leadStatusArray, conversionStatus]);

  // Prefilled values for display only
  const values = {
    companyName: selectedData?.manualData?.company || selectedData?.Company || "",
    email: selectedData?.manualData?.email || selectedData?.Email || "",
    phone: selectedData?.manualData?.mobileNo || selectedData?.Phone || "",
    name: selectedData?.manualData?.name || selectedData?.Name || "",
  };

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

  // ✅ Enhanced function to extract error message from API response
  const extractErrorMessage = (err: any): string => {
    console.log("Full error object:", err);
    
    // Check for response.data (axios error response)
    if (err?.response?.data) {
      const responseData = err.response.data;
      
      // Handle your API response structure: { success: false, errors: "...", statusCode: 500 }
      if (responseData.errors) {
        if (typeof responseData.errors === 'string') {
          // Check for duplicate key error
          if (responseData.errors.includes("E11000 duplicate key") || 
              responseData.errors.includes("duplicate key error")) {
            // Extract email from error message
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
    
    // Check for errors field directly
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
    
    // Check for message field
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
    
    // Check for string error
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
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

      // Call convertCustomer API
      const convertData = {
        subdomain: subdomain,
        leadId: tableId,
        status: conversionStatus._id,
      };

      console.log("Converting lead with data:", convertData);

      const convertResult = await dispatch(convertCustomer(convertData)).unwrap();
      
      console.log("Conversion result:", convertResult);
      
      // Success message
      if (convertResult?.data?.message) {
        successAlert(convertResult.data.message, "Done", "Conversion Successful");
      } else if (convertResult?.message) {
        successAlert(convertResult.message, "Done", "Conversion Successful");
      } else {
        successAlert("Lead converted to customer successfully!", "Done", "Conversion Successful");
      }

      // Close modal after successful conversion
      setTimeout(() => {
        handleClose();
      }, 1500);

    } catch (err: any) {
      console.error("Conversion error details:", err);
      const errorMessage = extractErrorMessage(err);
      // Show the extracted error message in the alert
      errorAlert(errorMessage, "Try Again", "Conversion Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {(loading || statusLoading) && <RippleLoader />}
      
      <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
        <div className="bg-white w-[450px] rounded-lg shadow-lg">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-800">
              Convert Lead to Customer
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              disabled={loading}
            >
              &times;
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-xs text-blue-600 font-semibold mb-1">
                Converting Lead:
              </p>
              <p className="text-sm text-gray-700 font-medium">
                {values.name || "Unnamed Lead"}
                <span className="text-gray-500 text-xs ml-2">
                  (ID: {tableId})
                </span>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lead Name *
              </label>
              <input
                value={values.name}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                placeholder="Lead Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name *
              </label>
              <input
                value={values.companyName}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                placeholder="Company Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                value={values.email}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                placeholder="Email"
                type="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                value={values.phone}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                placeholder="Phone Number"
                type="tel"
              />
            </div>

            {/* Show conversion status info */}
            {conversionStatus && (
              <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-100">
                <p className="text-xs text-green-700 font-semibold mb-1">
                  ✓ Ready to Convert:
                </p>
                <p className="text-xs text-green-600">
                  Lead will be marked as "{conversionStatus.statusName || conversionStatus.name}"
                </p>
              </div>
            )}

            {!conversionStatus && leadStatusArray.length > 0 && (
              <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="text-xs text-red-700 font-semibold mb-1">
                  ⚠️ Status Issue:
                </p>
                <p className="text-xs text-red-600">
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