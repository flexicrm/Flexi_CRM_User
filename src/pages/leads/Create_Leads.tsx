import { Briefcase, Building2, ChevronLeft, Globe, Landmark, Mail, Phone, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import Reusable_Button from '../../component/button/Reusable_Button';
import Reusable_Fields from '../../component/Fields/Reusable_Fiealds';
import { errorAlert, successAlert } from '../../component/Notification/statusHandler';
import { createLead, fetchSources, fetchStatuses, fetchUsers, updateLead } from '../../store/homepage_slice/Leads_slice';

// Helper function to extract error message from API response
const extractErrorMessage = (error: any): string => {
  let errorMessage = "Failed to process request. Please try again.";
  
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
  
  return errorMessage;
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

    const handleSubmit = async () => {
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
            const errorMessage = extractErrorMessage(error);
            errorAlert(errorMessage, "Retry");
            console.error("Error:", error);
        }
    };

    return (
        <div className="p-8 bg-[#f8fafc] min-h-screen">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#0d1954] font-bold mb-8 transition-all hover:translate-x-[-4px]">
                <ChevronLeft size={22} /> Back to Leads
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <section className="bg-white p-10 rounded-[35px] shadow-sm border border-slate-100">
                    <h2 className="text-2xl font-bold text-[#0d1954] mb-8">Contact Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Reusable_Fields label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} icon={<User size={18}/>} />
                        <Reusable_Fields label="Email" name="email" value={formData.email} onChange={handleChange} icon={<Mail size={18}/>} />
                        <Reusable_Fields label="Mobile" name="mobile" value={formData.mobile} onChange={handleChange} icon={<Phone size={18}/>} />
                        <Reusable_Fields label="Job Title" name="jobTitle" value={formData.jobTitle} onChange={handleChange} icon={<Briefcase size={18}/>} />
                        <Reusable_Fields label="Website" name="website" value={formData.website} onChange={handleChange} icon={<Globe size={18}/>} />
                        <Reusable_Fields label="Company" name="companyName" value={formData.companyName} onChange={handleChange} icon={<Building2 size={18}/>} />
                    </div>
                </section>

                <section className="bg-white p-10 rounded-[35px] shadow-sm border border-slate-100">
                    <h2 className="text-2xl font-bold text-[#0d1954] mb-8">Lead Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <Reusable_Fields type="select" label="Status" name="status" options={statusOptions?.map((s:any)=>({label: s.statusName, value: s._id}))} value={formData.status} onChange={handleChange} />
                        <Reusable_Fields type="select" label="Source" name="source" options={sourceOptions?.map((s:any)=>({label: s.sourceName, value: s.sourceName}))} value={formData.source} onChange={handleChange} />
                        <Reusable_Fields label="Value" name="potentialValue" type="number" value={formData.potentialValue} onChange={handleChange} icon={<Landmark size={18} />} />
                        <Reusable_Fields type="select" label="Assign To" name="assignedTo" options={userOptions?.map((u:any)=>({label: u.firstname, value: u._id}))} value={formData.assignedTo} onChange={handleChange} />
                    </div>
                    <Reusable_Fields type="textarea" name="notes" label="Notes" value={formData.notes} onChange={handleChange} />
                </section>
            </div>

            <div className="flex justify-end mt-12">
                <Reusable_Button 
                    text={editData ? (isUpdating ? "Updating..." : "Update Lead") : (isCreating ? "Saving..." : "Create Lead")}
                    variant="primary"
                    className="px-16 py-4 rounded-2xl font-bold bg-[#0d1954] text-white"
                    onClick={handleSubmit}
                />
            </div>
        </div>
    );
};

export default Create_Leads;