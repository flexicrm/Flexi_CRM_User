import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, Sparkles, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import Reusable_Button from '../../component/button/Reusable_Button';
import Reusable_Fields from '../../component/Fields/Reusable_Fiealds';
import {
  addFollowUp_Assignto,
  addFollowUp_Leadstatus,
  addFollowUp_status,
  addFollowUp_type,
  createFollowUp
} from '../../store/homepage_slice/Leads_slice';

// Changed tableId to activeId to match our previous safety fix
const AddFollowUp_Model = ({tableId, selectedData} : { tableId: string | null; selectedData: any }) => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  console.log("AddFollowUp_Model received tableId:", selectedData); // Debug log
  
  console.log("AddFollowUp_Model rendered with tableId:", tableId); // Debug log
  
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
    priority: 'medium', // Set default to lowercase
    status: '',
    assignTo: '',
    notes: '',
    dueDate: '',
    setReminder: false
  });

  useEffect(() => {
    if (isOpen) {
      dispatch(addFollowUp_status() as any);
      dispatch(addFollowUp_Assignto() as any);
      dispatch(addFollowUp_Leadstatus() as any);
      dispatch(addFollowUp_type() as any);
    }
  }, [isOpen, dispatch]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const closeModal = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("modal");
    
    // Preserve the ID in the URL state when closing so it doesn't delete!
    setSearchParams(params, { state: { activeId: tableId } });
    
    // Reset Form
    setFormData({ leadStatus: '', type: '', priority: 'medium', status: '', assignTo: '', notes: '', dueDate: '', setReminder: false });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableId) return alert("Lead ID missing!");

    // ============================================
    // EXACT PAYLOAD FORMAT REQUESTED
    // ============================================
    const payload = {
      followUps: [
        {
          leadStatus: formData.leadStatus,
          type: formData.type,
          notes: formData.notes,
          assignTo: formData.assignTo, // As a string, not an array
          isSetTimer: formData.setReminder, // Mapped to isSetTimer
          priority: formData.priority, // "medium", "high", "low"
          status: formData.status,
          ...(formData.dueDate && { dueDate: formData.dueDate }) // Keep dueDate if user selected one
        }
      ]
    };

    const resultAction = await dispatch(createFollowUp({ tableId: tableId, data: payload }) as any);
    if (createFollowUp.fulfilled.match(resultAction)) {
      closeModal();
    } else {
      alert(resultAction.payload || "Failed to create follow-up");
    }
  };

  const fieldStyles = "text-slate-900 bg-white border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 w-full";

  if (!isOpen) return null;

  return (
    <>
      <style>{`select option { background-color: white !important; color: #0f172a !important; } input, select, textarea { color: #0f172a !important; background-color: white !important; }`}</style>

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
                <h2 className="text-2xl font-black text-[#0d1954] tracking-tight">Add New Follow-Up</h2>
                <button 
                    onClick={closeModal} 
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
                >
                  <X size={24} />
                </button>
              </div>

              <form className="space-y-8" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Reusable_Fields
                    type="select"
                    label="Lead Status"
                    name="leadStatus"
                    value={formData.leadStatus}
                    onChange={handleChange}
                    className={fieldStyles}
                    options={followUpLeadStatuses?.map((item: any) => ({
                      label: item.statusName || item.StatusName,
                      value: item._id
                    })) || []}
                  />
                  <Reusable_Fields
                    type="select"
                    label="Interaction Type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className={fieldStyles}
                    options={followUpTypes?.map((item: any) => ({
                      label: item.TypeName || item.name, 
                      value: item._id
                    })) || []}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Reusable_Fields
                    type="select"
                    label="Priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className={fieldStyles}
                    options={[
                      { label: "High", value: "high" }, // value changed to lowercase
                      { label: "Medium", value: "medium" }, // value changed to lowercase
                      { label: "Low", value: "low" } // value changed to lowercase
                    ]}
                  />
                  <Reusable_Fields
                    type="select"
                    label="Follow-up Status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className={fieldStyles}
                    options={followUpStatuses?.map((item: any) => ({
                      label: item.StatusName,
                      value: item._id
                    })) || []}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="w-full">
                    <Reusable_Fields
                      type="select"
                      label="Assign To"
                      name="assignTo"
                      value={formData.assignTo}
                      onChange={handleChange}
                      className={fieldStyles}
                      placeholder="Select team member"
                      options={assignToUsers?.map((user: any) => ({
                        label: `${user.firstname || ''} ${user.lastname || ''}`.trim() || user.name,
                        value: user._id
                      })) || []}
                    />
                  </div>
                  <div className="w-full">
                     <Reusable_Fields
                      type="date"
                      label="Due Date"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleChange}
                      className={fieldStyles}
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
                    className="w-5 h-5 rounded border-slate-300 text-[#0d1954] focus:ring-[#0d1954]" 
                  />
                  <label htmlFor="reminder" className="text-sm font-bold text-slate-700 cursor-pointer">
                    Set reminder
                  </label>
                </div>

                <div className="relative">
                  <div className="absolute top-4 left-5 flex items-center gap-2 z-20 pointer-events-none">
                    <Sparkles size={14} className="text-indigo-500" />
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Explore Ai solution</span>
                  </div>
                  
                  <Reusable_Fields
                    type="textarea"
                    label="Notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    className={`${fieldStyles} pt-6`}
                    placeholder="Use 5 or more words to describe it, then let AI do the rest."
                  />
                </div>

                <div className="flex justify-end items-center gap-6 pt-4">
                  <button 
                    type="button" 
                    onClick={closeModal} 
                    className="text-slate-500 hover:text-slate-800 font-bold text-sm transition-colors disabled:opacity-50"
                    disabled={isSubmittingFollowUp}
                  >
                    Cancel
                  </button>
                  <Reusable_Button 
                    text={isSubmittingFollowUp ? "Submitting..." : "Create Follow-Up"}
                    variant="primary"
                    disabled={isSubmittingFollowUp}
                    className="rounded-2xl px-8 py-4 bg-[#0d1954] text-white hover:bg-[#162a8c] transition-all flex items-center justify-center min-w-[180px]"
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