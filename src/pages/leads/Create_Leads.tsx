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
import RippleLoader from '../../component/Loader/RippleLoader';
import { errorAlert, successAlert, warningAlert } from '../../component/Notification/statusHandler';
import { createLead, fetchSources, fetchStatuses, fetchUsers, updateLead } from '../../store/homepage_slice/Leads_slice';

// Types
interface ValidationErrors {
    fullName?: string;
    email?: string;
    mobile?: string;
    status?: string;
    assignedTo?: string;
}

// Helper function to extract error message from API response
const extractErrorMessage = (error: any): string => {
    let errorMessage = "Error occurred while saving lead. Please try again.";
    
    // Check if error has response data
    if (error?.response?.data) {
        const responseData = error.response.data;
        
        // Handle message field
        if (responseData.message) {
            errorMessage = responseData.message;
        }
        // Handle errors field (object or string)
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
        errorMessage = "Invalid user selection. Please choose a valid user from the dropdown list.";
    }
    if (errorMessage.includes('duplicate key') || errorMessage.includes('E11000')) {
        errorMessage = "A lead with this information already exists. Please check and try again.";
    }
    if (errorMessage.toLowerCase().includes('validation')) {
        errorMessage = "Please check all required fields and try again.";
    }
    if (errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('connection')) {
        errorMessage = "Network error. Please check your internet connection and try again.";
    }
    
    return errorMessage;
};

