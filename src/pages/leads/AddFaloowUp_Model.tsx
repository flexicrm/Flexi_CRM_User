import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, Sparkles, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import Reusable_Button from '../../component/button/Reusable_Button';
import Reusable_Fields from '../../component/Fields/Reusable_Fiealds';
import RippleLoader from '../../component/Loader/RippleLoader';
import { errorAlert, successAlert, warningAlert } from '../../component/Notification/statusHandler';
import {
  addFollowUp_Assignto,
  addFollowUp_Leadstatus,
  addFollowUp_status,
  addFollowUp_type,
  createFollowUp
} from '../../store/homepage_slice/Leads_slice';

// Helper function to extract error message from API response
const extractErrorMessage = (error: any): string => {
  let errorMessage = "Error occurred while creating follow-up. Please try again.";
  
  if (error?.response?.data) {
    const responseData = error.response.data;
    
    // Handle message field
    if (responseData.message) {
      errorMessage = responseData.message;
    }
    // Handle errors field
    else if (responseData.errors) {
      if (typeof responseData.errors === 'string') {
        errorMessage = responseData.errors;
      } else if (typeof responseData.errors === 'object') {
        const firstErrorKey = Object.keys(responseData.errors)[0];
        if (firstErrorKey && responseData.errors[firstErrorKey]) {
          errorMessage = Array.isArray(responseData.errors[firstErrorKey]) 
            ? responseData.errors[firstErrorKey][0] 
            : responseData.errors[firstErrorKey];
        } else {
          errorMessage = JSON.stringify(responseData.errors);
        }
      }
    }
    // Handle error field
    else if (responseData.error) {
      errorMessage = responseData.error;
    }
  }
  // Handle error object directly
  else if (error?.errors) {
    if (typeof error.errors === 'string') {
      errorMessage = error.errors;
    } else if (typeof error.errors === 'object') {
      const firstErrorKey = Object.keys(error.errors)[0];
      if (firstErrorKey && error.errors[firstErrorKey]) {
        errorMessage = Array.isArray(error.errors[firstErrorKey]) 
          ? error.errors[firstErrorKey][0] 
          : error.errors[firstErrorKey];
      }
    }
  }
  // Handle simple message
  else if (error?.message) {
    errorMessage = error.message;
  }
  
  // Clean up specific error messages
  if (errorMessage.includes('Cast to [ObjectId] failed')) {
    errorMessage = "Invalid selection. Please choose a valid option from the dropdown list.";
  }
  if (errorMessage.includes('required')) {
    errorMessage = "Please fill in all required fields.";
  }
  if (errorMessage.includes('duplicate') || errorMessage.includes('already exists')) {
    errorMessage = "A follow-up with these details already exists.";
  }
  
  return errorMessage;
};

// Validation function
const validateForm = (formData: any): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  if (!formData.leadStatus) {
    errors.leadStatus = "Lead status is required";
  }
  if (!formData.type) {
    errors.type = "Interaction type is required";
  }
  if (!formData.status) {
    errors.status = "Follow-up status is required";
  }
  if (!formData.assignTo) {
    errors.assignTo = "Please select a team member to assign this follow-up";
  }
  if (formData.dueDate && new Date(formData.dueDate) < new Date()) {
    errors.dueDate = "Due date cannot be in the past";
  }
  
  return errors;
};

