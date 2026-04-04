"use client";
import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Blocks,
  CheckCircle2,
  Code2,
  Copy,
  Eye,
  GripVertical,
  Loader2,
  MousePointerClick,
  RefreshCw,
  TerminalSquare,
  X
} from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Reusable_Button from "../../component/button/Reusable_Button";
import RippleLoader from "../../component/Loader/RippleLoader";
import {
  confirmAlert,
  errorAlert,
  successAlert,
  warningAlert
} from "../../component/Notification/statusHandler";
import {
  clearIntegrationError,
  clearIntegrationMessage,
  createIntegration,
} from "../../store/integrationSlice";
import type { AppDispatch } from "../../store/Store";

interface FieldItem {
  id: string;
  name: string;
  label: string;
  type: string;
}

interface ValidationErrors {
  formName?: string;
  fields?: string;
}

// Helper function to extract error message from API response
const extractErrorMessage = (error: any): string => {
  let errorMessage = "Error occurred while generating integration code. Please try again.";
  
  if (error?.response?.data) {
    const responseData = error.response.data;
    
    if (responseData.message) {
      errorMessage = responseData.message;
    } else if (responseData.errors) {
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
    } else if (responseData.error) {
      errorMessage = responseData.error;
    }
  } else if (error?.errors) {
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
  } else if (error?.message) {
    errorMessage = error.message;
  }
  
  // Clean up specific error messages
  if (errorMessage.toLowerCase().includes('duplicate') || errorMessage.toLowerCase().includes('already exists')) {
    errorMessage = "A form with this name already exists. Please use a different name.";
  }
  if (errorMessage.toLowerCase().includes('validation')) {
    errorMessage = "Please check all required fields and try again.";
  }
  if (errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('connection')) {
    errorMessage = "Network error. Please check your internet connection and try again.";
  }
  if (errorMessage.toLowerCase().includes('permission') || errorMessage.toLowerCase().includes('unauthorized')) {
    errorMessage = "You don't have permission to perform this action.";
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

// --- Tooltip Component ---
const Tooltip = ({ children, text }: { children: React.ReactNode, text: string }) => (
  <div className="group relative flex flex-col items-center">
    {children}
    <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-50 animate-in fade-in zoom-in-95 duration-200">
      <span className="relative z-10 px-2.5 py-1.5 text-[11px] font-semibold text-white whitespace-nowrap bg-slate-800 shadow-xl rounded-md">
        {text}
      </span>
      <div className="w-2.5 h-2.5 -mt-1.5 rotate-45 bg-slate-800 rounded-sm"></div>
    </div>
  </div>
);

// --- Preview Modal Component ---
interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: {
    formName: string;
    fields: FieldItem[];
    platform: string;
    integrationType: string;
  };
  generatedCode: string;
}

const PreviewModal = ({ isOpen, onClose, formData, generatedCode }: PreviewModalProps) => {
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyCode = () => {
    if (!generatedCode) {
      warningAlert("No code generated yet", "Generate First");
      return;
    }
    navigator.clipboard.writeText(generatedCode);
    setIsCopied(true);
    successAlert("Code copied to clipboard!", "Great");
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (!isOpen) return null;

  const renderFormPreview = () => {
    return (
      <div className="space-y-4">
        <div className="border-b border-slate-200 pb-3">
          <h3 className="text-lg font-semibold text-slate-900">{formData.formName}</h3>
          <p className="text-xs text-slate-500 mt-1">
            Platform: {formData.platform} | Framework: {formData.integrationType}
          </p>
        </div>
        
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          {formData.fields.map((field) => (
            <div key={field.id} className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">
                {field.label}
                {field.type === "email" && <span className="text-red-500 ml-1">*</span>}
              </label>
              
              {field.type === "textarea" ? (
                <textarea
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  rows={3}
                />
              ) : field.type === "tel" ? (
                <input
                  type="tel"
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              ) : field.type === "email" ? (
                <input
                  type="email"
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              ) : (
                <input
                  type="text"
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              )}
            </div>
          ))}
          
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Submit
          </button>
        </form>
      </div>
    );
  };

  const generatePreviewCode = () => {
    if (formData.integrationType === "React") {
      return `import React, { useState } from 'react';

const ${formData.formName.replace(/\s/g, '')}Form = () => {
  const [formData, setFormData] = useState({
    ${formData.fields.map(f => `${f.name}: ""`).join(",\n    ")}
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('YOUR_API_ENDPOINT', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      console.log("Form submitted:", data);
      alert('Form submitted successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert('Submission failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      ${formData.fields.map(f => `
      <div>
        <label className="block text-sm font-medium text-gray-700">
          ${f.label}
        </label>
        ${f.type === "textarea" ? 
          `<textarea
            name="${f.name}"
            value={formData.${f.name}}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            rows={3}
          />` :
          `<input
            type="${f.type}"
            name="${f.name}"
            value={formData.${f.name}}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />`
        }
      </div>
      `).join("")}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
};

export default ${formData.formName.replace(/\s/g, '')}Form;`;
    } else {
      return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${formData.formName}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; padding: 20px; }
        .form-container { max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h2 { margin-bottom: 20px; color: #333; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; font-weight: 500; color: #555; }
        input, textarea { width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; }
        input:focus, textarea:focus { outline: none; border-color: #6366f1; }
        button { width: 100%; padding: 10px; background: #6366f1; color: white; border: none; border-radius: 6px; font-size: 16px; font-weight: 600; cursor: pointer; }
        button:hover { background: #4f46e5; }
        button:disabled { opacity: 0.5; cursor: not-allowed; }
        .loader { display: inline-block; width: 20px; height: 20px; border: 2px solid #fff; border-radius: 50%; border-top-color: transparent; animation: spin 0.6s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
    </style>
</head>
<body>
    <div class="form-container">
        <h2>${formData.formName}</h2>
        <form id="dynamicForm">
            ${formData.fields.map(f => `
            <div class="form-group">
                <label for="${f.name}">${f.label}</label>
                ${f.type === "textarea" ? 
                  `<textarea id="${f.name}" name="${f.name}" rows="3"></textarea>` :
                  `<input type="${f.type}" id="${f.name}" name="${f.name}">`
                }
            </div>
            `).join("")}
            <button type="submit" id="submitBtn">Submit</button>
        </form>
    </div>
    <script>
        const submitBtn = document.getElementById('submitBtn');
        document.getElementById('dynamicForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="loader"></span> Submitting...';
            submitBtn.disabled = true;
            
            try {
                const formData = new FormData(e.target);
                const data = Object.fromEntries(formData.entries());
                console.log('Form submitted:', data);
                await new Promise(resolve => setTimeout(resolve, 1000));
                alert('Form submitted successfully! Check console for data.');
            } catch (error) {
                console.error('Error:', error);
                alert('Submission failed. Please try again.');
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    </script>
</body>
</html>`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", duration: 0.3 }}
          className="relative bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Form Preview</h2>
              <p className="text-sm text-slate-500 mt-1">Preview and copy your integration code</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-slate-500" />
            </button>
          </div>
          
          <div className="flex border-b border-slate-200 px-6">
            <button
              onClick={() => setActiveTab("preview")}
              className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                activeTab === "preview"
                  ? "text-indigo-600"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Form Preview
              {activeTab === "preview" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab("code")}
              className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                activeTab === "code"
                  ? "text-indigo-600"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Generated Code
              {activeTab === "code" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
                />
              )}
            </button>
          </div>
          
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            {activeTab === "preview" ? (
              renderFormPreview()
            ) : (
              <div className="space-y-4">
                <div className="bg-[#0F172A] rounded-xl overflow-hidden">
                  <div className="bg-slate-900/50 px-4 py-2 flex items-center justify-between border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
                      <span className="ml-2 text-xs font-mono text-slate-400">
                        {formData.integrationType === "React" ? "FormComponent.jsx" : "index.html"}
                      </span>
                    </div>
                    <button
                      onClick={handleCopyCode}
                      className="flex items-center gap-1.5 px-2 py-1 text-xs bg-slate-800 hover:bg-slate-700 rounded-md transition-colors text-slate-300"
                    >
                      {isCopied ? (
                        <>
                          <CheckCircle2 size={12} className="text-emerald-400" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-4 text-sm font-mono text-emerald-400/90 leading-relaxed overflow-x-auto">
                    <code>{generatePreviewCode()}</code>
                  </pre>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
            <Reusable_Button
              text="Close"
              variant="ghost"
              onClick={onClose}
            />
            {activeTab === "code" && (
              <Reusable_Button
                text={isCopied ? "Copied!" : "Copy Code"}
                variant="primary"
                icon={isCopied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                onClick={handleCopyCode}
              />
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const Utilities = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { message, error, isLoading } = useSelector((state: any) => state.generatedCode || {});
  
  const [formName, setFormName] = useState("Contact Us");
  const [platform, setPlatform] = useState("website");
  const [integrationType, setIntegrationType] = useState("React");
  const [generatedCode, setGeneratedCode] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  const [availableFields, setAvailableFields] = useState<FieldItem[]>([
    { id: "1", name: "name", label: "Full Name", type: "text" },
    { id: "2", name: "email", label: "Email Address", type: "email" },
    { id: "3", name: "mobile", label: "Phone Number", type: "tel" },
    { id: "4", name: "message", label: "Message", type: "textarea" },
    { id: "5", name: "address", label: "Address", type: "text" },
  ]);

  const [selectedFields, setSelectedFields] = useState<FieldItem[]>([]);
  const { permissions } = useSelector((state: any) => state.auth);
  const Roles = permissions[6];

  // Simulate initial load (fetch saved forms if needed)
  useEffect(() => {
    // Simulate loading saved data
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    
    if (!formName.trim()) {
      errors.formName = "Form name is required";
    } else if (formName.trim().length < 3) {
      errors.formName = "Form name must be at least 3 characters";
    } else if (formName.trim().length > 50) {
      errors.formName = "Form name must be less than 50 characters";
    }
    
    if (selectedFields.length === 0) {
      errors.fields = "Please add at least one field to the form";
    }
    
    setValidationErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      warningAlert("Please fix the validation errors before generating", "Got it");
      return false;
    }
    return true;
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceList = source.droppableId === "available" ? [...availableFields] : [...selectedFields];
    const destList = destination.droppableId === "available" ? [...availableFields] : [...selectedFields];

    const [removed] = sourceList.splice(source.index, 1);
    destList.splice(destination.index, 0, removed);

    if (source.droppableId === "available") {
      setAvailableFields(sourceList);
      setSelectedFields(destList);
    } else {
      setSelectedFields(sourceList);
      setAvailableFields(destList);
    }
    
    successAlert(`Field "${removed.label}" moved successfully`, "Got it");
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    if (!Roles?.canCreate) {
      warningAlert("You don't have permission to generate code", "Okay");
      return;
    }

    confirmAlert({
      title: "Generate Integration Code?",
      message: `You're about to generate code for "${formName}" with ${selectedFields.length} field(s).`,
      confirmText: "Generate",
      cancelText: "Cancel",
      onConfirm: async () => {
        setIsGenerating(true);
        
        const payload = {
          formName,
          fields: selectedFields.map((f) => ({
            fieldName: f.name,
            fieldType: f.type,
          })),
          platform,
          integrationType,
        };
        
        console.log("Generation Payload:", payload);
        
        try {
          const result = await dispatch(createIntegration(payload)).unwrap();
          
          let formattedCode;
          if (typeof result === 'object') {
            formattedCode = JSON.stringify(result, null, 2);
          } else if (typeof result === 'string') {
            formattedCode = result;
          } else {
            formattedCode = JSON.stringify(payload, null, 2);
          }
          
          setGeneratedCode(formattedCode);
          
          const successMsg = result?.message || message || "Integration code generated successfully!";
          successAlert(successMsg, "Awesome!", "Success!");
        } catch (err: any) {
          console.error("Generation error:", err);
          const errorMessage = extractErrorMessage(err);
          
          if (errorMessage.toLowerCase().includes('duplicate')) {
            errorAlert(errorMessage, "Try Different Name", "Duplicate Form");
          } else if (errorMessage.toLowerCase().includes('validation')) {
            errorAlert(errorMessage, "Fix Errors", "Validation Error");
          } else if (errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('connection')) {
            errorAlert("Network error. Please check your internet connection and try again.", "Retry", "Connection Error");
          } else if (errorMessage.toLowerCase().includes('permission')) {
            errorAlert(errorMessage, "Contact Admin", "Permission Denied");
          } else {
            errorAlert(errorMessage, "Try Again", "Generation Failed");
          }
        } finally {
          setIsGenerating(false);
        }
      }
    });
  };

  const handleCopy = () => {
    if (!generatedCode) {
      warningAlert("No code generated yet. Please generate code first.", "Generate First");
      return;
    }
    
    navigator.clipboard.writeText(generatedCode);
    setIsCopied(true);
    successAlert("Code copied to clipboard!", "Awesome!");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handlePreview = () => {
    if (selectedFields.length === 0) {
      errorAlert("Please add at least one field to preview the form", "Add Fields");
      return;
    }
    
    if (!generatedCode) {
      warningAlert("Please generate code first before previewing", "Generate First");
      return;
    }
    
    setIsPreviewModalOpen(true);
  };

  const handleReset = () => {
    confirmAlert({
      title: "Reset Form Builder?",
      message: "This will clear all selected fields and generated code. Are you sure?",
      confirmText: "Reset",
      cancelText: "Cancel",
      onConfirm: () => {
        setSelectedFields([]);
        setGeneratedCode("");
        setFormName("Contact Us");
        setPlatform("website");
        setIntegrationType("React");
        setValidationErrors({});
        setAvailableFields([
          { id: "1", name: "name", label: "Full Name", type: "text" },
          { id: "2", name: "email", label: "Email Address", type: "email" },
          { id: "3", name: "mobile", label: "Phone Number", type: "tel" },
          { id: "4", name: "message", label: "Message", type: "textarea" },
          { id: "5", name: "address", label: "Address", type: "text" },
        ]);
        successAlert("Form builder has been reset", "Done");
      }
    });
  };

  const handleRefresh = () => {
    // Reset to default state
    setSelectedFields([]);
    setGeneratedCode("");
    setFormName("Contact Us");
    setPlatform("website");
    setIntegrationType("React");
    setValidationErrors({});
    setAvailableFields([
      { id: "1", name: "name", label: "Full Name", type: "text" },
      { id: "2", name: "email", label: "Email Address", type: "email" },
      { id: "3", name: "mobile", label: "Phone Number", type: "tel" },
      { id: "4", name: "message", label: "Message", type: "textarea" },
      { id: "5", name: "address", label: "Address", type: "text" },
    ]);
    successAlert("Form builder refreshed", "Done");
  };

  const handleFormNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormName(value);
    if (validationErrors.formName) {
      setValidationErrors(prev => ({ ...prev, formName: '' }));
    }
  };

  useEffect(() => {
    if (message && !isGenerating) {
      successAlert(message, "Success!");
      dispatch(clearIntegrationMessage());
    }
    if (error) {
      errorAlert(error, "Try Again");
      dispatch(clearIntegrationError());
    }
  }, [message, error, dispatch, isGenerating]);

  // Show initial loader
  if (isInitialLoad) {
    return <RippleLoader />;
  }

  const isLoadingState = isLoading || isGenerating;

  return (
    <>
      {(isLoadingState) && <RippleLoader />}
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="min-h-screen bg-[#F8FAFC] py-8 px-6 lg:px-10"
      >
        <div className="max-w-[1600px] mx-auto space-y-8">
          
          {/* --- LAYER 1: HERO HEADER --- */}
          <motion.header variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
                <Blocks size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">Form Builder</h1>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-sm text-slate-500">Design custom forms and generate integration code instantly.</p>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {selectedFields.length} Field{selectedFields.length !== 1 ? 's' : ''} Selected
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Tooltip text="Refresh Builder">
                <button
                  onClick={handleRefresh}
                  disabled={isLoadingState}
                  className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw size={18} className={isLoadingState ? "animate-spin" : ""} />
                </button>
              </Tooltip>
              
              <Reusable_Button
                text="Reset All"
                variant="ghost"
                icon={<X size={16} />}
                onClick={handleReset}
                disabled={!Roles?.canCreate || isLoadingState}
                size="px-4 py-2 rounded-xl"
              />
            </div>
          </motion.header>

          {/* --- LAYER 2: UNIFIED DATA CARD --- */}
          <motion.main variants={itemVariants} className="bg-white rounded-3xl shadow-[0px_4px_24px_rgba(0,0,0,0.02)] border border-slate-200/60 overflow-hidden">
            
            {/* Configuration Toolbar */}
            <div className="bg-slate-50/80 border-b border-slate-100 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Form Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={formName}
                    onChange={handleFormNameChange}
                    placeholder="e.g., Contact Us"
                    className={`w-full px-4 py-2.5 rounded-xl bg-white text-slate-800 border ${
                      validationErrors.formName ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-indigo-500'
                    } focus:border-indigo-500 outline-none transition-all shadow-sm`}
                    disabled={isLoadingState}
                  />
                  {validationErrors.formName && (
                    <p className="text-xs text-red-500 mt-1">{validationErrors.formName}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Platform</label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white text-slate-800 border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm appearance-none"
                    disabled={isLoadingState}
                  >
                    <option value="website">Website</option>
                    <option value="app">Mobile App</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Framework</label>
                  <select
                    value={integrationType}
                    onChange={(e) => setIntegrationType(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white text-slate-800 border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm appearance-none"
                    disabled={isLoadingState}
                  >
                    <option value="React">React App</option>
                    <option value="HTML-js">Vanilla HTML + JS</option>
                  </select>
                </div>
              </div>
              {validationErrors.fields && (
                <div className="mt-3 text-sm text-red-500 flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{validationErrors.fields}</span>
                </div>
              )}
            </div>

            {/* Builder Area */}
            <div className="p-6">
              <DragDropContext onDragEnd={onDragEnd}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-[500px]">
                  
                  {/* Column 1: Available Fields */}
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 rounded-full bg-slate-300" />
                      <h3 className="font-semibold text-slate-700">Available Fields</h3>
                      <span className="text-xs text-slate-400 ml-auto">{availableFields.length} fields</span>
                    </div>
                    <Droppable droppableId="available">
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`flex-1 p-4 rounded-2xl border-2 border-dashed transition-colors ${
                            snapshot.isDraggingOver ? 'bg-slate-100 border-slate-300' : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <AnimatePresence>
                            {availableFields.map((field, index) => (
                              <Draggable key={field.id} draggableId={field.id} index={index}>
                                {(prov, snap) => (
                                  <div
                                    ref={prov.innerRef}
                                    {...prov.draggableProps}
                                    {...prov.dragHandleProps}
                                    style={{ ...prov.draggableProps.style }}
                                    className={`mb-3 flex items-center justify-between p-3 rounded-xl bg-white border shadow-sm transition-shadow ${
                                      snap.isDragging ? 'border-indigo-300 shadow-lg shadow-indigo-100 scale-105 z-50' : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <GripVertical size={16} className="text-slate-400" />
                                      <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-slate-700">{field.label}</span>
                                        <span className="text-[11px] font-mono text-slate-400">{field.type}</span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                          </AnimatePresence>
                          {provided.placeholder}
                          {availableFields.length === 0 && (
                            <div className="text-center py-8 text-slate-400 text-sm">
                              All fields have been added to the form
                            </div>
                          )}
                        </div>
                      )}
                    </Droppable>
                  </div>

                  {/* Column 2: Selected Fields */}
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                      <h3 className="font-semibold text-indigo-900">Form Structure</h3>
                      <span className="text-xs text-indigo-400 ml-auto">{selectedFields.length} fields</span>
                    </div>
                    <Droppable droppableId="selected">
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`flex-1 p-4 rounded-2xl border-2 border-dashed transition-colors flex flex-col ${
                            snapshot.isDraggingOver ? 'bg-indigo-50 border-indigo-300' : 'bg-indigo-50/30 border-indigo-100'
                          }`}
                        >
                          {selectedFields.length === 0 && !snapshot.isDraggingOver && (
                            <div className="m-auto flex flex-col items-center justify-center text-center p-6 opacity-60">
                              <MousePointerClick size={40} className="text-indigo-300 mb-3" />
                              <p className="text-sm font-medium text-indigo-800">Drag fields here to build</p>
                              <p className="text-xs text-indigo-500 mt-1">Configure your form structure</p>
                            </div>
                          )}

                          <AnimatePresence>
                            {selectedFields?.map((field, index) => (
                              <Draggable key={field.id} draggableId={field.id} index={index}>
                                {(prov, snap) => (
                                  <div
                                    ref={prov.innerRef}
                                    {...prov.draggableProps}
                                    {...prov.dragHandleProps}
                                    style={{ ...prov.draggableProps.style }}
                                    className={`mb-3 flex items-center justify-between p-3 rounded-xl bg-white border transition-shadow ${
                                      snap.isDragging ? 'border-indigo-400 shadow-xl shadow-indigo-200 scale-105 z-50' : 'border-indigo-100 shadow-sm hover:border-indigo-200'
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <GripVertical size={16} className="text-indigo-300" />
                                      <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-indigo-900">{field.label}</span>
                                        <span className="text-[11px] font-mono text-indigo-400">{field.type}</span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                          </AnimatePresence>
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>

                  {/* Column 3: Output Code */}
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <TerminalSquare size={18} className="text-slate-600" />
                        <h3 className="font-semibold text-slate-800">Integration Code</h3>
                      </div>
                      {generatedCode && (
                        <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          Generated
                        </span>
                      )}
                    </div>
                    
                    <div className="flex-1 bg-[#0F172A] rounded-2xl border border-slate-800 overflow-hidden flex flex-col shadow-xl">
                      <div className="bg-slate-900/50 px-4 py-3 flex items-center gap-2 border-b border-slate-800">
                        <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                        <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                        <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                        <span className="ml-2 text-xs font-mono text-slate-500">
                          {generatedCode ? "integration-config.json" : "output.json"}
                        </span>
                      </div>
                      
                      <div className="p-4 flex-1 overflow-auto custom-scrollbar">
                        {generatedCode ? (
                          <pre className="text-[13px] font-mono text-emerald-400/90 leading-relaxed">
                            {generatedCode}
                          </pre>
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center text-slate-600 text-sm font-mono opacity-50 gap-3">
                            <AlertCircle size={32} className="text-slate-500" />
                            <div className="text-center">
                              <p>No code generated yet</p>
                              <p className="text-xs mt-1">Configure your form and click "Generate Code"</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center justify-end gap-3 mt-4">
                      <Reusable_Button
                        text={isCopied ? "Copied!" : "Copy Code"}
                        variant="ghost"
                        icon={isCopied ? <CheckCircle2 size={16} className="text-emerald-500"/> : <Copy size={16} />}
                        onClick={handleCopy}
                        disabled={!Roles?.canRead || isLoadingState || !generatedCode}
                        size="px-5 py-2.5 font-semibold rounded-xl"
                      />

                      <Reusable_Button
                        text="Preview Form"
                        variant="secondary"
                        icon={<Eye size={16} />}
                        onClick={handlePreview}
                        disabled={!Roles?.canRead || isLoadingState || !generatedCode}
                        size="px-5 py-2.5 font-semibold rounded-xl"
                      />

                      <Reusable_Button
                        text={isGenerating ? "Generating..." : "Generate Code"}
                        variant="primary"
                        icon={isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Code2 size={16} />}
                        onClick={handleSubmit}
                        disabled={!Roles?.canCreate || isLoadingState}
                        size="px-5 py-2.5 font-semibold shadow-lg shadow-indigo-200/50 rounded-xl"
                      />
                    </div>
                  </div>

                </div>
              </DragDropContext>
            </div>
          </motion.main>
        </div>
      </motion.div>

      {/* Preview Modal */}
      <PreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        formData={{
          formName,
          fields: selectedFields,
          platform,
          integrationType
        }}
        generatedCode={generatedCode}
      />
    </>
  );
};

export default Utilities;