import { Check, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Reusable_Button from "../../component/button/Reusable_Button";
import Reusable_Fields from "../../component/Fields/Reusable_Fiealds";
import RippleLoader from "../../component/Loader/RippleLoader";
import {
  confirmAlert,
  errorAlert,
  successAlert,
  warningAlert,
} from "../../component/Notification/statusHandler";
import Table from "../../component/table/Table";
import {
  createFollowUpStatus,
  deleteFollowUpStatus,
  getFollowUpStatus,
  updateFollowUpStatus
} from "../../store/settingFollowStatus";
import type { AppDispatch, RootState } from "../../store/Store";

interface FollowUpStatus {
  _id: string;
  StatusName: string;
  color: string;
}

interface ValidationErrors {
  statusName?: string;
}

// Helper function to extract error message from API response
const extractErrorMessage = (error: any): string => {
  let errorMessage = "Error occurred while saving follow-up status. Please try again.";
  
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
  
  if (errorMessage.toLowerCase().includes('duplicate')) {
    errorMessage = "A follow-up status with this name already exists.";
  }
  
  return errorMessage;
};

const FollowupStatus = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { primaryColor, darkMode } = useSelector((state: any) => state.theme);

  const {
    status,
    deleteLoading,
    loading,
  } = useSelector((state: RootState) => state.followStatus);

  const [showCreate, setShowCreate] = useState(false);
  const [statusName, setStatusName] = useState("");
  const [color, setColor] = useState(primaryColor || "#0000FF");
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(5);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { permissions } = useSelector((state: any) => state.auth);
  const Roles = permissions[4];

  // Theme-based styles
  const getLabelColor = () => darkMode ? 'text-gray-300' : 'text-slate-700';
  const getColorPickerBorder = () => darkMode ? 'border-gray-600' : 'border-gray-300';

  useEffect(() => {
    dispatch(getFollowUpStatus());
  }, [dispatch]);

  const tableData =
    status?.map((item: FollowUpStatus) => ({
      _id: item?._id,
      statusName: item?.StatusName,
      color: item?.color,
    })) || [];

  const pagination = {
    currentPage: page,
    totalItems: tableData.length,
    itemsPerPage: limit,
    onPageChange: (p: number) => setPage(p),
    onItemsPerPageChange: (l: number) => setLimit(l),
  };

  const columns = [
    {
      title: "Status Name",
      dataIndex: "statusName",
      key: "statusName",
    },
    {
      title: "Color",
      dataIndex: "color",
      key: "color",
      render: (color: string) => (
        <div className="flex items-center gap-2">
          <div
            style={{
              backgroundColor: color,
              width: 20,
              height: 20,
              borderRadius: 4,
              border: darkMode ? '1px solid #374151' : 'none'
            }}
          />
          <span className={darkMode ? 'text-gray-300' : 'text-slate-700'}>{color}</span>
        </div>
      ),
    },
  ];

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    
    if (!statusName.trim()) {
      errors.statusName = "Status name is required";
    } else if (statusName.trim().length < 2) {
      errors.statusName = "Status name must be at least 2 characters";
    } else if (statusName.trim().length > 50) {
      errors.statusName = "Status name must be less than 50 characters";
    }
    
    setValidationErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      warningAlert("Please fix the validation errors", "Got it");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      if (isEditMode && editId) {
        const result = await dispatch(
          updateFollowUpStatus({
            id: editId,
            StatusName: statusName.trim(),
            color,
          })
        ).unwrap();
        
        const successMsg = result?.message || "Follow-up status updated successfully!";
        successAlert(successMsg, "Done", "Success!");
        
        setShowCreate(false);
        setStatusName("");
        setColor(primaryColor || "#0000FF");
        setIsEditMode(false);
        setEditId(null);
      } else {
        const result = await dispatch(
          createFollowUpStatus({
            StatusName: statusName.trim(),
            color,
          })
        ).unwrap();
        
        const successMsg = result?.message || "Follow-up status created successfully!";
        successAlert(successMsg, "Done", "Success!");
        
        setShowCreate(false);
        setStatusName("");
        setColor(primaryColor || "#0000FF");
      }
      
      dispatch(getFollowUpStatus());
    } catch (err: any) {
      const errorMessage = extractErrorMessage(err);
      errorAlert(errorMessage, "Try Again", "Submission Failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (record: any) => {
    setShowCreate(true);
    setIsEditMode(true);
    setEditId(record._id);
    setStatusName(record.statusName);
    setColor(record.color);
    setValidationErrors({});
  };

  const handleDeleteClick = (record: any) => {
    confirmAlert({
      title: "Delete Status",
      message: `Are you sure you want to delete "${record?.statusName}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      onConfirm: async () => {
        try {
          const result = await dispatch(deleteFollowUpStatus(record._id)).unwrap();
          const successMsg = result?.message || "Follow-up status deleted successfully!";
          successAlert(successMsg, "Done", "Deleted");
          dispatch(getFollowUpStatus());
        } catch (err: any) {
          const errorMessage = extractErrorMessage(err);
          errorAlert(errorMessage, "Try Again", "Delete Failed");
        }
      },
    });
  };

  const handleCancel = () => {
    if (statusName.trim() || isEditMode) {
      confirmAlert({
        title: "Cancel Changes?",
        message: "You have unsaved changes. Are you sure you want to cancel?",
        confirmText: "Yes, Cancel",
        cancelText: "No, Continue",
        onConfirm: () => {
          setShowCreate(false);
          setStatusName("");
          setColor(primaryColor || "#0000FF");
          setIsEditMode(false);
          setEditId(null);
          setValidationErrors({});
        },
      });
    } else {
      setShowCreate(false);
      setStatusName("");
      setColor(primaryColor || "#0000FF");
      setIsEditMode(false);
      setEditId(null);
      setValidationErrors({});
    }
  };

  const isLoading = loading || deleteLoading || isSubmitting;

  return (
    <>
      {isLoading && <RippleLoader />}
      
      <div className="flex justify-end mb-4">
        {!showCreate ? (
          <Reusable_Button
            text="Add Status"
            icon={<Plus size={16} />}
            onClick={() => setShowCreate(true)}
            disabled={!Roles?.canCreate || isLoading}
          />
        ) : (
          <div className="flex items-center gap-3 w-full flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <Reusable_Fields
                type="text"
                label="Status Name"
                name="statusName"
                value={statusName}
                onChange={(e) => {
                  setStatusName(e.target.value);
                  if (validationErrors.statusName) {
                    setValidationErrors({});
                  }
                }}
                required
                error={validationErrors.statusName}
                disabled={isLoading}
                placeholder="Enter status name"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className={`text-sm font-medium ${getLabelColor()}`}>Color:</label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className={`w-12 h-10 border rounded cursor-pointer ${getColorPickerBorder()}`}
                disabled={isLoading}
              />
            </div>

            <Reusable_Button
              text={isSubmitting ? (isEditMode ? "Updating..." : "Creating...") : (isEditMode ? "Update" : "Create")}
              icon={isSubmitting ? undefined : <Check size={16} />}
              onClick={handleSubmit}
              isLoading={isSubmitting}
              disabled={isLoading}
            />

            <Reusable_Button
              text="Cancel"
              icon={<X size={16} />}
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            />
          </div>
        )}
      </div>

      <Table
        columns={columns}
        data={tableData}
        pagination={pagination}
        enableSearch
        actionButtons={{
          showEdit: true,
          showDelete: true,
          onEdit: Roles?.canRead ? handleEditClick : undefined,
          onDelete: Roles?.canDelete ? handleDeleteClick : undefined,
        }}
        theme={{ darkMode, primaryColor }}
      />
    </>
  );
};

export default FollowupStatus;