const AddFollowUp_Model = ({ tableId }: { tableId: string | null; selectedData: any }) => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const isOpen = searchParams.get("modal") === "schedule-followup";

  const {
    followUpStatuses,
    followUpTypes,
    followUpLeadStatuses,
    assignToUsers,
    isSubmittingFollowUp
  } = useSelector((state: any) => state.leads);

  const [formData, setFormData] = useState({
    leadStatus: '',
    type: '',
    priority: 'medium',
    status: '',
    assignTo: '',
    notes: '',
    dueDate: '',
    setReminder: false
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && tableId) {
      setIsLoading(true);
      // Fetch all required dropdown data
      Promise.all([
        dispatch(addFollowUp_status() as any),
        dispatch(addFollowUp_Assignto() as any),
        dispatch(addFollowUp_Leadstatus() as any),
        dispatch(addFollowUp_type() as any)
      ]).finally(() => {
        setIsLoading(false);
      });
    }
    
    // Reset form when modal closes
    return () => {
      if (!isOpen) {
        resetForm();
      }
    };
  }, [isOpen, dispatch, tableId]);

  const resetForm = () => {
    setFormData({ 
      leadStatus: '', 
      type: '', 
      priority: 'medium', 
      status: '', 
      assignTo: '', 
      notes: '', 
      dueDate: '', 
      setReminder: false 
    });
    setValidationErrors({});
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear validation error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const closeModal = () => {
    if (isSubmittingFollowUp) {
      warningAlert("Please wait, follow-up is being created...", "Okay");
      return;
    }
    
    const params = new URLSearchParams(searchParams);
    params.delete("modal");
    setSearchParams(params, { state: { activeId: tableId } });
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      warningAlert("Please fill in all required fields correctly", "Got it");
      return;
    }
    
    if (!tableId) {
      errorAlert("Lead ID missing! Please refresh the page and try again.", "Retry");
      return;
    }

    const payload = {
      followUps: [
        {
          leadStatus: formData.leadStatus,
          type: formData.type,
          notes: formData.notes,
          assignTo: formData.assignTo,
          isSetTimer: formData.setReminder,
          priority: formData.priority,
          status: formData.status,
          ...(formData.dueDate && { dueDate: formData.dueDate })
        }
      ]
    };

    try {
      const resultAction = await dispatch(createFollowUp({ tableId: tableId, data: payload }) as any).unwrap();
      
      // Extract success message from API response
      const successMsg = resultAction?.message || 
                        resultAction?.data?.message || 
                        "Follow-up created successfully!";
      
      successAlert(successMsg, "Done", "Success!");
      closeModal();
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
      
      // Categorize error messages for better UX
      if (errorMessage.toLowerCase().includes('required')) {
        errorAlert(errorMessage, "Fill Required Fields", "Missing Information");
      } else if (errorMessage.toLowerCase().includes('duplicate')) {
        errorAlert(errorMessage, "Try Different Values", "Duplicate Entry");
      } else if (errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('connection')) {
        errorAlert("Network error. Please check your connection and try again.", "Retry", "Connection Error");
      } else {
        errorAlert(errorMessage, "Try Again", "Submission Failed");
      }
      
      console.error("Follow-up creation error:", error);
    }
  };

  const fieldStyles = "text-slate-900 bg-white border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 w-full";
  const errorFieldStyles = "border-red-500 focus:border-red-500 focus:ring-red-500";

  if (!isOpen) return null;

  // Show loader while fetching dropdown data
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center">
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
        <div className="relative z-[101]">
          <RippleLoader />
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        select option { background-color: white !important; color: #0f172a !important; }
        input, select, textarea { color: #0f172a !important; background-color: white !important; }
        input:disabled, select:disabled, textarea:disabled, button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>

      <AnimatePresence>
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-3xl bg-white rounded-[40px] shadow-2xl overflow-hidden z-[101] max-h-[90vh] overflow-y-auto"
          >
            <div className="p-8 md:p-12">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h2 className="text-2xl font-black text-[#0d1954] tracking-tight">Add New Follow-Up</h2>
                  <p className="text-sm text-slate-500 mt-1">Schedule and manage follow-up activities for this lead</p>
                </div>
                <button 
                  onClick={closeModal} 
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmittingFollowUp}
                >
                  <X size={24} />
                </button>
              </div>

              <form className="space-y-8" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <Reusable_Fields
                      type="select"
                      label="Lead Status"
                      name="leadStatus"
                      value={formData.leadStatus}
                      onChange={handleChange}
                      className={`${fieldStyles} ${validationErrors.leadStatus ? errorFieldStyles : ''}`}
                      options={followUpLeadStatuses?.map((item: any) => ({
                        label: item.statusName || item.StatusName,
                        value: item._id
                      })) || []}
                      required
                      error={validationErrors.leadStatus}
                    />
                  </div>
                  <div>
                    <Reusable_Fields
                      type="select"
                      label="Interaction Type"
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className={`${fieldStyles} ${validationErrors.type ? errorFieldStyles : ''}`}
                      options={followUpTypes?.map((item: any) => ({
                        label: item.TypeName || item.name, 
                        value: item._id
                      })) || []}
                      required
                      error={validationErrors.type}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <Reusable_Fields
                      type="select"
                      label="Priority"
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      className={fieldStyles}
                      options={[
                        { label: "High", value: "high" },
                        { label: "Medium", value: "medium" },
                        { label: "Low", value: "low" }
                      ]}
                    />
                  </div>
                  <div>
                    <Reusable_Fields
                      type="select"
                      label="Follow-up Status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className={`${fieldStyles} ${validationErrors.status ? errorFieldStyles : ''}`}
                      options={followUpStatuses?.map((item: any) => ({
                        label: item.StatusName,
                        value: item._id
                      })) || []}
                      required
                      error={validationErrors.status}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <Reusable_Fields
                      type="select"
                      label="Assign To"
                      name="assignTo"
                      value={formData.assignTo}
                      onChange={handleChange}
                      className={`${fieldStyles} ${validationErrors.assignTo ? errorFieldStyles : ''}`}
                      placeholder="Select team member"
                      options={assignToUsers?.map((user: any) => ({
                        label: `${user.firstname || ''} ${user.lastname || ''}`.trim() || user.name || user.email,
                        value: user._id
                      })) || []}
                      required
                      error={validationErrors.assignTo}
                    />
                  </div>
                  <div>
                    <Reusable_Fields
                      type="date"
                      label="Due Date"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleChange}
                      className={`${fieldStyles} ${validationErrors.dueDate ? errorFieldStyles : ''}`}
                      error={validationErrors.dueDate}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 px-1">
                  <input 
                    type="checkbox" 
                    id="reminder" 
                    name="setReminder"
                    checked={formData.setReminder}
                    onChange={(e) => setFormData(prev => ({...prev, setReminder: e.target.checked}))}
                    className="w-5 h-5 rounded border-slate-300 text-[#0d1954] focus:ring-[#0d1954] disabled:opacity-50"
                    disabled={isSubmittingFollowUp}
                  />
                  <label htmlFor="reminder" className="text-sm font-bold text-slate-700 cursor-pointer select-none">
                    Set reminder notification
                  </label>
                </div>

                <div className="relative">
                  <div className="absolute top-4 left-5 flex items-center gap-2 z-20 pointer-events-none">
                    <Sparkles size={14} className="text-indigo-500" />
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Explore AI solution</span>
                  </div>
                  
                  <Reusable_Fields
                    type="textarea"
                    label="Notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    className={`${fieldStyles} pt-6`}
                    placeholder="Use 5 or more words to describe it, then let AI do the rest."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end items-center gap-6 pt-4 border-t border-slate-100">
                  <button 
                    type="button" 
                    onClick={closeModal} 
                    className="text-slate-500 hover:text-slate-800 font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmittingFollowUp}
                  >
                    Cancel
                  </button>
                  <Reusable_Button 
                    text={isSubmittingFollowUp ? "Creating Follow-Up..." : "Create Follow-Up"}
                    variant="primary"
                    disabled={isSubmittingFollowUp}
                    className="rounded-2xl px-8 py-4 bg-[#0d1954] text-white hover:bg-[#162a8c] transition-all flex items-center justify-center min-w-[180px] disabled:opacity-60 disabled:cursor-not-allowed"
                    onClick={handleSubmit}
                    icon={isSubmittingFollowUp ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
                  />
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    </>
  );
};

export default AddFollowUp_Model;