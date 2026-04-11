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
  createFollowUpType,
  deleteFollowUpType,
  getFollowUpTypes,
  updateFollowUpType
} from "../../store/settingFollowtypeSlice";
import type { AppDispatch, RootState } from "../../store/Store";

interface FollowUpType {
  _id: string;
  typeName: string;
}

interface ValidationErrors {
  typeName?: string;
}

// Helper function to extract error message from API response
const extractErrorMessage = (error: any): string => {
  let errorMessage = "Error occurred while saving follow-up type. Please try again.";
  
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
    errorMessage = "A follow-up type with this name already exists.";
  }
  
  return errorMessage;
};

const FollowupType = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { primaryColor, darkMode } = useSelector((state: any) => state.theme);
  const {
    types,
    deleteLoading,
    loading,
  } = useSelector((state: RootState) => state.setting);
  
  const [showCreate, setShowCreate] = useState(false);
  const [typeName, setTypeName] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(5);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { permissions } = useSelector((state: any) => state.auth);
  const Roles = permissions[4];

  // Theme-based styles
  const getTextColor = () => darkMode ? 'text-gray-300' : 'text-slate-700';

  useEffect(() => {
    dispatch(getFollowUpTypes());
  }, [dispatch]);

  const tableData: FollowUpType[] =
    types?.map((item: any) => ({
      _id: item?._id,
      typeName: item?.typeName,
    })) || [];

  const columns = [
    {
      title: "Type Name",
      dataIndex: "typeName",
      key: "typeName",
      render: (text: string) => (
        <span className={getTextColor()}>{text}</span>
      ),
    },
  ];

  const pagination = {
    currentPage: page,
    totalItems: tableData?.length,
    itemsPerPage: limit,
    onPageChange: (p: number) => setPage(p),
    onItemsPerPageChange: (l: number) => setLimit(l),
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    
    if (!typeName.trim()) {
      errors.typeName = "Type name is required";
    } else if (typeName.trim().length < 2) {
      errors.typeName = "Type name must be at least 2 characters";
    } else if (typeName.trim().length > 50) {
      errors.typeName = "Type name must be less than 50 characters";
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
        const result = await dispatch(updateFollowUpType({ id: editId, typeName: typeName.trim() })).unwrap();
        const successMsg = result?.message || "Follow-up type updated successfully!";
        successAlert(successMsg, "Done", "Success!");
        
        setShowCreate(false);
        setTypeName("");
        setIsEditMode(false);
        setEditId(null);
      } else {
        const result = await dispatch(createFollowUpType({ typeName: typeName.trim() })).unwrap();
        const successMsg = result?.message || "Follow-up type created successfully!";
        successAlert(successMsg, "Done", "Success!");
        
        setShowCreate(false);
        setTypeName("");
      }
      
      dispatch(getFollowUpTypes());
    } catch (err: any) {
      const errorMessage = extractErrorMessage(err);
      errorAlert(errorMessage, "Try Again", "Submission Failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (record: FollowUpType) => {
    setShowCreate(true);
    setIsEditMode(true);
    setEditId(record?._id);
    setTypeName(record?.typeName);
    setValidationErrors({});
  };

  const handleDeleteClick = (record: FollowUpType) => {
    confirmAlert({
      title: "Delete Type",
      message: `Are you sure you want to delete "${record?.typeName}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      onConfirm: async () => {
        try {
          const result = await dispatch(deleteFollowUpType(record._id)).unwrap();
          const successMsg = result?.message || "Follow-up type deleted successfully!";
          successAlert(successMsg, "Done", "Deleted");
          dispatch(getFollowUpTypes());
        } catch (err: any) {
          const errorMessage = extractErrorMessage(err);
          errorAlert(errorMessage, "Try Again", "Delete Failed");
        }
      },
    });
  };

  const handleCancel = () => {
    if (typeName.trim() || isEditMode) {
      confirmAlert({
        title: "Cancel Changes?",
        message: "You have unsaved changes. Are you sure you want to cancel?",
        confirmText: "Yes, Cancel",
        cancelText: "No, Continue",
        onConfirm: () => {
          setShowCreate(false);
          setTypeName("");
          setIsEditMode(false);
          setEditId(null);
          setValidationErrors({});
        },
      });
    } else {
      setShowCreate(false);
      setTypeName("");
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
            text="Add Type"
            icon={<Plus size={16} />}
            onClick={() => setShowCreate(true)}
            disabled={!Roles?.canCreate || isLoading}
          />
        ) : (
          <div className="flex items-center gap-3 w-full flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <Reusable_Fields
                type="text"
                label="Type Name"
                name="typeName"
                value={typeName}
                onChange={(e) => {
                  setTypeName(e.target.value);
                  if (validationErrors.typeName) {
                    setValidationErrors({});
                  }
                }}
                required
                error={validationErrors.typeName}
                disabled={isLoading}
                placeholder="Enter type name"
              />
            </div>
            
            <Reusable_Button
              text={isSubmitting ? (isEditMode ? "Updating..." : "Creating...") : (isEditMode ? "Update" : "Create")}
              icon={isSubmitting ? undefined : <Check size={16} />}
              onClick={handleSubmit}
              size="px-4 py-2"
              isLoading={isSubmitting}
              disabled={isLoading}
            />
            
            <Reusable_Button
              text="Cancel"
              icon={<X size={16} />}
              variant="outline"
              onClick={handleCancel}
              size="px-4 py-2"
              disabled={isLoading}
            />
          </div>
        )}
      </div>
      
      <Table
        columns={columns}
        data={tableData}
        pagination={pagination}
        enableSearch={true}
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

export default FollowupType;