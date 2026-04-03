import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Briefcase,
    Building2,
    Globe,
    Landmark,
    Loader2,
    Mail,
    Network,
    Phone,
    Save,
    StickyNote,
    Target,
    User
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

import Reusable_Button from '../../component/button/Reusable_Button';
import Reusable_Fields from '../../component/Fields/Reusable_Fiealds';
import { errorAlert, successAlert } from '../../component/Notification/statusHandler';
import { createLead, fetchSources, fetchStatuses, fetchUsers, updateLead } from '../../store/homepage_slice/Leads_slice';

// Helper function to extract error message from API response
const extractErrorMessage = (error: any): string => {
  let errorMessage = "Error occurred while saving user. Please try again.";
  
  if (error?.response?.data) {
    const responseData = error.response.data;
    if (responseData.errors) {
      if (typeof responseData.errors === 'string') errorMessage = responseData.errors;
      else if (typeof responseData.errors === 'object') {
        const firstErrorKey = Object.keys(responseData.errors)[0];
        errorMessage = firstErrorKey && responseData.errors[firstErrorKey] ? responseData.errors[firstErrorKey] : JSON.stringify(responseData.errors);
      }
    }
    else if (responseData.message) errorMessage = responseData.message;
    else if (responseData.error) errorMessage = responseData.error;
  }
  else if (error?.errors) {
    if (typeof error.errors === 'string') errorMessage = error.errors;
    else if (typeof error.errors === 'object') {
      const firstErrorKey = Object.keys(error.errors)[0];
      errorMessage = firstErrorKey && error.errors[firstErrorKey] ? error.errors[firstErrorKey] : JSON.stringify(error.errors);
    }
  }
  else if (error?.message) errorMessage = error.message;
  
  return errorMessage;
};

// --- Animation Variants (FIXED) ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { y: 15, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 350, damping: 25 },
  },
};

