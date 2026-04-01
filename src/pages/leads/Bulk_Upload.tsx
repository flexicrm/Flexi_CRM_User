import { AlertCircle, CheckCircle2, FileType, Loader2, UploadCloud, X } from 'lucide-react';
import React, { useCallback, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as XLSX from 'xlsx';
import Reusable_Button from '../../component/button/Reusable_Button';
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

interface BulkUploadProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

const Bulk_Upload: React.FC<BulkUploadProps> = ({ onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const { isCreating } = useSelector((state: any) => state.leads);

  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedData, setUploadedData] = useState<UploadedData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
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

    // Add column widths
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
          
          // Validate data structure and map to correct fields
          const validatedData = jsonData.map(row => ({
            name: row.name || row.Name || '',
            email: row.email || row.Email || '',
            mobileNo: row.mobileNo || row.MobileNo || row.mobile || row.phone || '',
            company: row.company || row.Company || '',
            jobTitle: row.jobTitle || row.JobTitle || '',
            website: row.website || row.Website || '',
            leadsource: row.leadsource || row.LeadSource || row.leadsource || ''
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
      setError('Please upload valid Excel files (.xls or .xlsx)');
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
        setError('Please upload valid Excel files (.xls or .xlsx)');
        return;
      }

      await processFiles(selectedFiles);
    }
  };

  // Process multiple files
  const processFiles = async (newFiles: File[]) => {
    setError(null);
    setUploadProgress(0);
    
    try {
      const allData: UploadedData[] = [];
      
      for (let i = 0; i < newFiles.length; i++) {
        const file = newFiles[i];
        const data = await processExcelFile(file);
        allData.push(...data);
        setUploadProgress(((i + 1) / newFiles.length) * 100);
      }
      
      if (allData.length === 0) {
        setError('No valid data found in the uploaded files');
        return;
      }
      
      setFiles((prev) => [...prev, ...newFiles]);
      setUploadedData((prev) => [...prev, ...allData]);
      setSuccess(`Successfully loaded ${allData.length} records from ${newFiles.length} file(s)`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error processing files');
    } finally {
      setUploadProgress(0);
    }
  };

  // Remove file and its data
  const removeFile = (fileIndex: number) => {
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
  };

  // Remove individual data row
  const removeDataRow = (index: number) => {
    setUploadedData((prev) => prev.filter((_, i) => i !== index));
  };

  // Clear all data
  const clearAll = () => {
    setFiles([]);
    setUploadedData([]);
    setError(null);
    setSuccess(null);
  };

  // Handle upload to API with correct payload structure
  const handleUpload = async () => {
    if (uploadedData.length === 0) {
      setError('No data to upload. Please add some records first.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccess(null);

    // Prepare the leads array for bulk upload
    const leadsArray: any[] = [];
    const errors: string[] = [];

    // Validate and prepare each record
    for (let i = 0; i < uploadedData.length; i++) {
      const record = uploadedData[i];
      
      // Validate required fields
      if (!record.name || !record.email || !record.mobileNo) {
        errors.push(`Row ${i + 1}: Missing required fields (name, email, or mobileNo)`);
        continue;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(record.email)) {
        errors.push(`Row ${i + 1}: Invalid email format - ${record.email}`);
        continue;
      }

      // Validate mobile number
      const mobileRegex = /^[0-9+\-\s()]{10,15}$/;
      if (!mobileRegex.test(record.mobileNo)) {
        errors.push(`Row ${i + 1}: Invalid mobile number format - ${record.mobileNo}`);
        continue;
      }

      // Prepare lead data in the correct format
      leadsArray.push({
        name: record.name,
        email: record.email,
        mobileNo: record.mobileNo,
        company: record.company || '',
        jobTitle: record.jobTitle || '',
        website: record.website || '',
        leadsource: record.leadsource || 'Bulk Upload'
      });
    }

    // If there are validation errors, show them and stop
    if (errors.length > 0) {
      setError(`Validation failed for ${errors.length} record(s):\n${errors.join('\n')}`);
      setIsUploading(false);
      return;
    }

    // If no valid leads to upload
    if (leadsArray.length === 0) {
      setError('No valid leads to upload. Please check the data format.');
      setIsUploading(false);
      return;
    }

    try {
      // Prepare the payload with leads array
      const payload = {
        leads: leadsArray
      };

      // Update progress to show uploading started
      setUploadProgress(0);

      // Dispatch bulk upload action with the correct payload structure
      await dispatch(ImportLead(payload)).unwrap();
      
      setUploadProgress(100);
      setSuccess(`Successfully uploaded ${leadsArray.length} lead(s).`);
      
      // Refresh leads list
      dispatch(fetchLeads());
      
      // Clear data after successful upload
      setTimeout(() => {
        clearAll();
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      }, 2000);
      
    } catch (err: any) {
      setError(err.message || 'Failed to upload leads. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
      // Reset progress after a delay
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  // Trigger file input
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-[2rem] p-8 border-2 border-dashed border-slate-200 flex flex-col shadow-2xl shadow-slate-100">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          <div className="w-16 h-16 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-600 mb-4">
            <UploadCloud size={32} />
          </div>
          <h2 className="text-2xl font-black text-[#0d1954] mb-2">Bulk Upload Leads</h2>
          <p className="text-slate-500">
            Upload your CSV or Excel file to import multiple leads at once.
            <br />
            <span className="text-xs">Supported formats: .xls, .xlsx</span>
          </p>
        </div>
        
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        )}
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <button
          onClick={handleDownloadSample}
          className="p-4 bg-slate-50 rounded-2xl flex items-center gap-3 text-left hover:bg-slate-100 transition-colors group"
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
      {success && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <CheckCircle2 size={18} className="text-green-600" />
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle size={18} className="text-red-600" />
            <p className="text-sm font-medium text-red-700">Upload Error</p>
          </div>
          <p className="text-sm text-red-600 whitespace-pre-line">{error}</p>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-700">Selected Files ({files.length})</h3>
            <button
              onClick={clearAll}
              className="text-xs text-red-600 hover:text-red-700"
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
                  className="p-1 hover:bg-gray-200 rounded-full transition-colors"
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
                {uploadedData.slice(0, 10).map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
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
                        className="text-red-600 hover:text-red-800"
                      >
                        <X size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
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
          />
        )}
        <Reusable_Button
          text={isUploading ? "Uploading..." : "Upload Data"}
          size="lg"
          onClick={handleUpload}
          disabled={uploadedData.length === 0 || isUploading}
          className="flex-1"
          icon={isUploading ? <Loader2 size={18} className="animate-spin" /> : undefined}
        />
      </div>
    </div>
  );
};

export default Bulk_Upload;