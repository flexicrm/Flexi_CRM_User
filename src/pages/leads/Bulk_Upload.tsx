import { AlertCircle, CheckCircle2, FileType, Loader2, UploadCloud, X } from 'lucide-react';
import React, { useCallback, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as XLSX from 'xlsx';
import Reusable_Button from '../../component/button/Reusable_Button';
import RippleLoader from '../../component/Loader/RippleLoader';
import { confirmAlert, errorAlert, successAlert, warningAlert } from '../../component/Notification/statusHandler';
import { ImportLead, fetchLeads } from '../../store/homepage_slice/Leads_slice';

interface UploadedData {
  name?: string;
  email?: string;
  mobileNo?: string;
  company?: string;
  jobTitle?: string;
  website?: string;
  leadsource?: string;
  [key: string]: any;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
  value: string;
}

interface BulkUploadProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

// Helper function to extract error message from API response
const extractErrorMessage = (error: any): string => {
  let errorMessage = "Error occurred while uploading leads. Please try again.";
  
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
    errorMessage = "Some leads already exist in the system. Please check and try again.";
  }
  if (errorMessage.toLowerCase().includes('validation')) {
    errorMessage = "Please check the data format and try again.";
  }
  if (errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('connection')) {
    errorMessage = "Network error. Please check your internet connection and try again.";
  }
  
  return errorMessage;
};

