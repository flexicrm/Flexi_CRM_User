import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useSearchParams } from 'react-router-dom';
import { errorAlert, successAlert } from '../../component/Notification/statusHandler';
import { createCustomer } from '../../store/homepage_slice/Leads_slice';

// Helper function to extract error message from API response
const extractErrorMessage = (error: any): string => {
  let errorMessage = "Failed to convert customer. Please try again.";
  
  // Check if error has response data
  if (error?.response?.data) {
    const responseData = error.response.data;
    
    // Check for errors field (string or object)
    if (responseData.errors) {
      if (typeof responseData.errors === 'string') {
        errorMessage = responseData.errors;
      } else if (typeof responseData.errors === 'object') {
        const firstErrorKey = Object.keys(responseData.errors)[0];
        if (firstErrorKey && responseData.errors[firstErrorKey]) {
          errorMessage = responseData.errors[firstErrorKey];
        } else {
          errorMessage = JSON.stringify(responseData.errors);
        }
      }
    }
    // Check for message field
    else if (responseData.message) {
      errorMessage = responseData.message;
    }
    // Check for error field
    else if (responseData.error) {
      errorMessage = responseData.error;
    }
  }
  // Check for direct errors field
  else if (error?.errors) {
    if (typeof error.errors === 'string') {
      errorMessage = error.errors;
    } else if (typeof error.errors === 'object') {
      const firstErrorKey = Object.keys(error.errors)[0];
      if (firstErrorKey && error.errors[firstErrorKey]) {
        errorMessage = error.errors[firstErrorKey];
      } else {
        errorMessage = JSON.stringify(error.errors);
      }
    }
  }
  // Check for message field
  else if (error?.message) {
    errorMessage = error.message;
  }
  // Check for error field
  else if (error?.error) {
    errorMessage = error.error;
  }
  
  return errorMessage;
};

const Convert_custommer_Model = ({ data }: { data?: any[] }) => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  
  const leadId = searchParams.get("LeadId");
  const isOpen = searchParams.get("modal") === "convert-customer";
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentLead, setCurrentLead] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    Companyname: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    if (isOpen && leadId && data && data.length > 0) {
      const foundLead = data.find(lead => lead.LeadId === leadId);
      setCurrentLead(foundLead);
      
      if (foundLead?.manualData) {
        setFormData({
          Companyname: foundLead.manualData.company || '',
          email: foundLead.manualData.email || '',
          phone: foundLead.manualData.mobileNo || ''
        });
      }
    }
  }, [isOpen, leadId, data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const closeModal = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("modal");
    params.delete("LeadId");
    setSearchParams(params, { state: location.state });
    setFormData({
      Companyname: '',
      email: '',
      phone: ''
    });
    setCurrentLead(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        Companyname: formData.Companyname,
        email: formData.email,
        phone: formData.phone
      };

      const res = await dispatch(createCustomer(payload) as any).unwrap();
      const successMsg = res?.message || res?.data?.message || "Customer converted successfully!";
      successAlert(successMsg, "Done");
      closeModal();
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
      errorAlert(errorMessage, "Retry");
      console.error("Customer conversion error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  if (isOpen && leadId && (!data || data.length === 0)) {
    return (
      <AnimatePresence>
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-xl bg-white rounded-lg shadow-2xl z-[101] overflow-hidden"
          >
            <div className="px-8 py-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#0d1954] mx-auto mb-4" />
              <p className="text-gray-600">Loading lead data...</p>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeModal}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-xl bg-white rounded-lg shadow-2xl z-[101] overflow-hidden"
        >
          <div className="px-8 py-8">

            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-[#0d1954]">Convert Customer</h2>
              <button 
                onClick={closeModal} 
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {currentLead && (
              <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-sm text-slate-600 mb-1">
                  <span className="font-semibold">Converting Lead:</span> {currentLead.manualData?.name || 'Unknown'}
                </p>
                <p className="text-sm text-slate-600">
                  <span className="font-semibold">Lead ID:</span> {currentLead.LeadId}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="relative">
                <input
                  type="text"
                  id="Companyname"
                  name="Companyname"
                  value={formData.Companyname}
                  onChange={handleChange}
                  className="block px-4 pb-3.5 pt-4 w-full text-base text-gray-700 bg-transparent rounded-lg border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-[#0d1954] peer"
                  placeholder=" "
                  required
                />
                <label className="absolute text-sm text-gray-400 duration-300 transform -translate-y-4 scale-90 top-2 z-10 origin-[0] bg-white px-2 peer-focus:text-[#0d1954] left-3">
                  Company *
                </label>
              </div>

              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="block px-4 pb-3.5 pt-4 w-full text-base text-gray-700 bg-transparent rounded-lg border border-gray-300 focus:border-[#0d1954] peer"
                  placeholder=" "
                  required
                />
                <label className="absolute text-sm text-gray-400 transform -translate-y-4 scale-90 top-2 bg-white px-2 left-3">
                  Email *
                </label>
              </div>

              <div className="relative">
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="block px-4 pb-3.5 pt-4 w-full text-base text-gray-700 bg-transparent rounded-lg border border-gray-300 focus:border-[#0d1954] peer"
                  placeholder=" "
                  required
                />
                <label className="absolute text-sm text-gray-400 transform -translate-y-4 scale-90 top-2 bg-white px-2 left-3">
                  Mobile No *
                </label>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-[#0d1954] text-white font-semibold rounded-lg hover:bg-[#162a8c] transition-colors disabled:opacity-70 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Converting...
                    </>
                  ) : (
                    "Add to Customer"
                  )}
                </button>
              </div>

            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default Convert_custommer_Model;