// --- Animation Variants ---
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

    const { statusOptions, sourceOptions, userOptions, isCreating, isUpdating, loading } = useSelector((state: any) => state.leads);

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

    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // Fetch dropdown data
        dispatch(fetchStatuses());
        dispatch(fetchSources());
        dispatch(fetchUsers());

        // Populate form for edit mode
        if (editData) {
            console.log("Edit Data Received:", editData);
            
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

    const validateForm = (): boolean => {
        const errors: ValidationErrors = {};
        
        if (!formData.fullName.trim()) {
            errors.fullName = "Full Name is required";
        }
        if (!formData.status) {
            errors.status = "Lead Status is required";
        }
        if (!formData.assignedTo) {
            errors.assignedTo = "Please select a user to assign this lead to";
        }
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = "Please enter a valid email address";
        }
        if (formData.mobile && !/^[0-9+\-\s()]{10,15}$/.test(formData.mobile)) {
            errors.mobile = "Please enter a valid mobile number (10-15 digits)";
        }
        
        setValidationErrors(errors);
        
        if (Object.keys(errors).length > 0) {
            warningAlert("Please fill in all required fields correctly", "Got it");
            return false;
        }
        return true;
    };

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear validation error for this field when user starts typing
        if (validationErrors[name as keyof ValidationErrors]) {
            setValidationErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate form before submission
        if (!validateForm()) {
            return;
        }
        
        setIsSubmitting(true);
        
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
            potentialValue: Number(formData.potentialValue) || 0
        };

        console.log("Final Payload being sent:", finalPayload);

        try {
            if (editData) {
                // Update existing lead
                const result = await dispatch(updateLead({ leadId: editId, formData: finalPayload })).unwrap();
                
                // Extract success message from API response
                const successMsg = result?.message || 
                                 result?.data?.message || 
                                 "Lead updated successfully!";
                
                successAlert(successMsg, "Done", "Success!");
                navigate(-1);
            } else {
                // Create new lead
                const result = await dispatch(createLead(finalPayload)).unwrap();
                
                // Extract success message from API response
                const successMsg = result?.message || 
                                 result?.data?.message || 
                                 "Lead created successfully!";
                
                successAlert(successMsg, "Done", "Success!");
                navigate(-1);
            }
        } catch (error: any) {
            // Extract error message using the improved function
            const errorMessage = extractErrorMessage(error);
            
            // Handle specific error cases with appropriate titles
            if (errorMessage.toLowerCase().includes('duplicate') || errorMessage.toLowerCase().includes('already exists')) {
                errorAlert(errorMessage, "Try Again", "Duplicate Entry");
            } else if (errorMessage.toLowerCase().includes('validation')) {
                errorAlert(errorMessage, "Fix Errors", "Validation Error");
            } else if (errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('connection')) {
                errorAlert("Network error. Please check your internet connection and try again.", "Retry", "Connection Error");
            } else if (errorMessage.toLowerCase().includes('permission') || errorMessage.toLowerCase().includes('unauthorized')) {
                errorAlert("You don't have permission to perform this action.", "Okay", "Access Denied");
            } else {
                errorAlert(errorMessage, "Try Again", "Submission Failed");
            }
            
            console.error("Error details:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const isProcessing = isCreating || isUpdating || isSubmitting;

    // Show loader while fetching dropdown data
    if (loading && !statusOptions?.length && !userOptions?.length) {
        return <RippleLoader />;
    }

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
                            className="p-2.5 bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 hover:text-indigo-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Go Back"
                            disabled={isProcessing}
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
                                <div>
                                    <Reusable_Fields 
                                        label="Full Name" 
                                        name="fullName" 
                                        value={formData.fullName} 
                                        onChange={handleChange} 
                                        icon={<User size={18}/>} 
                                        required 
                                        error={validationErrors.fullName}
                                        disabled={isProcessing}
                                    />
                                </div>
                                <div>
                                    <Reusable_Fields 
                                        label="Email Address" 
                                        name="email" 
                                        type="email" 
                                        value={formData.email} 
                                        onChange={handleChange} 
                                        icon={<Mail size={18}/>} 
                                        error={validationErrors.email}
                                        disabled={isProcessing}
                                        placeholder="example@company.com"
                                    />
                                </div>
                                <div>
                                    <Reusable_Fields 
                                        label="Mobile Number" 
                                        name="mobile" 
                                        value={formData.mobile} 
                                        onChange={handleChange} 
                                        icon={<Phone size={18}/>} 
                                        error={validationErrors.mobile}
                                        disabled={isProcessing}
                                        placeholder="+1 234 567 8900"
                                    />
                                </div>
                                <Reusable_Fields 
                                    label="Company Name" 
                                    name="companyName" 
                                    value={formData.companyName} 
                                    onChange={handleChange} 
                                    icon={<Building2 size={18}/>} 
                                    disabled={isProcessing}
                                />
                                <Reusable_Fields 
                                    label="Job Title" 
                                    name="jobTitle" 
                                    value={formData.jobTitle} 
                                    onChange={handleChange} 
                                    icon={<Briefcase size={18}/>} 
                                    disabled={isProcessing}
                                />
                                <Reusable_Fields 
                                    label="Website" 
                                    name="website" 
                                    value={formData.website} 
                                    onChange={handleChange} 
                                    icon={<Globe size={18}/>} 
                                    disabled={isProcessing}
                                    placeholder="https://example.com"
                                />
                            </div>
                        </section>

                        {/* SECTION 2: LEAD DETAILS */}
                        <section>
                            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-6">
                                <Network className="text-indigo-500" size={20} />
                                <h3 className="text-lg font-semibold text-slate-800 tracking-tight">Pipeline Details</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Reusable_Fields 
                                        type="select" 
                                        label="Lead Status" 
                                        name="status" 
                                        options={statusOptions?.map((s: any) => ({ label: s.statusName, value: s._id }))} 
                                        value={formData.status} 
                                        onChange={handleChange} 
                                        required
                                        error={validationErrors.status}
                                        disabled={isProcessing}
                                    />
                                </div>
                                <Reusable_Fields 
                                    type="select" 
                                    label="Lead Source" 
                                    name="source" 
                                    options={sourceOptions?.map((s: any) => ({ label: s.sourceName, value: s.sourceName }))} 
                                    value={formData.source} 
                                    onChange={handleChange} 
                                    disabled={isProcessing}
                                />
                                <div>
                                    <Reusable_Fields 
                                        type="select" 
                                        label="Assign To User" 
                                        name="assignedTo" 
                                        options={userOptions?.map((u: any) => ({ 
                                            label: `${u.firstname || ''} ${u.lastname || ''}`.trim() || u.name || u.email, 
                                            value: u._id 
                                        }))} 
                                        value={formData.assignedTo} 
                                        onChange={handleChange} 
                                        required
                                        error={validationErrors.assignedTo}
                                        disabled={isProcessing}
                                    />
                                </div>
                                <Reusable_Fields 
                                    label="Potential Value" 
                                    name="potentialValue" 
                                    type="number" 
                                    value={formData.potentialValue} 
                                    onChange={handleChange} 
                                    icon={<Landmark size={18} />} 
                                    disabled={isProcessing}
                                    placeholder="0.00"
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
                                    rows={4}
                                    disabled={isProcessing}
                                    placeholder="Add any relevant information about this lead..."
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

            {/* Global loader overlay for async operations */}
            {(isProcessing || loading) && <RippleLoader />}
        </motion.div>
    );
};

export default Create_Leads;