const Bulk_Upload: React.FC<BulkUploadProps> = ({ onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const { isCreating } = useSelector((state: any) => state.leads);
  
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedData, setUploadedData] = useState<UploadedData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedFileTypes = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.xls',
    '.xlsx'
  ];

  // Download sample template
  const handleDownloadSample = () => {
    const sampleData = [
      {
        name: 'John Doe',
        email: 'john.doe@example.com',
        mobileNo: '+91 9876543210',
        company: 'ABC Corp',
        jobTitle: 'Senior Developer',
        website: 'https://example.com',
        leadsource: 'Facebook'
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        mobileNo: '+91 9876543211',
        company: 'XYZ Ltd',
        jobTitle: 'Product Manager',
        website: 'https://xyz.com',
        leadsource: 'LinkedIn'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sample_Leads');

    worksheet['!cols'] = [
      { wch: 20 }, // name
      { wch: 25 }, // email
      { wch: 15 }, // mobileNo
      { wch: 20 }, // company
      { wch: 20 }, // jobTitle
      { wch: 30 }, // website
      { wch: 15 }  // leadsource
    ];

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(data);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'Sample_Lead_Upload_Template.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    successAlert("Sample template downloaded successfully!", "Great!", "Download Ready");
  };

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // Validate single record
  const validateRecord = (record: UploadedData, index: number): ValidationError[] => {
    const errors: ValidationError[] = [];
    
    // Validate name
    if (!record.name || record.name.trim() === '') {
      errors.push({
        row: index + 1,
        field: 'name',
        message: 'Name is required',
        value: record.name || ''
      });
    } else if (record.name.length < 2) {
      errors.push({
        row: index + 1,
        field: 'name',
        message: 'Name must be at least 2 characters',
        value: record.name
      });
    }
    
    // Validate email
    if (!record.email || record.email.trim() === '') {
      errors.push({
        row: index + 1,
        field: 'email',
        message: 'Email is required',
        value: record.email || ''
      });
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(record.email)) {
        errors.push({
          row: index + 1,
          field: 'email',
          message: 'Invalid email format',
          value: record.email
        });
      }
    }
    
    // Validate mobile number
    if (!record.mobileNo || record.mobileNo.trim() === '') {
      errors.push({
        row: index + 1,
        field: 'mobileNo',
        message: 'Mobile number is required',
        value: record.mobileNo || ''
      });
    } else {
      const mobileRegex = /^[0-9+\-\s()]{10,15}$/;
      if (!mobileRegex.test(record.mobileNo)) {
        errors.push({
          row: index + 1,
          field: 'mobileNo',
          message: 'Invalid mobile number format (10-15 digits)',
          value: record.mobileNo
        });
      }
    }
    
    return errors;
  };

  // Process Excel file
  const processExcelFile = (file: File): Promise<UploadedData[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          if (!workbook.SheetNames.length) {
            reject(new Error('No sheets found in the Excel file'));
            return;
          }
          
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json<UploadedData>(worksheet);
          
          if (jsonData.length === 0) {
            reject(new Error('No data found in the Excel file'));
            return;
          }
          
          // Validate and map data
          const validatedData = jsonData.map(row => ({
            name: row.name || row.Name || '',
            email: row.email || row.Email || '',
            mobileNo: row.mobileNo || row.MobileNo || row.mobile || row.phone || '',
            company: row.company || row.Company || '',
            jobTitle: row.jobTitle || row.JobTitle || '',
            website: row.website || row.Website || '',
            leadsource: row.leadsource || row.LeadSource || row.leadsource || 'Bulk Upload'
          }));
          
          resolve(validatedData);
        } catch (err) {
          reject(new Error('Error processing Excel file. Please check the format.'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
      
      reader.readAsArrayBuffer(file);
    });
  };

  // Handle file drop
  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (file) => acceptedFileTypes.some(type => file.type === type || file.name.endsWith(type))
    );

    if (droppedFiles.length === 0) {
      errorAlert('Please upload valid Excel files (.xls or .xlsx)', 'Okay', 'Invalid File');
      return;
    }

    await processFiles(droppedFiles);
  }, []);

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).filter(
        (file) => acceptedFileTypes.some(type => file.type === type || file.name.endsWith(type))
      );

      if (selectedFiles.length === 0) {
        errorAlert('Please upload valid Excel files (.xls or .xlsx)', 'Okay', 'Invalid File');
        return;
      }

      await processFiles(selectedFiles);
    }
  };

  // Process multiple files
  const processFiles = async (newFiles: File[]) => {
    setError(null);
    setValidationErrors([]);
    setUploadProgress(0);
    setIsProcessing(true);
    
    try {
      const allData: UploadedData[] = [];
      let totalRecords = 0;
      
      for (let i = 0; i < newFiles.length; i++) {
        const file = newFiles[i];
        const data = await processExcelFile(file);
        allData.push(...data);
        totalRecords += data.length;
        setUploadProgress(((i + 1) / newFiles.length) * 100);
      }
      
      if (allData.length === 0) {
        warningAlert('No valid data found in the uploaded files', 'Got it');
        return;
      }
      
      // Validate all records
      const allValidationErrors: ValidationError[] = [];
      allData.forEach((record, index) => {
        const recordErrors = validateRecord(record, index);
        allValidationErrors.push(...recordErrors);
      });
      
      if (allValidationErrors.length > 0) {
        setValidationErrors(allValidationErrors);
        const errorSummary = `${allValidationErrors.length} validation error(s) found. Please fix them before uploading.`;
        errorAlert(errorSummary, 'View Errors', 'Validation Failed');
        return;
      }
      
      setFiles((prev) => [...prev, ...newFiles]);
      setUploadedData((prev) => [...prev, ...allData]);
      
      const successMsg = `Successfully loaded ${allData.length} records from ${newFiles.length} file(s)`;
      setSuccess(successMsg);
      successAlert(successMsg, 'Great!', 'Data Loaded');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error processing files';
      setError(errorMsg);
      errorAlert(errorMsg, 'Try Again', 'Processing Error');
    } finally {
      setIsProcessing(false);
      setUploadProgress(0);
    }
  };

  // Remove file and its data
  const removeFile = (fileIndex: number) => {
    confirmAlert({
      title: 'Remove File?',
      message: 'This will remove all records from this file. Are you sure?',
      confirmText: 'Remove',
      cancelText: 'Cancel',
      onConfirm: () => {
        // Calculate how many records belong to this file
        let recordsToRemove = 0;
        let recordStartIndex = 0;
        
        for (let i = 0; i <= fileIndex; i++) {
          if (i === fileIndex) {
            recordsToRemove = uploadedData.slice(recordStartIndex).length;
          } else {
            recordStartIndex += uploadedData.slice(recordStartIndex).length;
          }
        }
        
        setFiles((prev) => prev.filter((_, i) => i !== fileIndex));
        setUploadedData((prev) => prev.filter((_, i) => i < recordStartIndex || i >= recordStartIndex + recordsToRemove));
        setValidationErrors([]);
        successAlert('File removed successfully', 'Done');
      }
    });
  };

  // Remove individual data row
  const removeDataRow = (index: number) => {
    confirmAlert({
      title: 'Remove Record?',
      message: `Are you sure you want to remove this record?`,
      confirmText: 'Remove',
      cancelText: 'Cancel',
      onConfirm: () => {
        setUploadedData((prev) => prev.filter((_, i) => i !== index));
        // Re-validate remaining records
        const remainingErrors: ValidationError[] = [];
        uploadedData.forEach((record, idx) => {
          if (idx !== index) {
            const recordErrors = validateRecord(record, idx);
            remainingErrors.push(...recordErrors);
          }
        });
        setValidationErrors(remainingErrors);
        successAlert('Record removed successfully', 'Done');
      }
    });
  };

  // Clear all data
  const clearAll = () => {
    if (files.length === 0 && uploadedData.length === 0) {
      warningAlert('No data to clear', 'Okay');
      return;
    }
    
    confirmAlert({
      title: 'Clear All Data?',
      message: `This will remove ${files.length} file(s) and ${uploadedData.length} record(s). This action cannot be undone.`,
      confirmText: 'Clear All',
      cancelText: 'Cancel',
      onConfirm: () => {
        setFiles([]);
        setUploadedData([]);
        setValidationErrors([]);
        setError(null);
        setSuccess(null);
        successAlert('All data cleared successfully', 'Done');
      }
    });
  };

  // Handle upload to API
  const handleUpload = async () => {
    if (uploadedData.length === 0) {
      warningAlert('No data to upload. Please add some records first.', 'Add Data');
      return;
    }

    if (validationErrors.length > 0) {
      errorAlert(`Please fix ${validationErrors.length} validation error(s) before uploading.`, 'Fix Errors', 'Validation Failed');
      return;
    }

    confirmAlert({
      title: 'Confirm Upload',
      message: `You are about to upload ${uploadedData.length} lead(s). Do you want to proceed?`,
      confirmText: 'Upload',
      cancelText: 'Cancel',
      onConfirm: async () => {
        await performUpload();
      }
    });
  };

  const performUpload = async () => {
    setIsUploading(true);
    setError(null);
    setSuccess(null);

    // Prepare the leads array for bulk upload
    const leadsArray: any[] = [];

    // Prepare each record
    for (let i = 0; i < uploadedData.length; i++) {
      const record = uploadedData[i];
      
      leadsArray.push({
        name: record.name?.trim(),
        email: record.email?.trim().toLowerCase(),
        mobileNo: record.mobileNo?.trim(),
        company: record.company?.trim() || '',
        jobTitle: record.jobTitle?.trim() || '',
        website: record.website?.trim() || '',
        leadsource: record.leadsource?.trim() || 'Bulk Upload'
      });
    }

    try {
      // Prepare the payload with leads array
      const payload = {
        leads: leadsArray
      };

      console.log('Upload Payload:', payload);

      // Simulate progress for better UX
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // Dispatch the upload action
      const result = await dispatch(ImportLead(payload) as any).unwrap();
      
      setUploadProgress(100);
      
      // Extract success message from API response
      const successMsg = result?.message || 
                        result?.data?.message || 
                        `${leadsArray.length} lead(s) uploaded successfully!`;
      
      successAlert(successMsg, 'Great!', 'Upload Complete');
      
      // Refresh leads list
      dispatch(fetchLeads() as any);
      
      // Clear data after successful upload
      setTimeout(() => {
        clearAll();
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      }, 2000);
      
    } catch (err: any) {
      const errorMessage = extractErrorMessage(err);
      
      // Categorize errors for better UX
      if (errorMessage.toLowerCase().includes('duplicate')) {
        errorAlert(errorMessage, 'Remove Duplicates', 'Duplicate Records');
      } else if (errorMessage.toLowerCase().includes('validation')) {
        errorAlert(errorMessage, 'Fix Data', 'Validation Error');
      } else if (errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('connection')) {
        errorAlert('Network error. Please check your internet connection and try again.', 'Retry', 'Connection Error');
      } else {
        errorAlert(errorMessage, 'Try Again', 'Upload Failed');
      }
      
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
      // Reset progress after a delay
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  // Trigger file input
  const triggerFileInput = () => {
    if (!isUploading && !isProcessing) {
      fileInputRef.current?.click();
    }
  };

  const isLoading = isUploading || isProcessing || isCreating;

  return (
    <>
      {/* Global Loader */}
      {isLoading && <RippleLoader />}
      
      <div className="max-w-4xl mx-auto bg-white rounded-[2rem] p-8 border-2 border-dashed border-slate-200 flex flex-col shadow-2xl shadow-slate-100">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <div className="w-16 h-16 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-600 mb-4">
              <UploadCloud size={32} />
            </div>
            <h2 className="text-2xl font-black text-[#0d1954] mb-2">Bulk Upload Leads</h2>
            <p className="text-slate-500">
              Upload your Excel file to import multiple leads at once.
              <br />
              <span className="text-xs">Supported formats: .xls, .xlsx</span>
            </p>
          </div>
          
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              <X size={20} className="text-gray-500" />
            </button>
          )}
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            onClick={handleDownloadSample}
            className="p-4 bg-slate-50 rounded-2xl flex items-center gap-3 text-left hover:bg-slate-100 transition-colors group disabled:opacity-50"
            disabled={isLoading}
          >
            <FileType className="text-emerald-500 group-hover:scale-110 transition-transform" size={24} />
            <div>
              <p className="text-xs font-bold text-slate-700">Download Template</p>
              <p className="text-[10px] text-slate-400">Sample Excel File</p>
            </div>
          </button>
          <div className="p-4 bg-slate-50 rounded-2xl flex items-center gap-3 text-left">
            <CheckCircle2 className="text-indigo-500" size={24} />
            <div>
              <p className="text-xs font-bold text-slate-700">Auto Validation</p>
              <p className="text-[10px] text-slate-400">Data format checking</p>
            </div>
          </div>
        </div>

        {/* Drag and Drop Area */}
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={triggerFileInput}
          className={`
            relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer
            transition-all duration-200
            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            ${isDragging 
              ? 'border-indigo-500 bg-indigo-50' 
              : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            accept=".xls,.xlsx"
            multiple
            className="hidden"
            disabled={isLoading}
          />
          
          <UploadCloud 
            size={48} 
            className={`mx-auto mb-4 transition-colors ${isDragging ? 'text-indigo-600' : 'text-gray-400'}`} 
          />
          
          <p className="text-gray-600 mb-2">
            {isDragging ? 'Drop your files here' : 'Drag and drop Excel files here'}
          </p>
          <p className="text-sm text-gray-400">or click to browse</p>
          <p className="text-xs text-gray-400 mt-2">Supports: .xls, .xlsx (max 10MB per file)</p>
        </div>

        {/* Upload Progress */}
        {isUploading && uploadProgress > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Uploading...</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && !isUploading && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircle2 size={18} className="text-green-600" />
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        {/* Error Message */}
        {error && !isUploading && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle size={18} className="text-red-600" />
              <p className="text-sm font-medium text-red-700">Upload Error</p>
            </div>
            <p className="text-sm text-red-600 whitespace-pre-line">{error}</p>
          </div>
        )}

        {/* Validation Errors Summary */}
        {validationErrors.length > 0 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={18} className="text-yellow-600" />
              <p className="text-sm font-medium text-yellow-700">
                Validation Errors ({validationErrors.length})
              </p>
            </div>
            <div className="max-h-32 overflow-y-auto">
              {validationErrors.slice(0, 5).map((err, idx) => (
                <p key={idx} className="text-xs text-yellow-600">
                  Row {err.row}: {err.field} - {err.message} (Value: {err.value || 'empty'})
                </p>
              ))}
              {validationErrors.length > 5 && (
                <p className="text-xs text-yellow-600 mt-1">
                  + {validationErrors.length - 5} more errors
                </p>
              )}
            </div>
          </div>
        )}

        {/* File List */}
        {files.length > 0 && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-700">Selected Files ({files.length})</h3>
              <button
                onClick={clearAll}
                className="text-xs text-red-600 hover:text-red-700 disabled:opacity-50"
                disabled={isLoading}
              >
                Clear all
              </button>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <FileType size={16} className="text-gray-500" />
                    <span className="text-sm text-gray-700 truncate max-w-[200px]">
                      {file.name}
                    </span>
                    <span className="text-xs text-gray-400">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="p-1 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50"
                    disabled={isLoading}
                  >
                    <X size={14} className="text-gray-500" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Data Preview Table */}
        {uploadedData.length > 0 && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-700">
                Data Preview ({uploadedData.length} records)
              </h3>
              <span className="text-xs text-gray-500">
                Scroll to view all columns
              </span>
            </div>
            
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Website</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lead Source</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {uploadedData.slice(0, 10).map((row, index) => {
                    const hasError = validationErrors.some(e => e.row === index + 1);
                    return (
                      <tr key={index} className={`hover:bg-gray-50 ${hasError ? 'bg-yellow-50' : ''}`}>
                        <td className="px-4 py-2 text-sm text-gray-900">{row.name || '-'}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">{row.email || '-'}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">{row.mobileNo || '-'}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">{row.company || '-'}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">{row.jobTitle || '-'}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">{row.website || '-'}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">{row.leadsource || '-'}</td>
                        <td className="px-4 py-2 text-sm">
                          <button
                            onClick={() => removeDataRow(index)}
                            className="text-red-600 hover:text-red-800 disabled:opacity-50"
                            disabled={isLoading}
                          >
                            <X size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {uploadedData.length > 10 && (
                <div className="p-3 bg-gray-50 text-center text-sm text-gray-500">
                  + {uploadedData.length - 10} more records
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mt-8">
          {onClose && (
            <Reusable_Button
              text="Cancel"
              size="lg"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            />
          )}
          <Reusable_Button
            text={isUploading ? "Uploading..." : "Upload Data"}
            size="lg"
            onClick={handleUpload}
            disabled={uploadedData.length === 0 || isLoading}
            className="flex-1"
            icon={isUploading ? <Loader2 size={18} className="animate-spin" /> : undefined}
          />
        </div>
      </div>
    </>
  );
};

export default Bulk_Upload;