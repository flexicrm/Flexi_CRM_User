import { AnimatePresence, motion } from 'framer-motion';
import { Check, Loader2, Plus, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useSearchParams } from 'react-router-dom';
import Reusable_Button from '../../component/button/Reusable_Button';
import Reusable_Fields, { type SelectOption } from '../../component/Fields/Reusable_Fiealds';
import RippleLoader from '../../component/Loader/RippleLoader';
import { errorAlert, successAlert, warningAlert } from '../../component/Notification/statusHandler';
import {
  addFollowUp_Assignto,
  addFollowUp_Leadstatus,
  addFollowUp_status,
  addFollowUp_type,
  createFollowUp,
  UpdateFollowUp
} from '../../store/homepage_slice/Leads_slice';
import { createFollowUpStatus } from '../../store/settingFollowStatus';
import { createFollowUpType } from '../../store/settingFollowtypeSlice';
import { createLeadStatus } from '../../store/settingLeadeStatus';

// Custom Select Component with Create Option for Lead Status (with Theme Support)
const LeadStatusSelect = ({ value, onChange, options, error, disabled, label, onCreateStatus }: any) => {
  const { primaryColor, darkMode } = useSelector((state: any) => state.theme);
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newStatusName, setNewStatusName] = useState('');
  const [newStatusColor, setNewStatusColor] = useState(primaryColor || '#6366F1');
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
        successAlert("Lead status created successfully!", "Done", "Success!");
        setShowCreateModal(false);
        setNewStatusName('');
        setNewStatusColor(primaryColor || '#6366F1');
        onChange({ target: { name: 'leadStatus', value: result._id } });
      }
    } catch (error: any) {
      errorAlert(error?.message || "Failed to create status", "Try Again", "Creation Failed");
    } finally {
      setIsCreating(false);
    }
  };

  const getButtonBg = () => {
    if (disabled) return darkMode ? 'bg-gray-800' : 'bg-slate-50';
    return darkMode ? 'bg-gray-800' : 'bg-white';
  };

  const getButtonBorder = () => {
    if (error) return 'border-red-500';
    return darkMode ? 'border-gray-600 hover:border-gray-500' : 'border-slate-200 hover:border-slate-400';
  };

  const getTextColor = () => darkMode ? 'text-gray-200' : 'text-slate-700';
  const getPlaceholderColor = () => darkMode ? 'text-gray-500' : 'text-slate-400';
  const getDropdownBg = () => darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200';
  const getDropdownItemHover = () => darkMode ? 'hover:bg-gray-700' : 'hover:bg-slate-50';
  const getModalBg = () => darkMode ? 'bg-gray-800' : 'bg-white';
  const getModalTextColor = () => darkMode ? 'text-gray-200' : 'text-slate-900';
  const getInputBg = () => darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-slate-300';

  return (
    <div className="w-full" ref={selectRef}>
      <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
        {label} <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`w-full px-4 py-3 text-left border rounded-xl transition-all flex items-center justify-between ${getButtonBorder()} ${getButtonBg()} ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
          disabled={disabled}
        >
          <div className="flex items-center gap-2">
            {selectedStatus?.color && (
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedStatus.color }} />
            )}
            <span className={`text-sm ${!selectedStatus ? getPlaceholderColor() : getTextColor()}`}>
              {selectedStatus?.label || "Select Lead Status"}
            </span>
          </div>
          <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''} ${darkMode ? 'text-gray-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {isOpen && !disabled && (
          <div className={`absolute z-50 w-full mt-1 rounded-lg shadow-lg max-h-60 overflow-y-auto ${getDropdownBg()}`}>
            {options?.map((option: any) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange({ target: { name: 'leadStatus', value: option.value } });
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 text-left transition-colors flex items-center gap-2 ${getDropdownItemHover()}`}
              >
                {option.color && <div className="w-3 h-3 rounded-full" style={{ backgroundColor: option.color }} />}
                <span className={`text-sm ${getTextColor()}`}>{option.label}</span>
                {value === option.value && (
                  <svg className="w-4 h-4 ml-auto" style={{ color: primaryColor || '#6366f1' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className={`w-full px-3 py-2 text-left transition-colors flex items-center gap-2 border-t ${darkMode ? 'border-gray-700 text-indigo-400 hover:bg-gray-700' : 'border-slate-100 text-indigo-600 hover:bg-indigo-50'}`}
            >
              <Plus size={16} />
              <span className="text-sm font-medium">Create New Lead Status</span>
            </button>
          </div>
        )}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}

      {/* Create Lead Status Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]" onClick={() => setShowCreateModal(false)}>
          <div className={`rounded-xl shadow-xl w-full max-w-md p-6 ${getModalBg()}`} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-semibold ${getModalTextColor()}`}>Create New Lead Status</h3>
              <button onClick={() => setShowCreateModal(false)} className={darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-slate-400 hover:text-slate-600'}>
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>Status Name</label>
                <input
                  type="text"
                  value={newStatusName}
                  onChange={(e) => setNewStatusName(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg ${getInputBg()}`}
                  placeholder="e.g., Hot Lead, Cold Lead"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>Status Color</label>
                <div className="flex gap-3 items-center">
                  <input
                    type="color"
                    value={newStatusColor}
                    onChange={(e) => setNewStatusColor(e.target.value)}
                    className="w-12 h-10 border rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={newStatusColor}
                    onChange={(e) => setNewStatusColor(e.target.value)}
                    className={`flex-1 px-3 py-2 rounded-lg ${getInputBg()}`}
                    placeholder="#6366F1"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Reusable_Button
                  text="Cancel"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1"
                />
                <Reusable_Button
                  text={isCreating ? "Creating..." : "Create Status"}
                  icon={isCreating ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  onClick={handleCreateStatus}
                  disabled={isCreating}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Custom Select Component with Create Option for Interaction Type (with Theme Support)
const InteractionTypeSelect = ({ value, onChange, options, error, disabled, label, onCreateType }: any) => {
  const { primaryColor, darkMode } = useSelector((state: any) => state.theme);
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const selectRef = React.useRef<HTMLDivElement>(null);

  const selectedType = options?.find((opt: any) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreateType = async () => {
    if (!newTypeName.trim()) {
      warningAlert("Please enter a type name", "Got it");
      return;
    }

    setIsCreating(true);
    try {
      const result = await onCreateType(newTypeName.trim());
      if (result) {
        successAlert("Interaction type created successfully!", "Done", "Success!");
        setShowCreateModal(false);
        setNewTypeName('');
        onChange({ target: { name: 'type', value: result._id } });
      }
    } catch (error: any) {
      errorAlert(error?.message || "Failed to create type", "Try Again", "Creation Failed");
    } finally {
      setIsCreating(false);
    }
  };

  const getButtonBg = () => {
    if (disabled) return darkMode ? 'bg-gray-800' : 'bg-slate-50';
    return darkMode ? 'bg-gray-800' : 'bg-white';
  };

  const getButtonBorder = () => {
    if (error) return 'border-red-500';
    return darkMode ? 'border-gray-600 hover:border-gray-500' : 'border-slate-200 hover:border-slate-400';
  };

  const getTextColor = () => darkMode ? 'text-gray-200' : 'text-slate-700';
  const getPlaceholderColor = () => darkMode ? 'text-gray-500' : 'text-slate-400';
  const getDropdownBg = () => darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200';
  const getDropdownItemHover = () => darkMode ? 'hover:bg-gray-700' : 'hover:bg-slate-50';
  const getModalBg = () => darkMode ? 'bg-gray-800' : 'bg-white';
  const getModalTextColor = () => darkMode ? 'text-gray-200' : 'text-slate-900';
  const getInputBg = () => darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-slate-300';

  return (
    <div className="w-full" ref={selectRef}>
      <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
        {label} <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`w-full px-4 py-3 text-left border rounded-xl transition-all flex items-center justify-between ${getButtonBorder()} ${getButtonBg()} ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
          disabled={disabled}
        >
          <span className={`text-sm ${!selectedType ? getPlaceholderColor() : getTextColor()}`}>
            {selectedType?.label || "Select Interaction Type"}
          </span>
          <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''} ${darkMode ? 'text-gray-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {isOpen && !disabled && (
          <div className={`absolute z-50 w-full mt-1 rounded-lg shadow-lg max-h-60 overflow-y-auto ${getDropdownBg()}`}>
            {options?.map((option: any) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange({ target: { name: 'type', value: option.value } });
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 text-left transition-colors flex items-center justify-between ${getDropdownItemHover()}`}
              >
                <span className={`text-sm ${getTextColor()}`}>{option.label}</span>
                {value === option.value && (
                  <svg className="w-4 h-4" style={{ color: primaryColor || '#6366f1' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className={`w-full px-3 py-2 text-left transition-colors flex items-center gap-2 border-t ${darkMode ? 'border-gray-700 text-indigo-400 hover:bg-gray-700' : 'border-slate-100 text-indigo-600 hover:bg-indigo-50'}`}
            >
              <Plus size={16} />
              <span className="text-sm font-medium">Create New Interaction Type</span>
            </button>
          </div>
        )}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}

      {/* Create Interaction Type Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]" onClick={() => setShowCreateModal(false)}>
          <div className={`rounded-xl shadow-xl w-full max-w-md p-6 ${getModalBg()}`} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-semibold ${getModalTextColor()}`}>Create New Interaction Type</h3>
              <button onClick={() => setShowCreateModal(false)} className={darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-slate-400 hover:text-slate-600'}>
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>Type Name</label>
                <input
                  type="text"
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg ${getInputBg()}`}
                  placeholder="e.g., Call, Meeting, Email"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Reusable_Button
                  text="Cancel"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1"
                />
                <Reusable_Button
                  text={isCreating ? "Creating..." : "Create Type"}
                  icon={isCreating ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  onClick={handleCreateType}
                  disabled={isCreating}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Custom Select Component with Create Option for Follow-up Status (with Theme Support)
const FollowUpStatusSelect = ({ value, onChange, options, error, disabled, label, onCreateStatus }: any) => {
  const { primaryColor, darkMode } = useSelector((state: any) => state.theme);
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newStatusName, setNewStatusName] = useState('');
  const [newStatusColor, setNewStatusColor] = useState(primaryColor || '#6366F1');
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
        successAlert("Follow-up status created successfully!", "Done", "Success!");
        setShowCreateModal(false);
        setNewStatusName('');
        setNewStatusColor(primaryColor || '#6366F1');
        onChange({ target: { name: 'status', value: result._id } });
      }
    } catch (error: any) {
      errorAlert(error?.message || "Failed to create status", "Try Again", "Creation Failed");
    } finally {
      setIsCreating(false);
    }
  };

  const getButtonBg = () => {
    if (disabled) return darkMode ? 'bg-gray-800' : 'bg-slate-50';
    return darkMode ? 'bg-gray-800' : 'bg-white';
  };

  const getButtonBorder = () => {
    if (error) return 'border-red-500';
    return darkMode ? 'border-gray-600 hover:border-gray-500' : 'border-slate-200 hover:border-slate-400';
  };

  const getTextColor = () => darkMode ? 'text-gray-200' : 'text-slate-700';
  const getPlaceholderColor = () => darkMode ? 'text-gray-500' : 'text-slate-400';
  const getDropdownBg = () => darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200';
  const getDropdownItemHover = () => darkMode ? 'hover:bg-gray-700' : 'hover:bg-slate-50';
  const getModalBg = () => darkMode ? 'bg-gray-800' : 'bg-white';
  const getModalTextColor = () => darkMode ? 'text-gray-200' : 'text-slate-900';
  const getInputBg = () => darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-slate-300';

  return (
    <div className="w-full" ref={selectRef}>
      <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
        {label} <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`w-full px-4 py-3 text-left border rounded-xl transition-all flex items-center justify-between ${getButtonBorder()} ${getButtonBg()} ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
          disabled={disabled}
        >
          <div className="flex items-center gap-2">
            {selectedStatus?.color && (
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedStatus.color }} />
            )}
            <span className={`text-sm ${!selectedStatus ? getPlaceholderColor() : getTextColor()}`}>
              {selectedStatus?.label || "Select Follow-up Status"}
            </span>
          </div>
          <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''} ${darkMode ? 'text-gray-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {isOpen && !disabled && (
          <div className={`absolute z-50 w-full mt-1 rounded-lg shadow-lg max-h-60 overflow-y-auto ${getDropdownBg()}`}>
            {options?.map((option: any) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange({ target: { name: 'status', value: option.value } });
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 text-left transition-colors flex items-center gap-2 ${getDropdownItemHover()}`}
              >
                {option.color && <div className="w-3 h-3 rounded-full" style={{ backgroundColor: option.color }} />}
                <span className={`text-sm ${getTextColor()}`}>{option.label}</span>
                {value === option.value && (
                  <svg className="w-4 h-4 ml-auto" style={{ color: primaryColor || '#6366f1' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className={`w-full px-3 py-2 text-left transition-colors flex items-center gap-2 border-t ${darkMode ? 'border-gray-700 text-indigo-400 hover:bg-gray-700' : 'border-slate-100 text-indigo-600 hover:bg-indigo-50'}`}
            >
              <Plus size={16} />
              <span className="text-sm font-medium">Create New Follow-up Status</span>
            </button>
          </div>
        )}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}

      {/* Create Follow-up Status Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]" onClick={() => setShowCreateModal(false)}>
          <div className={`rounded-xl shadow-xl w-full max-w-md p-6 ${getModalBg()}`} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-semibold ${getModalTextColor()}`}>Create New Follow-up Status</h3>
              <button onClick={() => setShowCreateModal(false)} className={darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-slate-400 hover:text-slate-600'}>
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>Status Name</label>
                <input
                  type="text"
                  value={newStatusName}
                  onChange={(e) => setNewStatusName(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg ${getInputBg()}`}
                  placeholder="e.g., Pending, Completed, Overdue"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>Status Color</label>
                <div className="flex gap-3 items-center">
                  <input
                    type="color"
                    value={newStatusColor}
                    onChange={(e) => setNewStatusColor(e.target.value)}
                    className="w-12 h-10 border rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={newStatusColor}
                    onChange={(e) => setNewStatusColor(e.target.value)}
                    className={`flex-1 px-3 py-2 rounded-lg ${getInputBg()}`}
                    placeholder="#6366F1"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Reusable_Button
                  text="Cancel"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1"
                />
                <Reusable_Button
                  text={isCreating ? "Creating..." : "Create Status"}
                  icon={isCreating ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  onClick={handleCreateStatus}
                  disabled={isCreating}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// For brevity, I'll show the main component with theme support
const AddFollowUp_Model = ({ tableId }: { tableId: string | null; selectedData: any }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { primaryColor, darkMode } = useSelector((state: any) => state.theme);
  
  const isOpen = searchParams.get("modal") === "schedule-followup";
  const editFollowUpData = location.state?.followUpData || null;
  const editFollowUpId = location.state?.followUpId || null;
  const isEditMode = !!editFollowUpData;

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
    setReminder: false,
    reminderDateTime: '',
    reminderType: ''
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Get theme-based styles
  const getModalBg = () => darkMode ? 'bg-gray-800' : 'bg-white';
  const getModalTextColor = () => darkMode ? 'text-white' : 'text-[#0d1954]';
  const getSubtitleColor = () => darkMode ? 'text-gray-400' : 'text-slate-500';
  const getCloseButtonColor = () => darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-slate-500 hover:bg-slate-100';
  const getBorderColor = () => darkMode ? 'border-gray-700' : 'border-slate-100';
  const getCheckboxBg = () => darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-slate-300';

  // Populate form data when editing
  useEffect(() => {
    if (isOpen && isEditMode && editFollowUpData) {
      const formatDateForInput = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16);
      };

      setFormData({
        leadStatus: editFollowUpData.leadStatus?._id || editFollowUpData.leadStatus || '',
        type: editFollowUpData.type?._id || editFollowUpData.type || '',
        priority: editFollowUpData.priority || 'medium',
        status: editFollowUpData.status?._id || editFollowUpData.status || '',
        assignTo: editFollowUpData.assignTo?.[0]?._id || editFollowUpData.assignTo?.[0] || '',
        notes: editFollowUpData.notes || '',
        dueDate: formatDateForInput(editFollowUpData.dateTime || editFollowUpData.dueDate),
        setReminder: editFollowUpData.isSetTimer || editFollowUpData.setReminder || false,
        reminderDateTime: formatDateForInput(editFollowUpData.reminderDateTime),
        reminderType: editFollowUpData.reminderType || ''
      });
    }
  }, [isOpen, isEditMode, editFollowUpData]);

  useEffect(() => {
    if (isOpen && tableId) {
      setIsLoading(true);
      Promise.all([
        dispatch(addFollowUp_status() as any),
        dispatch(addFollowUp_Assignto() as any),
        dispatch(addFollowUp_Leadstatus() as any),
        dispatch(addFollowUp_type() as any)
      ]).finally(() => setIsLoading(false));
    }
    return () => { 
      if (!isOpen) {
        resetForm();
        if (location.state?.followUpData) {
          window.history.replaceState({}, document.title);
        }
      }
    };
  }, [isOpen, dispatch, tableId]);

  const resetForm = () => {
    setFormData({ 
      leadStatus: '', type: '', priority: 'medium', status: '', assignTo: '', 
      notes: '', dueDate: '', setReminder: false, reminderDateTime: '', reminderType: ''
    });
    setValidationErrors({});
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (validationErrors[name]) setValidationErrors(prev => ({ ...prev, [name]: '' }));
  };

  const closeModal = () => {
    if (isSubmittingFollowUp) {
      warningAlert("Please wait, follow-up is being processed...", "Okay");
      return;
    }
    const params = new URLSearchParams(searchParams);
    params.delete("modal");
    setSearchParams(params, { state: { activeId: tableId } });
    resetForm();
  };

  // Create handlers
  const handleCreateLeadStatus = async (statusName: string, color: string) => {
    const result = await dispatch(createLeadStatus({ statusName, color }) as any).unwrap();
    await dispatch(addFollowUp_Leadstatus() as any);
    return result;
  };

  const handleCreateInteractionType = async (typeName: string) => {
    const result = await dispatch(createFollowUpType({ typeName }) as any).unwrap();
    await dispatch(addFollowUp_type() as any);
    return result;
  };

  const handleCreateFollowUpStatus = async (statusName: string, color: string) => {
    const result = await dispatch(createFollowUpStatus({ StatusName: statusName, color }) as any).unwrap();
    await dispatch(addFollowUp_status() as any);
    return result;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors: Record<string, string> = {};
    if (!formData.leadStatus) errors.leadStatus = "Lead status is required";
    if (!formData.type) errors.type = "Interaction type is required";
    if (!formData.status) errors.status = "Follow-up status is required";
    if (!formData.assignTo) errors.assignTo = "Please select a team member";
    if (!formData.dueDate) errors.dueDate = "Date & time is required";
    if (formData.setReminder && !formData.reminderDateTime) errors.reminderDateTime = "Reminder time is required";
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      warningAlert("Please fill in all required fields correctly", "Got it");
      return;
    }
    
    if (!tableId) return errorAlert("Lead ID missing! Please refresh.", "Retry");

    const followUpData: any = {
      leadStatus: formData.leadStatus,
      type: formData.type,
      notes: formData.notes,
      assignTo: formData.assignTo ? [formData.assignTo] : [],
      isSetTimer: formData.setReminder,
      priority: formData.priority,
      status: formData.status,
      dateTime: new Date(formData.dueDate).toISOString()
    };
    
    if (formData.setReminder && formData.reminderDateTime) {
      followUpData.reminderDateTime = new Date(formData.reminderDateTime).toISOString();
      followUpData.reminderType = formData.reminderType;
    }

    try {
      let resultAction;
      
      if (isEditMode && editFollowUpId) {
        resultAction = await dispatch(UpdateFollowUp({ 
          tableId: tableId, 
          data: followUpData, 
          followID: editFollowUpId 
        }) as any).unwrap();
        successAlert(resultAction?.message || "Follow-up updated successfully!", "Done", "Success!");
      } else {
        resultAction = await dispatch(createFollowUp({ 
          tableId: tableId, 
          data: { followUps: [followUpData] } 
        }) as any).unwrap();
        successAlert(resultAction?.message || "Follow-up created successfully!", "Done", "Success!");
      }
      
      closeModal();
      setTimeout(() => window.location.reload(), 1500);
    } catch (error: any) {
      errorAlert(error?.message || `Failed to ${isEditMode ? 'update' : 'create'} follow-up`, "Try Again", "Error");
    }
  };

  // Prepare options
  const leadStatusOptions: SelectOption[] = followUpLeadStatuses?.map((item: any) => ({
    label: item.statusName || item.StatusName,
    value: item._id,
    color: item.color
  })) || [];

  const interactionTypeOptions: SelectOption[] = followUpTypes?.map((item: any) => ({
    label: item.typeName || item.TypeName,
    value: item._id
  })) || [];

  const followUpStatusOptions: SelectOption[] = followUpStatuses?.map((item: any) => ({
    label: item.StatusName || item.statusName,
    value: item._id,
    color: item.color
  })) || [];

  const assignToOptions: SelectOption[] = assignToUsers?.map((user: any) => ({
    label: `${user.firstname || ''} ${user.lastname || ''}`.trim() || user.email,
    value: user._id
  })) || [];

  const priorityOptions: SelectOption[] = [
    { label: 'High', value: 'high' },
    { label: 'Medium', value: 'medium' },
    { label: 'Low', value: 'low' }
  ];

  const reminderTypeOptions: SelectOption[] = [
    { label: 'Email', value: 'email' },
    { label: 'SMS', value: 'sms' },
    { label: 'Push Notification', value: 'push' }
  ];

  if (!isOpen) return null;

  if (isLoading) return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
      <div className="relative z-[101]"><RippleLoader /></div>
    </div>
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />

        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className={`relative w-full max-w-3xl rounded-[40px] shadow-2xl overflow-hidden z-[101] ${getModalBg()}`}>
          <div className="p-8 md:p-12 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h2 className={`text-2xl font-black tracking-tight ${getModalTextColor()}`}>
                  {isEditMode ? "Edit Follow-Up" : "Add New Follow-Up"}
                </h2>
                <p className={`text-sm mt-1 ${getSubtitleColor()}`}>
                  {isEditMode ? "Update follow-up details for this lead" : "Schedule and manage follow-up activities for this lead"}
                </p>
              </div>
              <button onClick={closeModal} className={`p-2 rounded-full transition-colors ${getCloseButtonColor()}`}>
                <X size={24} />
              </button>
            </div>

            <form className="space-y-8" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <LeadStatusSelect 
                    label="Lead Status" 
                    value={formData.leadStatus} 
                    onChange={handleChange} 
                    options={leadStatusOptions}
                    error={validationErrors.leadStatus}
                    disabled={isSubmittingFollowUp}
                    onCreateStatus={handleCreateLeadStatus}
                  />
                </div>
                <div>
                  <InteractionTypeSelect 
                    label="Interaction Type" 
                    value={formData.type} 
                    onChange={handleChange} 
                    options={interactionTypeOptions}
                    error={validationErrors.type}
                    disabled={isSubmittingFollowUp}
                    onCreateType={handleCreateInteractionType}
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
                    options={priorityOptions}
                    disabled={isSubmittingFollowUp}
                  />
                </div>
                <div>
                  <FollowUpStatusSelect 
                    label="Follow-up Status" 
                    value={formData.status} 
                    onChange={handleChange} 
                    options={followUpStatusOptions}
                    error={validationErrors.status}
                    disabled={isSubmittingFollowUp}
                    onCreateStatus={handleCreateFollowUpStatus}
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
                    options={assignToOptions}
                    required
                    error={validationErrors.assignTo}
                    disabled={isSubmittingFollowUp}
                    placeholder="Select Team Member"
                  />
                </div>
                <div>
                  <Reusable_Fields
                    type="datetime-local"
                    label="Follow-Up Date & Time"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    required
                    error={validationErrors.dueDate}
                    disabled={isSubmittingFollowUp}
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
                  className={`w-5 h-5 rounded ${getCheckboxBg()}`}
                  style={{ accentColor: primaryColor || '#0d1954' }}
                  disabled={isSubmittingFollowUp}
                />
                <label htmlFor="reminder" className={`text-sm font-bold cursor-pointer select-none ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                  Set specific reminder alarm time
                </label>
              </div>

              {formData.setReminder && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-6 pl-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                    <div>
                      <Reusable_Fields
                        type="datetime-local"
                        label="Reminder Date & Time"
                        name="reminderDateTime"
                        value={formData.reminderDateTime}
                        onChange={handleChange}
                        required
                        error={validationErrors.reminderDateTime}
                        disabled={isSubmittingFollowUp}
                      />
                    </div>
                    <div>
                      <Reusable_Fields
                        type="select"
                        label="Reminder Type"
                        name="reminderType"
                        value={formData.reminderType}
                        onChange={handleChange}
                        options={reminderTypeOptions}
                        disabled={isSubmittingFollowUp}
                        placeholder="Select Reminder Type"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              <div>
                <Reusable_Fields
                  type="textarea"
                  label="Notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  disabled={isSubmittingFollowUp}
                  placeholder="Add any relevant notes about this follow-up..."
                />
              </div>

              <div className={`flex justify-end items-center gap-6 pt-4 border-t ${getBorderColor()}`}>
                <Reusable_Button
                  text="Cancel"
                  variant="ghost"
                  onClick={closeModal}
                  disabled={isSubmittingFollowUp}
                />
                <Reusable_Button
                  text={isSubmittingFollowUp ? (isEditMode ? "Updating..." : "Creating...") : (isEditMode ? "Update Follow-Up" : "Create Follow-Up")}
                  type="submit"
                  variant="primary"
                  icon={isSubmittingFollowUp ? <Loader2 size={18} className="animate-spin" /> : undefined}
                  disabled={isSubmittingFollowUp}
                  className="min-w-[180px]"
                />
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddFollowUp_Model;