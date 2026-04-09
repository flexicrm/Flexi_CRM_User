import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Briefcase,
    Building2,
    Check,
    Globe,
    Landmark,
    Loader2,
    Mail,
    Network,
    Phone,
    Plus,
    Save,
    StickyNote,
    Target,
    User,
    Users,
    X
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

import Reusable_Button from '../../component/button/Reusable_Button';
import Reusable_Fields from '../../component/Fields/Reusable_Fiealds';
import RippleLoader from '../../component/Loader/RippleLoader';
import { errorAlert, successAlert, warningAlert } from '../../component/Notification/statusHandler';
import { createLead, fetchSources, fetchStatuses, fetchUsers, updateLead } from '../../store/homepage_slice/Leads_slice';
import { createLeadStatus } from '../../store/settingLeadeStatus';
import { createLeadSource } from '../../store/settingleadSourceSlice';

// Types
interface ValidationErrors {
    fullName?: string;
    email?: string;
    mobile?: string;
    status?: string;
    source?: string;
    assignedTo?: string;
}

// Helper function to extract error message from API response
const extractErrorMessage = (error: any): string => {
    let errorMessage = "Error occurred while saving lead. Please try again.";
    
    if (error?.response?.data) {
        const responseData = error.response.data;
        
        if (responseData.message) {
            errorMessage = responseData.message;
        }
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
        else if (responseData.error) {
            errorMessage = responseData.error;
        }
    }
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
    else if (error?.message) {
        errorMessage = error.message;
    }
    
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
        transition: { staggerChildren: 0.1, delayChildren: 0.05 },
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

// --- Tooltip Component ---
const Tooltip = ({ children, text }: { children: React.ReactNode, text: string }) => (
  <div className="group relative flex flex-col items-center">
    {children}
    <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-50 animate-in fade-in zoom-in-95 duration-200">
      <span className="relative z-10 px-2 py-1 text-[10px] font-semibold text-white whitespace-nowrap bg-slate-800 shadow-md rounded-md">
        {text}
      </span>
      <div className="w-2 h-2 -mt-1 rotate-45 bg-slate-800 rounded-sm"></div>
    </div>
  </div>
);

// Custom Status Select Component with Color and Create Option
const StatusSelect = ({ value, onChange, options, error, disabled, label, onCreateStatus }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newStatusName, setNewStatusName] = useState('');
    const [newStatusColor, setNewStatusColor] = useState('#6366F1');
    const [isCreating, setIsCreating] = useState(false);
    const selectRef = React.useRef<HTMLDivElement>(null);

    const selectedStatus = options?.find((opt: any) => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleCreateStatus = async () => {
        if (!newStatusName.trim()) {
            warningAlert("Please enter a status name", "Got it");
            return;
        }

        setIsCreating(true);
        try {
            const result = await onCreateStatus(newStatusName.trim(), newStatusColor);
            if (result) {
                successAlert("Status created successfully!", "Done", "Success!");
                setShowCreateModal(false);
                setNewStatusName('');
                setNewStatusColor('#6366F1');
                onChange({ target: { name: 'status', value: result._id } });
            }
        } catch (error: any) {
            const errorMessage = extractErrorMessage(error);
            errorAlert(errorMessage, "Try Again", "Creation Failed");
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="w-full" ref={selectRef}>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                {label} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
                <button
                    type="button"
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    className={`w-full px-3 py-2 text-left border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all flex items-center justify-between text-sm ${
                        error ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-white hover:border-slate-300'
                    } ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-50' : 'cursor-pointer'}`}
                    disabled={disabled}
                >
                    <div className="flex items-center gap-2">
                        {selectedStatus?.color && (
                            <div 
                                className="w-2.5 h-2.5 rounded-full" 
                                style={{ backgroundColor: selectedStatus.color }}
                            />
                        )}
                        <span 
                            className="text-sm"
                            style={{ 
                                color: selectedStatus?.color || "#1F2937",
                                fontWeight: selectedStatus ? 500 : 400
                            }}
                        >
                            {selectedStatus?.label || "Select Status"}
                        </span>
                    </div>
                    <svg 
                        className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
                
                {isOpen && !disabled && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {options?.map((option: any) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                    onChange({ target: { name: 'status', value: option.value } });
                                    setIsOpen(false);
                                }}
                                className="w-full px-3 py-2 text-left hover:bg-slate-50 transition-colors flex items-center gap-2"
                            >
                                {option.color && (
                                    <div 
                                        className="w-2.5 h-2.5 rounded-full" 
                                        style={{ backgroundColor: option.color }}
                                    />
                                )}
                                <span 
                                    className="text-sm"
                                    style={{ color: option.color || "#1F2937" }}
                                >
                                    {option.label}
                                </span>
                                {value === option.value && (
                                    <svg className="w-4 h-4 ml-auto text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </button>
                        ))}
                        <button
                            type="button"
                            onClick={() => setShowCreateModal(true)}
                            className="w-full px-3 py-2 text-left hover:bg-indigo-50 transition-colors flex items-center gap-2 border-t border-slate-100 text-indigo-600"
                        >
                            <Plus size={14} />
                            <span className="text-xs font-medium">Create New Status</span>
                        </button>
                    </div>
                )}
            </div>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}

            {/* Create Status Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]" onClick={() => setShowCreateModal(false)}>
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-base font-semibold text-slate-900">Create New Status</h3>
                            <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Status Name</label>
                                <input
                                    type="text"
                                    value={newStatusName}
                                    onChange={(e) => setNewStatusName(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                                    placeholder="e.g., Hot Lead, Cold Lead"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Status Color</label>
                                <div className="flex gap-2 items-center">
                                    <input
                                        type="color"
                                        value={newStatusColor}
                                        onChange={(e) => setNewStatusColor(e.target.value)}
                                        className="w-10 h-9 border border-slate-200 rounded cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={newStatusColor}
                                        onChange={(e) => setNewStatusColor(e.target.value)}
                                        className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                                        placeholder="#6366F1"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2 pt-3">
                                <Reusable_Button
                                    text="Cancel"
                                    variant="outline"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1"
                                    size="px-3 py-1.5 text-xs"
                                />
                                <Reusable_Button
                                    text={isCreating ? "Creating..." : "Create Status"}
                                    icon={isCreating ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                    onClick={handleCreateStatus}
                                    disabled={isCreating}
                                    className="flex-1"
                                    size="px-3 py-1.5 text-xs"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Custom Source Select Component with Create Option
const SourceSelect = ({ value, onChange, options, error, disabled, label, onCreateSource }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newSourceName, setNewSourceName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const selectRef = React.useRef<HTMLDivElement>(null);

    const selectedSource = options?.find((opt: any) => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleCreateSource = async () => {
        if (!newSourceName.trim()) {
            warningAlert("Please enter a source name", "Got it");
            return;
        }

        setIsCreating(true);
        try {
            const result = await onCreateSource(newSourceName.trim());
            if (result) {
                successAlert("Source created successfully!", "Done", "Success!");
                setShowCreateModal(false);
                setNewSourceName('');
                onChange({ target: { name: 'source', value: result.sourceName } });
            }
        } catch (error: any) {
            const errorMessage = extractErrorMessage(error);
            errorAlert(errorMessage, "Try Again", "Creation Failed");
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="w-full" ref={selectRef}>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
            <div className="relative">
                <button
                    type="button"
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    className={`w-full px-3 py-2 text-left border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all flex items-center justify-between text-sm ${
                        error ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-white hover:border-slate-300'
                    } ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-50' : 'cursor-pointer'}`}
                    disabled={disabled}
                >
                    <span className={`text-sm ${!selectedSource ? 'text-slate-400' : 'text-slate-700'}`}>
                        {selectedSource?.label || "Select Source"}
                    </span>
                    <svg 
                        className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
                
                {isOpen && !disabled && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {options?.map((option: any) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                    onChange({ target: { name: 'source', value: option.value } });
                                    setIsOpen(false);
                                }}
                                className="w-full px-3 py-2 text-left hover:bg-slate-50 transition-colors flex items-center justify-between"
                            >
                                <span className="text-sm text-slate-700">{option.label}</span>
                                {value === option.value && (
                                    <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </button>
                        ))}
                        <button
                            type="button"
                            onClick={() => setShowCreateModal(true)}
                            className="w-full px-3 py-2 text-left hover:bg-indigo-50 transition-colors flex items-center gap-2 border-t border-slate-100 text-indigo-600"
                        >
                            <Plus size={14} />
                            <span className="text-xs font-medium">Create New Source</span>
                        </button>
                    </div>
                )}
            </div>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}

            {/* Create Source Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]" onClick={() => setShowCreateModal(false)}>
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-base font-semibold text-slate-900">Create New Source</h3>
                            <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Source Name</label>
                                <input
                                    type="text"
                                    value={newSourceName}
                                    onChange={(e) => setNewSourceName(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                                    placeholder="e.g., Website, Referral, Social Media"
                                />
                            </div>
                            <div className="flex gap-2 pt-3">
                                <Reusable_Button
                                    text="Cancel"
                                    variant="outline"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1"
                                    size="px-3 py-1.5 text-xs"
                                />
                                <Reusable_Button
                                    text={isCreating ? "Creating..." : "Create Source"}
                                    icon={isCreating ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                    onClick={handleCreateSource}
                                    disabled={isCreating}
                                    className="flex-1"
                                    size="px-3 py-1.5 text-xs"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
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
        assignedTo: [] as string[],
        notes: ''
    });

    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedUser, setSelectedUser] = useState('');

    useEffect(() => {
        // Fetch dropdown data
        dispatch(fetchStatuses());
        dispatch(fetchSources());
        dispatch(fetchUsers());

        // Populate form for edit mode
        if (editData) {
            console.log("Edit Data Received:", editData);
            
            const assignedUsers = editData.assignTo?.map((user: any) => user._id) || [];
            
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
                assignedTo: assignedUsers,
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
        if (!formData.source) {
            errors.source = "Lead Source is required";
        }
        if (formData.assignedTo.length === 0) {
            errors.assignedTo = "Please select at least one user to assign this lead to";
        }
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = "Please enter a valid email address";
        }
        if (formData.mobile) {
            const cleanedMobile = formData.mobile.replace(/\D/g, '');
            if (cleanedMobile.length !== 10) {
                errors.mobile = "Mobile number must be exactly 10 digits";
            }
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
        let updatedValue = value;

        if (name === "mobile") {
            updatedValue = value.replace(/\D/g, '');
            if (updatedValue.length > 10) {
                updatedValue = updatedValue.slice(0, 10);
            }
        }

        setFormData(prev => ({ ...prev, [name]: updatedValue }));

        if (validationErrors[name as keyof ValidationErrors]) {
            setValidationErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleAddUser = () => {
        if (!selectedUser) {
            warningAlert("Please select a user to assign", "Okay");
            return;
        }
        
        if (formData.assignedTo.includes(selectedUser)) {
            warningAlert("This user is already assigned to the lead", "Okay");
            return;
        }
        
        setFormData(prev => ({
            ...prev,
            assignedTo: [...prev.assignedTo, selectedUser]
        }));
        
        setSelectedUser('');
        
        if (validationErrors.assignedTo) {
            setValidationErrors(prev => ({ ...prev, assignedTo: '' }));
        }
    };

    const handleRemoveUser = (userId: string) => {
        setFormData(prev => ({
            ...prev,
            assignedTo: prev.assignedTo.filter(id => id !== userId)
        }));
    };

    const getUserById = (userId: string) => {
        return userOptions?.find((user: any) => user._id === userId);
    };

    const handleCreateStatus = async (statusName: string, color: string) => {
        const result = await dispatch(createLeadStatus({ statusName, color })).unwrap();
        await dispatch(fetchStatuses());
        return result;
    };

    const handleCreateSource = async (sourceName: string) => {
        const result = await dispatch(createLeadSource({ sourceName })).unwrap();
        await dispatch(fetchSources());
        return result;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }
        
        setIsSubmitting(true);
        
        const finalPayload = {
            leadsource: formData.source,
            leadstatus: formData.status,
            assignTo: formData.assignedTo,
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
                const result = await dispatch(updateLead({ leadId: editId, formData: finalPayload })).unwrap();
                const successMsg = result?.message || result?.data?.message || "Lead updated successfully!";
                successAlert(successMsg, "Done", "Success!");
                navigate(-1);
            } else {
                const result = await dispatch(createLead(finalPayload)).unwrap();
                const successMsg = result?.message || result?.data?.message || "Lead created successfully!";
                successAlert(successMsg, "Done", "Success!");
                navigate(-1);
            }
        } catch (error: any) {
            const errorMessage = extractErrorMessage(error);
            
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

    const statusOptionsWithColor = statusOptions?.map((status: any) => ({
        label: status.statusName,
        value: status._id,
        color: status.color
    }));

    const sourceOptionsList = sourceOptions?.map((source: any) => ({
        label: source.sourceName,
        value: source.sourceName
    }));

    const userOptionsList = userOptions?.map((user: any) => ({
        label: `${user.firstname || ''} ${user.lastname || ''}`.trim() || user.name || user.email,
        value: user._id
    }));

    if (loading && !statusOptions?.length && !userOptions?.length) {
        return <RippleLoader />;
    }

    const selectedStatusObj = statusOptionsWithColor?.find((s: any) => s.value === formData.status);
    const statusColor = selectedStatusObj?.color || "#6B7280";

    return (
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="min-h-screen bg-[#F8FAFC] py-6 px-4 md:py-8 md:px-6 lg:px-8"
        >
            <div className="w-full max-w-[1200px] mx-auto space-y-6">
                
                {/* --- LAYER 1: HERO HEADER --- */}
                <motion.header variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <Tooltip text="Go Back">
                            <button 
                                onClick={() => navigate(-1)}
                                className="p-2 bg-white border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-50 hover:text-indigo-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isProcessing}
                            >
                                <ArrowLeft size={18} />
                            </button>
                        </Tooltip>
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-100 text-indigo-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-sm">
                            <Target size={20} strokeWidth={2.5} className="md:w-6 md:h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
                                {editData ? "Edit Prospect" : "Add New Prospect"}
                            </h1>
                            <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                                {editData ? "Update the details and pipeline status of this lead." : "Fill out the information below to add a new lead to your pipeline."}
                            </p>
                        </div>
                    </div>
                    
                    {editData && selectedStatusObj && (
                        <div 
                            className="px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm"
                            style={{ 
                                backgroundColor: `${statusColor}15`,
                                color: statusColor,
                                border: `1px solid ${statusColor}30`
                            }}
                        >
                            Current Status: {selectedStatusObj.label}
                        </div>
                    )}
                </motion.header>

                {/* --- LAYER 2: UNIFIED FORM CARD --- */}
                <motion.main variants={itemVariants} className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-5 md:p-6 space-y-6">
                        
                        {/* SECTION 1: CONTACT INFO */}
                        <section>
                            <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-4">
                                <User className="text-indigo-500" size={16} />
                                <h3 className="text-sm font-bold text-slate-800 tracking-tight">Contact Information</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <Reusable_Fields 
                                    label="Full Name" 
                                    name="fullName" 
                                    value={formData.fullName} 
                                    onChange={handleChange} 
                                    icon={<User size={14}/>} 
                                    required 
                                    error={validationErrors.fullName}
                                    disabled={isProcessing}
                                />
                                <Reusable_Fields 
                                    label="Email Address" 
                                    name="email" 
                                    type="email" 
                                    value={formData.email} 
                                    onChange={handleChange} 
                                    icon={<Mail size={14}/>} 
                                    error={validationErrors.email}
                                    disabled={isProcessing}
                                    placeholder="example@company.com"
                                />
                                <Reusable_Fields 
                                    label="Mobile Number" 
                                    name="mobile" 
                                    value={formData.mobile} 
                                    onChange={handleChange} 
                                    icon={<Phone size={14}/>} 
                                    error={validationErrors.mobile}
                                    disabled={isProcessing}
                                    placeholder="98650 11796"
                                />
                                <Reusable_Fields 
                                    label="Company Name" 
                                    name="companyName" 
                                    value={formData.companyName} 
                                    onChange={handleChange} 
                                    icon={<Building2 size={14}/>} 
                                    disabled={isProcessing}
                                />
                                <Reusable_Fields 
                                    label="Job Title" 
                                    name="jobTitle" 
                                    value={formData.jobTitle} 
                                    onChange={handleChange} 
                                    icon={<Briefcase size={14}/>} 
                                    disabled={isProcessing}
                                />
                                <Reusable_Fields 
                                    label="Website" 
                                    name="website" 
                                    value={formData.website} 
                                    onChange={handleChange} 
                                    icon={<Globe size={14}/>} 
                                    disabled={isProcessing}
                                    placeholder="https://example.com"
                                />
                            </div>
                        </section>

                        {/* SECTION 2: LEAD DETAILS */}
                        <section>
                            <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-4">
                                <Network className="text-indigo-500" size={16} />
                                <h3 className="text-sm font-bold text-slate-800 tracking-tight">Pipeline Details</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <StatusSelect 
                                    label="Lead Status" 
                                    name="status" 
                                    options={statusOptionsWithColor} 
                                    value={formData.status} 
                                    onChange={handleChange} 
                                    required
                                    error={validationErrors.status}
                                    disabled={isProcessing}
                                    onCreateStatus={handleCreateStatus}
                                />
                                <SourceSelect 
                                    label="Lead Source" 
                                    name="source" 
                                    options={sourceOptionsList} 
                                    value={formData.source} 
                                    onChange={handleChange} 
                                    error={validationErrors.source}
                                    disabled={isProcessing}
                                    onCreateSource={handleCreateSource}
                                />
                                <Reusable_Fields 
                                    label="Potential Value" 
                                    name="potentialValue" 
                                    type="number" 
                                    value={formData.potentialValue} 
                                    onChange={handleChange} 
                                    icon={<Landmark size={14} />} 
                                    disabled={isProcessing}
                                    placeholder="0.00"
                                />
                            </div>
                        </section>

                        {/* SECTION 3: ASSIGN TO USERS (MULTI-SELECT) */}
                        <section>
                            <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-4">
                                <Users className="text-indigo-500" size={16} />
                                <h3 className="text-sm font-bold text-slate-800 tracking-tight">Assign To Users</h3>
                                {validationErrors.assignedTo && (
                                    <span className="text-xs text-red-500 ml-2">{validationErrors.assignedTo}</span>
                                )}
                            </div>
                            
                            {formData.assignedTo.length > 0 && (
                                <div className="mb-3">
                                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                                        Assigned Users ({formData.assignedTo.length})
                                    </label>
                                    <div className="flex flex-wrap gap-1.5">
                                        {formData.assignedTo.map((userId) => {
                                            const user = getUserById(userId);
                                            const userName = user ? `${user.firstname || ''} ${user.lastname || ''}`.trim() || user.name || user.email : userId;
                                            return (
                                                <div
                                                    key={userId}
                                                    className="inline-flex items-center gap-1.5 px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs font-medium"
                                                >
                                                    <span>{userName}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveUser(userId)}
                                                        className="hover:text-red-600 transition-colors"
                                                        disabled={isProcessing}
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                            
                            <div className="flex gap-2 items-end">
                                <div className="flex-1">
                                    <Reusable_Fields 
                                        type="select" 
                                        label="Select User to Assign" 
                                        name="selectedUser"
                                        options={userOptionsList?.filter((user: any) => !formData.assignedTo.includes(user.value))}
                                        value={selectedUser}
                                        onChange={(e: any) => setSelectedUser(e.target.value)}
                                        disabled={isProcessing}
                                        placeholder="Choose a user..."
                                    />
                                </div>
                                <Tooltip text="Add selected user">
                                    <button
                                        type="button"
                                        onClick={handleAddUser}
                                        disabled={isProcessing || !selectedUser}
                                        className="mb-0.5 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 text-sm"
                                    >
                                        <Plus size={14} />
                                        Add
                                    </button>
                                </Tooltip>
                            </div>
                            
                            {formData.assignedTo.length === 0 && (
                                <p className="text-xs text-amber-600 mt-2">
                                    ⚠️ Please assign at least one user to this lead
                                </p>
                            )}
                        </section>

                        {/* SECTION 4: NOTES */}
                        <section>
                            <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-4">
                                <StickyNote className="text-indigo-500" size={16} />
                                <h3 className="text-sm font-bold text-slate-800 tracking-tight">Additional Notes</h3>
                            </div>
                            <Reusable_Fields 
                                type="textarea" 
                                name="notes" 
                                label="Background info, requirements, or follow-up details..." 
                                value={formData.notes} 
                                onChange={handleChange} 
                                rows={3}
                                disabled={isProcessing}
                                placeholder="Add any relevant information about this lead..."
                            />
                        </section>

                        {/* FORM FOOTER */}
                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                            <Reusable_Button
                                text="Cancel"
                                type="button"
                                variant="ghost"
                                onClick={() => navigate(-1)}
                                size="px-4 py-2 text-sm font-medium"
                                disabled={isProcessing}
                            />
                            <Reusable_Button
                                text={isProcessing ? "Processing..." : editData ? "Update Lead" : "Create Lead"}
                                type="submit"
                                variant="primary"
                                icon={isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                size="px-5 py-2 text-sm font-semibold shadow-md shadow-indigo-200/50 rounded-lg"
                                disabled={isProcessing}
                            />
                        </div>

                    </form>
                </motion.main>
            </div>

            {(isProcessing || loading) && <RippleLoader />}
        </motion.div>
    );
};

export default Create_Leads;