const Create_Leads = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch<any>();
    
    const editData = location.state?.tableData;
    const editId = location.state?.tableId;

    const { statusOptions, sourceOptions, userOptions, isCreating, isUpdating } = useSelector((state: any) => state.leads);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        mobile: '',
        jobTitle: '',
        website: '',
        companyName: '',
        status: '', 
        source: '', 
        potentialValue: 0,
        assignedTo: '', 
        notes: ''
    });

    useEffect(() => {
        dispatch(fetchStatuses());
        dispatch(fetchSources());
        dispatch(fetchUsers());

        if (editData) {
            setFormData({
                fullName: editData.manualData?.name || '',
                email: editData.manualData?.email || '',
                mobile: editData.manualData?.mobileNo || '',
                jobTitle: editData.manualData?.jobTitle || '',
                website: editData.manualData?.website || '',
                companyName: editData.manualData?.company || '',
                status: editData.leadstatus?._id || '',
                source: editData.leadsource || '',
                potentialValue: editData.potentialValue || 0,
                assignedTo: editData.assignTo?.[0]?._id || '',
                notes: editData.notes || ''
            });
        }
    }, [dispatch, editData]);

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic Validation
        if (!formData.fullName.trim()) return errorAlert("Full Name is required.", "Okay");
        if (!formData.status) return errorAlert("Please select a Lead Status.", "Okay");
        
        // Additional validation for assignedTo
        if (!formData.assignedTo) {
            return errorAlert("Please select a user to assign this lead to.", "Okay");
        }
        
        const finalPayload = {
            leadsource: formData.source,
            leadstatus: formData.status,
            assignTo: [formData.assignedTo],
            manualData: {
                name: formData.fullName,
                email: formData.email,
                mobileNo: formData.mobile,
                company: formData.companyName,
                jobTitle: formData.jobTitle,
                website: formData.website
            },
            notes: formData.notes,
            potentialValue: Number(formData.potentialValue)
        };

        try {
            if (editData) {
                const result = await dispatch(updateLead({ leadId: editId, formData: finalPayload })).unwrap();
                const successMsg = result?.message || result?.data?.message || "Lead updated successfully!";
                successAlert(successMsg, "Done");
                navigate(-1);
            } else {
                const result = await dispatch(createLead(finalPayload)).unwrap();
                const successMsg = result?.message || result?.data?.message || "Lead created successfully!";
                successAlert(successMsg, "Done");
                navigate(-1);
            }
        } catch (error: any) {
            // Extract error message using the improved function
            let errorMessage = extractErrorMessage(error);
            
            // Additional fallback for the specific error format you showed
            if (error && typeof error === 'object') {
                // Check for the exact format: { success: false, errors: "...", statusCode: 500 }
                if (error.success === false && error.errors) {
                    errorMessage = error.errors;
                    // Clean up the message
                    if (errorMessage.includes('Cast to [ObjectId] failed')) {
                        errorMessage = "Invalid user selection. Please choose a valid user from the dropdown list.";
                    }
                }
            }
            
            errorAlert(errorMessage, "Retry");
            console.error("Error details:", error);
        }
    };

    const isProcessing = isCreating || isUpdating;

    return (
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="min-h-screen bg-[#F8FAFC] py-8 px-6 lg:px-10"
        >
            <div className="max-w-[1200px] mx-auto space-y-8">
                
                {/* --- LAYER 1: HERO HEADER --- */}
                <motion.header variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => navigate(-1)}
                            className="p-2.5 bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 hover:text-indigo-600 transition-colors shadow-sm"
                            title="Go Back"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
                            <Target size={24} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
                                {editData ? "Edit Prospect" : "Add New Prospect"}
                            </h1>
                            <p className="text-sm text-slate-500 mt-1">
                                {editData ? "Update the details and pipeline status of this lead." : "Fill out the information below to add a new lead to your pipeline."}
                            </p>
                        </div>
                    </div>
                </motion.header>

                {/* --- LAYER 2: UNIFIED FORM CARD --- */}
                <motion.main variants={itemVariants} className="bg-white rounded-3xl shadow-[0px_4px_24px_rgba(0,0,0,0.02)] border border-slate-200/60 overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-12">
                        
                        {/* SECTION 1: CONTACT INFO */}
                        <section>
                            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-6">
                                <User className="text-indigo-500" size={20} />
                                <h3 className="text-lg font-semibold text-slate-800 tracking-tight">Contact Information</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <Reusable_Fields label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} icon={<User size={18}/>} required />
                                <Reusable_Fields label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} icon={<Mail size={18}/>} />
                                <Reusable_Fields label="Mobile Number" name="mobile" value={formData.mobile} onChange={handleChange} icon={<Phone size={18}/>} />
                                <Reusable_Fields label="Company Name" name="companyName" value={formData.companyName} onChange={handleChange} icon={<Building2 size={18}/>} />
                                <Reusable_Fields label="Job Title" name="jobTitle" value={formData.jobTitle} onChange={handleChange} icon={<Briefcase size={18}/>} />
                                <Reusable_Fields label="Website" name="website" value={formData.website} onChange={handleChange} icon={<Globe size={18}/>} />
                            </div>
                        </section>

                        {/* SECTION 2: LEAD DETAILS */}
                        <section>
                            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-6">
                                <Network className="text-indigo-500" size={20} />
                                <h3 className="text-lg font-semibold text-slate-800 tracking-tight">Pipeline Details</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Reusable_Fields 
                                    type="select" 
                                    label="Lead Status" 
                                    name="status" 
                                    options={statusOptions?.map((s:any)=>({label: s.statusName, value: s._id}))} 
                                    value={formData.status} 
                                    onChange={handleChange} 
                                    required
                                />
                                <Reusable_Fields 
                                    type="select" 
                                    label="Lead Source" 
                                    name="source" 
                                    options={sourceOptions?.map((s:any)=>({label: s.sourceName, value: s.sourceName}))} 
                                    value={formData.source} 
                                    onChange={handleChange} 
                                />
                                <Reusable_Fields 
                                    type="select" 
                                    label="Assign To User" 
                                    name="assignedTo" 
                                    options={userOptions?.map((u:any)=>({label: u.firstname, value: u._id}))} 
                                    value={formData.assignedTo} 
                                    onChange={handleChange} 
                                    required
                                />
                                <Reusable_Fields 
                                    label="Potential Value" 
                                    name="potentialValue" 
                                    type="number" 
                                    value={formData.potentialValue} 
                                    onChange={handleChange} 
                                    icon={<Landmark size={18} />} 
                                />
                            </div>
                        </section>

                        {/* SECTION 3: NOTES */}
                        <section>
                            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-6">
                                <StickyNote className="text-indigo-500" size={20} />
                                <h3 className="text-lg font-semibold text-slate-800 tracking-tight">Additional Notes</h3>
                            </div>
                            <div>
                                <Reusable_Fields 
                                    type="textarea" 
                                    name="notes" 
                                    label="Background info, requirements, or follow-up details..." 
                                    value={formData.notes} 
                                    onChange={handleChange} 
                                />
                            </div>
                        </section>

                        {/* FORM FOOTER */}
                        <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
                            <Reusable_Button
                                text="Cancel"
                                type="button"
                                variant="ghost"
                                onClick={() => navigate(-1)}
                                size="px-5 py-2.5 font-medium"
                                disabled={isProcessing}
                            />
                            <Reusable_Button
                                text={isProcessing ? "Processing..." : editData ? "Update Lead" : "Create Lead"}
                                type="submit"
                                variant="primary"
                                icon={isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                size="px-6 py-2.5 font-semibold shadow-lg shadow-indigo-200/50 rounded-xl"
                                disabled={isProcessing}
                            />
                        </div>

                    </form>
                </motion.main>
            </div>
        </motion.div>
    );
};

export default Create_Leads;