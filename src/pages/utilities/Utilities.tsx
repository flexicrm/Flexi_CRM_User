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

// --- Tooltip Component with Theme Support ---
const Tooltip = ({ children, text }: { children: React.ReactNode, text: string }) => {
  const { darkMode } = useSelector((state: any) => state.theme);
  
  return (
    <div className="group relative flex flex-col items-center">
      {children}
      <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-50 animate-in fade-in zoom-in-95 duration-200">
        <span className={`relative z-10 px-2 py-1 text-[10px] font-semibold text-white whitespace-nowrap shadow-md rounded-md ${
          darkMode ? 'bg-gray-800' : 'bg-slate-800'
        }`}>
          {text}
        </span>
        <div className={`w-2 h-2 -mt-1 rotate-45 rounded-sm ${
          darkMode ? 'bg-gray-800' : 'bg-slate-800'
        }`}></div>
      </div>
    </div>
  );
};

// --- Preview Modal Component with Theme Support ---
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
  const { primaryColor, darkMode } = useSelector((state: any) => state.theme);
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const [isCopied, setIsCopied] = useState(false);

  const getModalBg = () => darkMode ? 'bg-gray-800' : 'bg-white';
  const getModalBorder = () => darkMode ? 'border-gray-700' : 'border-slate-200';
  const getTitleColor = () => darkMode ? 'text-white' : 'text-slate-900';
  const getSubtitleColor = () => darkMode ? 'text-gray-400' : 'text-slate-500';
  const getCloseButtonBg = () => darkMode ? 'hover:bg-gray-700' : 'hover:bg-slate-100';
  const getTabButtonColor = (isActive: boolean) => {
    if (isActive) return darkMode ? 'text-indigo-400' : 'text-indigo-600';
    return darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-slate-500 hover:text-slate-700';
  };
  const getTabIndicatorBg = () => darkMode ? primaryColor || '#818CF8' : '#6366f1';
  const getCodeBg = () => darkMode ? 'bg-gray-900' : 'bg-[#0F172A]';
  const getCodeBorder = () => darkMode ? 'border-gray-700' : 'border-slate-800';
  const getCodeHeaderBg = () => darkMode ? 'bg-gray-800/50' : 'bg-slate-900/50';
  const getCodeTextColor = () => darkMode ? 'text-emerald-400/90' : 'text-emerald-400/90';
  const getModalFooterBg = () => darkMode ? 'bg-gray-800/50' : 'bg-slate-50';
  const getModalFooterBorder = () => darkMode ? 'border-gray-700' : 'border-slate-200';

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
        <div className={`border-b pb-3 ${getModalBorder()}`}>
          <h3 className={`text-lg font-semibold ${getTitleColor()}`}>{formData.formName}</h3>
          <p className={`text-xs mt-1 ${getSubtitleColor()}`}>
            Platform: {formData.platform} | Framework: {formData.integrationType}
          </p>
        </div>
        
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          {formData.fields.map((field) => (
            <div key={field.id} className="space-y-1">
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                {field.label}
                {field.type === "email" && <span className="text-red-500 ml-1">*</span>}
              </label>
              
              <input
                type={field.type === "textarea" ? "text" : field.type}
                placeholder={`Enter ${field.label.toLowerCase()}`}
                className={`w-full px-3 py-2 rounded-lg focus:ring-2 outline-none transition-all text-sm ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-200 focus:ring-indigo-500 focus:border-indigo-500'
                    : 'bg-white border-slate-300 focus:ring-indigo-500 focus:border-indigo-500'
                } border`}
              />
            </div>
          ))}
          
          <button
            type="submit"
            className={`w-full py-2 rounded-lg font-semibold transition-colors shadow-sm text-sm text-white`}
            style={{ backgroundColor: primaryColor || '#6366f1' }}
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
        <input
          type="${f.type}"
          name="${f.name}"
          value={formData.${f.name}}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>`).join("")}
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
        h2 { margin-bottom: 20px; color: #333; font-size: 1.5rem; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; font-weight: 500; color: #555; font-size: 14px; }
        input, textarea { width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; }
        input:focus, textarea:focus { outline: none; border-color: #6366f1; }
        button { width: 100%; padding: 10px; background: #6366f1; color: white; border: none; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; }
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
                <input type="${f.type}" id="${f.name}" name="${f.name}">
            </div>`).join("")}
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
          className={`relative rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col ${getModalBg()}`}
        >
          <div className={`flex items-center justify-between p-5 border-b ${getModalBorder()}`}>
            <div>
              <h2 className={`text-lg font-bold ${getTitleColor()}`}>Form Preview</h2>
              <p className={`text-xs mt-0.5 ${getSubtitleColor()}`}>Preview and copy your integration code</p>
            </div>
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg transition-colors ${getCloseButtonBg()}`}
            >
              <X size={18} className={darkMode ? 'text-gray-400' : 'text-slate-500'} />
            </button>
          </div>
          
          <div className={`flex border-b px-5 ${getModalBorder()}`}>
            <button
              onClick={() => setActiveTab("preview")}
              className={`px-3 py-2 text-xs font-medium transition-colors relative ${getTabButtonColor(activeTab === "preview")}`}
            >
              Form Preview
              {activeTab === "preview" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ backgroundColor: getTabIndicatorBg() }}
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab("code")}
              className={`px-3 py-2 text-xs font-medium transition-colors relative ${getTabButtonColor(activeTab === "code")}`}
            >
              Generated Code
              {activeTab === "code" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ backgroundColor: getTabIndicatorBg() }}
                />
              )}
            </button>
          </div>
          
          <div className="p-5 overflow-y-auto max-h-[calc(90vh-180px)]">
            {activeTab === "preview" ? (
              renderFormPreview()
            ) : (
              <div className="space-y-3">
                <div className={`rounded-lg overflow-hidden ${getCodeBg()} ${getCodeBorder()}`}>
                  <div className={`px-3 py-2 flex items-center justify-between border-b ${getCodeHeaderBg()} ${getCodeBorder()}`}>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-rose-500/80"></div>
                      <div className="w-2 h-2 rounded-full bg-amber-500/80"></div>
                      <div className="w-2 h-2 rounded-full bg-emerald-500/80"></div>
                      <span className="ml-1.5 text-[10px] font-mono text-slate-400">
                        {formData.integrationType === "React" ? "FormComponent.jsx" : "index.html"}
                      </span>
                    </div>
                    <button
                      onClick={handleCopyCode}
                      className={`flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded transition-colors ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}
                    >
                      {isCopied ? (
                        <>
                          <CheckCircle2 size={10} className="text-emerald-400" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={10} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className={`p-3 text-xs font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap ${getCodeTextColor()}`}>
                    <code>{generatePreviewCode()}</code>
                  </pre>
                </div>
              </div>
            )}
          </div>
          
          <div className={`flex items-center justify-end gap-2 p-4 border-t mt-auto ${getModalFooterBg()} ${getModalFooterBorder()}`}>
            <Reusable_Button
              text="Close"
              variant="ghost"
              onClick={onClose}
              size="px-3 py-1.5 text-xs"
            />
            {activeTab === "code" && (
              <Reusable_Button
                text={isCopied ? "Copied!" : "Copy Code"}
                variant="primary"
                icon={isCopied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                onClick={handleCopyCode}
                size="px-3 py-1.5 text-xs"
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
  const { primaryColor, darkMode } = useSelector((state: any) => state.theme);
  const { isLoading } = useSelector((state: any) => state.generatedCode || {});
  
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

  // Theme-based styles
  const getPageBg = () => darkMode ? 'bg-gray-900' : 'bg-[#F8FAFC]';
  const getCardBg = () => darkMode ? 'bg-gray-800' : 'bg-white';
  const getCardBorder = () => darkMode ? 'border-gray-700' : 'border-slate-200/60';
  const getHeaderIconBg = () => darkMode ? 'bg-gray-700' : 'bg-indigo-100';
  const getHeaderIconColor = () => darkMode ? primaryColor || '#818CF8' : '#6366f1';
  const getTitleColor = () => darkMode ? 'text-white' : 'text-slate-900';
  const getSubtitleColor = () => darkMode ? 'text-gray-400' : 'text-slate-500';
  const getSeparatorColor = () => darkMode ? 'bg-gray-600' : 'bg-slate-300';
  const getCountColor = () => darkMode ? 'text-gray-500' : 'text-slate-500';
  const getButtonBg = () => darkMode ? 'bg-gray-800' : 'bg-white';
  const getButtonBorder = () => darkMode ? 'border-gray-700' : 'border-slate-200';
  const getButtonTextColor = () => darkMode ? 'text-gray-400 hover:text-indigo-400' : 'text-slate-500 hover:text-indigo-600';
  const getButtonHoverBg = () => darkMode ? 'hover:bg-gray-700' : 'hover:bg-slate-50';
  const getToolbarBg = () => darkMode ? 'bg-gray-800/80' : 'bg-slate-50/80';
  const getToolbarBorder = () => darkMode ? 'border-gray-700' : 'border-slate-100';
  const getLabelColor = () => darkMode ? 'text-gray-400' : 'text-slate-500';
  const getInputBg = () => darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-slate-200 text-slate-800';
  const getInputFocusRing = () => darkMode ? 'focus:ring-indigo-500' : 'focus:ring-indigo-500';
  const getSelectBg = () => darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-slate-200 text-slate-800';
  const getAvailableFieldsBg = () => darkMode ? 'bg-gray-700/50' : 'bg-slate-50';
  const getAvailableFieldsBorder = () => darkMode ? 'border-gray-600' : 'border-slate-200';
  const getAvailableFieldBg = () => darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200';
  const getAvailableFieldTextColor = () => darkMode ? 'text-gray-200' : 'text-slate-700';
  const getAvailableFieldSubColor = () => darkMode ? 'text-gray-500' : 'text-slate-400';
  const getFormStructureBg = () => darkMode ? 'bg-indigo-900/20' : 'bg-indigo-50/30';
  const getFormStructureBorder = () => darkMode ? 'border-indigo-800' : 'border-indigo-100';
  const getFormStructureTitleColor = () => darkMode ? 'text-indigo-400' : 'text-indigo-900';
  const getFormStructureCountColor = () => darkMode ? 'text-indigo-400' : 'text-indigo-400';
  const getFormStructureEmptyIconColor = () => darkMode ? 'text-indigo-500' : 'text-indigo-300';
  const getFormStructureEmptyTitleColor = () => darkMode ? 'text-indigo-300' : 'text-indigo-800';
  const getFormStructureEmptyTextColor = () => darkMode ? 'text-indigo-400' : 'text-indigo-500';
  const getSelectedFieldBg = () => darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-indigo-100';
  const getSelectedFieldTextColor = () => darkMode ? 'text-indigo-400' : 'text-indigo-900';
  const getSelectedFieldSubColor = () => darkMode ? 'text-indigo-400' : 'text-indigo-400';
  const getCodePanelBg = () => darkMode ? 'bg-gray-900' : 'bg-[#0F172A]';
  const getCodePanelBorder = () => darkMode ? 'border-gray-700' : 'border-slate-800';
  const getCodeHeaderBg = () => darkMode ? 'bg-gray-800/50' : 'bg-slate-900/50';
  const getCodeTextColor = () => darkMode ? 'text-emerald-400/90' : 'text-emerald-400/90';

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    dispatch(clearIntegrationMessage());
    dispatch(clearIntegrationError());
  }, [dispatch]);

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
    
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

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
        
        try {
          const result = await dispatch(createIntegration(payload)).unwrap();
          
          let formattedCode;
          if (typeof result === 'object' && result.integrationCode) {
            formattedCode = result.integrationCode;
          } else {
            formattedCode = JSON.stringify(result, null, 2);
          }
          
          setGeneratedCode(formattedCode);
          
          const successMsg = result?.message || "Integration code generated successfully!";
          successAlert(successMsg, "Awesome!", "Success!");
        } catch (err: any) {
          console.error("Generation error:", err);
          
          const errorMessage = typeof err === 'string' ? err : "An unexpected error occurred.";

          if (errorMessage.toLowerCase().includes('already exists') || errorMessage.toLowerCase().includes('duplicate')) {
            errorAlert(errorMessage, "Try Different Name", "Duplicate Form");
          } else if (errorMessage.toLowerCase().includes('validation')) {
            errorAlert(errorMessage, "Fix Errors", "Validation Error");
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

  if (isInitialLoad) return <RippleLoader />;

  const isLoadingState = isLoading || isGenerating;

  return (
    <>
      {(isLoadingState) && <RippleLoader />}
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={`min-h-screen py-6 px-4 md:py-8 md:px-6 lg:px-8 transition-colors duration-300 ${getPageBg()}`}
      >
        <div className="w-full mx-auto space-y-6">
          
          <motion.header variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center shadow-sm ${getHeaderIconBg()}`}>
                <Blocks size={20} strokeWidth={2.5} className="md:w-6 md:h-6" style={{ color: getHeaderIconColor() }} />
              </div>
              <div>
                <h1 className={`text-xl md:text-2xl lg:text-3xl font-bold tracking-tight ${getTitleColor()}`}>Form Builder</h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className={`text-xs md:text-sm ${getSubtitleColor()}`}>Design custom forms and generate integration code instantly.</p>
                  <span className={`w-1 h-1 rounded-full hidden sm:block ${getSeparatorColor()}`}></span>
                  <p className={`text-[10px] md:text-xs font-bold uppercase tracking-wider hidden sm:block ${getCountColor()}`}>
                    {selectedFields.length} Field{selectedFields.length !== 1 ? 's' : ''} Selected
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Tooltip text="Refresh Data">
                <button
                  onClick={handleRefresh}
                  disabled={isLoadingState}
                  className={`p-2 rounded-lg shadow-sm border transition-all disabled:opacity-50 disabled:cursor-not-allowed ${getButtonBg()} ${getButtonBorder()} ${getButtonTextColor()} ${getButtonHoverBg()}`}
                >
                  <RefreshCw size={16} className={isLoadingState ? "animate-spin" : ""} />
                </button>
              </Tooltip>
              
              <Reusable_Button
                text="Reset"
                variant="ghost"
                icon={<X size={14} />}
                onClick={handleReset}
                disabled={!Roles?.canCreate}
                size="px-3 py-1.5 text-xs rounded-lg"
              />
            </div>
          </motion.header>

          <motion.main variants={itemVariants} className={`rounded-xl md:rounded-2xl shadow-sm border overflow-hidden ${getCardBg()} ${getCardBorder()}`}>
            
            <div className={`border-b p-4 ${getToolbarBg()} ${getToolbarBorder()}`}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className={`text-[10px] font-bold uppercase tracking-wider ${getLabelColor()}`}>
                    Form Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={formName}
                    onChange={handleFormNameChange}
                    placeholder="e.g., Contact Us"
                    className={`w-full px-3 py-1.5 rounded-lg border text-sm focus:outline-none transition-all shadow-sm ${getInputBg()} ${getInputFocusRing()}`}
                    disabled={isLoadingState}
                  />
                  {validationErrors.formName && (
                    <p className="text-[10px] text-red-500 mt-0.5">{validationErrors.formName}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className={`text-[10px] font-bold uppercase tracking-wider ${getLabelColor()}`}>Platform</label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className={`w-full px-3 py-1.5 rounded-lg border focus:ring-2 outline-none transition-all shadow-sm text-sm ${getSelectBg()} ${getInputFocusRing()}`}
                    disabled={isLoadingState}
                  >
                    <option value="website">Website</option>
                    <option value="app">Mobile App</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className={`text-[10px] font-bold uppercase tracking-wider ${getLabelColor()}`}>Framework</label>
                  <select
                    value={integrationType}
                    onChange={(e) => setIntegrationType(e.target.value)}
                    className={`w-full px-3 py-1.5 rounded-lg border focus:ring-2 outline-none transition-all shadow-sm text-sm ${getSelectBg()} ${getInputFocusRing()}`}
                    disabled={isLoadingState}
                  >
                    <option value="React">React App</option>
                    <option value="HTML-js">Vanilla HTML + JS</option>
                  </select>
                </div>
              </div>
              {validationErrors.fields && (
                <div className="mt-2 text-xs text-red-500 flex items-center gap-1.5">
                  <AlertCircle size={12} />
                  <span>{validationErrors.fields}</span>
                </div>
              )}
            </div>

            <div className="p-4">
              <DragDropContext onDragEnd={onDragEnd}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-[400px]">
                  
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 mb-3">
                      <div className={`w-1.5 h-1.5 rounded-full ${darkMode ? 'bg-gray-500' : 'bg-slate-300'}`} />
                      <h3 className={`font-semibold text-sm ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>Available Fields</h3>
                      <span className={`text-[10px] ml-auto ${darkMode ? 'text-gray-500' : 'text-slate-400'}`}>{availableFields.length} fields</span>
                    </div>
                    <Droppable droppableId="available">
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`flex-1 p-3 rounded-xl border-2 border-dashed transition-colors ${
                            snapshot.isDraggingOver 
                              ? darkMode ? 'bg-gray-700 border-gray-500' : 'bg-slate-100 border-slate-300'
                              : `${getAvailableFieldsBg()} ${getAvailableFieldsBorder()}`
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
                                    className={`mb-2 flex items-center justify-between p-2 rounded-lg border shadow-sm transition-shadow ${
                                      snap.isDragging 
                                        ? `border-${primaryColor}-300 shadow-md shadow-${primaryColor}/10 scale-105 z-50`
                                        : `${getAvailableFieldBg()} hover:border-slate-300 hover:shadow-md`
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <GripVertical size={14} className={darkMode ? 'text-gray-500' : 'text-slate-400'} />
                                      <div className="flex flex-col">
                                        <span className={`text-xs font-semibold ${getAvailableFieldTextColor()}`}>{field.label}</span>
                                        <span className={`text-[10px] font-mono ${getAvailableFieldSubColor()}`}>{field.type}</span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                          </AnimatePresence>
                          {provided.placeholder}
                          {availableFields.length === 0 && (
                            <div className={`text-center py-6 text-xs ${darkMode ? 'text-gray-500' : 'text-slate-400'}`}>
                              All fields have been added to the form
                            </div>
                          )}
                        </div>
                      )}
                    </Droppable>
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 mb-3">
                      <div className={`w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]`} />
                      <h3 className={`font-semibold text-sm ${getFormStructureTitleColor()}`}>Form Structure</h3>
                      <span className={`text-[10px] ml-auto ${getFormStructureCountColor()}`}>{selectedFields.length} fields</span>
                    </div>
                    <Droppable droppableId="selected">
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`flex-1 p-3 rounded-xl border-2 border-dashed transition-colors flex flex-col ${
                            snapshot.isDraggingOver 
                              ? darkMode ? 'bg-indigo-900/30 border-indigo-600' : 'bg-indigo-50 border-indigo-300'
                              : `${getFormStructureBg()} ${getFormStructureBorder()}`
                          }`}
                        >
                          {selectedFields.length === 0 && !snapshot.isDraggingOver && (
                            <div className="m-auto flex flex-col items-center justify-center text-center p-4 opacity-60">
                              <MousePointerClick size={32} className={getFormStructureEmptyIconColor()} />
                              <p className={`text-xs font-medium mt-2 ${getFormStructureEmptyTitleColor()}`}>Drag fields here to build</p>
                              <p className={`text-[10px] mt-0.5 ${getFormStructureEmptyTextColor()}`}>Configure your form structure</p>
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
                                    className={`mb-2 flex items-center justify-between p-2 rounded-lg border shadow-sm transition-shadow ${
                                      snap.isDragging 
                                        ? `border-${primaryColor}-400 shadow-lg shadow-${primaryColor}/20 scale-105 z-50`
                                        : `${getSelectedFieldBg()} shadow-sm hover:border-indigo-200`
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <GripVertical size={14} className={darkMode ? 'text-indigo-400' : 'text-indigo-300'} />
                                      <div className="flex flex-col">
                                        <span className={`text-xs font-semibold ${getSelectedFieldTextColor()}`}>{field.label}</span>
                                        <span className={`text-[10px] font-mono ${getSelectedFieldSubColor()}`}>{field.type}</span>
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

                  <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5">
                        <TerminalSquare size={16} className={darkMode ? 'text-gray-400' : 'text-slate-600'} />
                        <h3 className={`font-semibold text-sm ${darkMode ? 'text-gray-300' : 'text-slate-800'}`}>Integration Code</h3>
                      </div>
                      {generatedCode && (
                        <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                          Generated
                        </span>
                      )}
                    </div>
                    
                    <div className={`flex-1 rounded-xl border overflow-hidden flex flex-col shadow-md ${getCodePanelBg()} ${getCodePanelBorder()}`}>
                      <div className={`px-3 py-2 flex items-center gap-1.5 border-b ${getCodeHeaderBg()} ${getCodePanelBorder()}`}>
                        <div className="w-2 h-2 rounded-full bg-rose-500/80"></div>
                        <div className="w-2 h-2 rounded-full bg-amber-500/80"></div>
                        <div className="w-2 h-2 rounded-full bg-emerald-500/80"></div>
                        <span className="ml-1.5 text-[10px] font-mono text-slate-500">
                          {generatedCode ? "integration-config.json" : "output.json"}
                        </span>
                      </div>
                      
                      <div className="p-3 flex-1 overflow-auto max-h-[300px]">
                        {generatedCode ? (
                          <pre className={`text-[11px] font-mono leading-relaxed ${getCodeTextColor()}`}>
                            {generatedCode}
                          </pre>
                        ) : (
                          <div className={`h-full flex flex-col items-center justify-center text-xs font-mono opacity-50 gap-2 ${darkMode ? 'text-gray-500' : 'text-slate-600'}`}>
                            <AlertCircle size={24} className={darkMode ? 'text-gray-600' : 'text-slate-500'} />
                            <div className="text-center">
                              <p>No code generated yet</p>
                              <p className="text-[10px] mt-0.5">Configure your form and click "Generate Code"</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2 mt-3">
                      <Reusable_Button
                        text={isCopied ? "Copied!" : "Copy"}
                        variant="ghost"
                        icon={isCopied ? <CheckCircle2 size={14} className="text-emerald-500"/> : <Copy size={14} />}
                        onClick={handleCopy}
                        disabled={!Roles?.canRead}
                        size="px-3 py-1.5 text-xs rounded-lg"
                      />

                      <Reusable_Button
                        text="Preview"
                        variant="secondary"
                        icon={<Eye size={14} />}
                        onClick={handlePreview}
                        disabled={!Roles?.canRead}
                        size="px-3 py-1.5 text-xs rounded-lg"
                      />

                      <Reusable_Button
                        text={isGenerating ? "Generating..." : "Generate"}
                        variant="primary"
                        icon={isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Code2 size={14} />}
                        onClick={handleSubmit}
                        disabled={!Roles?.canCreate}
                        size="px-3 py-1.5 text-xs rounded-lg"
                      />
                    </div>
                  </div>

                </div>
              </DragDropContext>
            </div>
          </motion.main>
        </div>
      </motion.div>

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