import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowUpDown,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Circle,
  CircleDot,
  Columns,
  Edit3,
  Eye,
  Filter,
  MoreVertical,
  Power,
  PowerOff,
  Search,
  Trash2,
  Users,
  X
} from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

// --- Types ---
export interface Column {
  title: string;
  dataIndex: string;
  key: string;
  width?: string;
  minWidth?: string;
  maxWidth?: string;
  render?: (text: any, record: any, index: number) => React.ReactNode;
  filterable?: boolean;
  sortable?: boolean;
  filterType?: 'text' | 'select' | 'date' | 'status';
  filterOptions?: Array<{ label: string; value: string }>;
}

export interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
}

export interface StatusFilterOption {
  label: string;
  value: string;
  type: 'active' | 'inactive';
  color?: string;
}

export interface TableProps {
  columns: Column[];
  data: any[];
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  showSelection?: boolean;
  onSelectionChange?: (selectedRows: any[]) => void;
  enableSearch?: boolean;
  searchPlaceholder?: string;
  onSearch?: (term: string) => void;
  pagination?: PaginationProps;
  enableColumnFilter?: boolean;
  statusOptions?: StatusFilterOption[];
  onStatusFilter?: (status: string | null, type?: 'active' | 'inactive') => void;
  activeStatus?: string | null;
  activeStatusType?: 'active' | 'inactive' | null;
  actionButtons?: {
    showView?: boolean;
    showEdit?: boolean;
    showDelete?: boolean;
    showFollowUp?: boolean;
    showConvert?: boolean;
    onView?: (record: any) => void;
    onEdit?: (record: any) => void;
    onDelete?: (record: any) => void;
    onFollowUp?: (record: any) => void;
    onConvert?: (record: any) => void;
  } | boolean;
  onRowClick?: (record: any) => void;
  rowClickable?: boolean;
  rowClassName?: (record: any, index: number) => string;
  tableHeight?: string | number; // NEW: Custom table height
  tableMaxHeight?: string | number; // NEW: Custom max height
  stickyHeader?: boolean; // NEW: Sticky header option
}

// Loading Dots Animation Component
const LoadingDots = () => {
  return (
    <div className="flex items-center justify-center gap-2 py-16">
      {[0, 1, 2].map((dot) => (
        <motion.div
          key={dot}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, repeat: Infinity, delay: dot * 0.2 }}
          className="w-2.5 h-2.5 bg-indigo-500 rounded-full"
        />
      ))}
    </div>
  );
};

// Status Column Filter Popup
const StatusColumnFilterPopup = ({ isOpen, onClose, onFilter, currentFilter, triggerRect }: any) => {
  const [filterValue, setFilterValue] = useState(currentFilter || '');
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (isOpen && triggerRect) {
      let top = triggerRect.bottom + window.scrollY + 8;
      let left = triggerRect.left + window.scrollX;
      if (top + 250 > window.innerHeight + window.scrollY) top = triggerRect.top + window.scrollY - 250 - 8;
      if (left + 250 > window.innerWidth + window.scrollX) left = window.innerWidth + window.scrollX - 250 - 16;
      setPosition({ top, left });
    }
  }, [isOpen, triggerRect]);

  const handleApply = (value: string) => { setFilterValue(value); onFilter(value); onClose(); };
  const handleClear = () => { setFilterValue(''); onFilter(''); onClose(); };

  if (!isOpen) return null;
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -10 }}
          style={{ position: 'fixed', top: position.top, left: position.left, zIndex: 10001 }}
          className="w-64 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden"
        >
          <div className="p-3 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
            <span className="text-sm font-semibold text-slate-700">Filter by Status</span>
          </div>
          <div className="p-4">
            <div className="space-y-2">
              <button onClick={() => handleApply('active')} className={`w-full text-left px-3 py-3 rounded-lg text-sm transition-all flex items-center justify-between ${filterValue === 'active' ? 'bg-green-50 text-green-700 border border-green-200' : 'hover:bg-slate-50 text-slate-600'}`}>
                <div className="flex items-center gap-3"><Power size={16} className="text-green-600" /><span className="font-medium">Active</span></div>
                {filterValue === 'active' && <Check size={16} className="text-green-600" />}
              </button>
              <button onClick={() => handleApply('inactive')} className={`w-full text-left px-3 py-3 rounded-lg text-sm transition-all flex items-center justify-between ${filterValue === 'inactive' ? 'bg-red-50 text-red-700 border border-red-200' : 'hover:bg-slate-50 text-slate-600'}`}>
                <div className="flex items-center gap-3"><PowerOff size={16} className="text-red-500" /><span className="font-medium">Inactive</span></div>
                {filterValue === 'inactive' && <Check size={16} className="text-red-500" />}
              </button>
            </div>
            <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
              <button onClick={handleClear} className="flex-1 px-3 py-2 bg-slate-100 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors">Clear Filter</button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

// Manage Columns Modal
const ManageColumnsModal = ({ isOpen, onClose, columns, visibleColumns, onToggleColumn }: any) => {
  if (!isOpen) return null;
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[10000]" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-[10001]">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-blue-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><Columns size={20} className="text-indigo-600" /><h3 className="text-lg font-bold text-slate-800">Manage Columns</h3></div>
                  <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-xl transition-colors"><X size={18} className="text-slate-400" /></button>
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto p-4 space-y-2">
                {columns.map((col: any) => (
                  <label key={col.key} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl cursor-pointer transition-all group">
                    <input type="checkbox" checked={visibleColumns.has(col.key)} onChange={() => onToggleColumn(col.key)} className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                    <span className="text-sm text-slate-700 group-hover:text-indigo-600">{col.title}</span>
                  </label>
                ))}
              </div>
              <div className="p-4 border-t border-slate-100 bg-slate-50">
                <button onClick={onClose} className="w-full px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-all">Apply Changes</button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

// Global Status Filter Modal
const StatusFilterModal = ({ isOpen, onClose, statusOptions, onStatusSelect, activeStatus }: any) => {
  if (!isOpen) return null;
  const activeOptions = statusOptions.filter((opt: any) => opt.type === 'active');
  const inactiveOptions = statusOptions.filter((opt: any) => opt.type === 'inactive');

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[10000]" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-[10001]">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-blue-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><Filter size={20} className="text-indigo-600" /><h3 className="text-lg font-bold text-slate-800">Filter by Status</h3></div>
                  <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-xl transition-colors"><X size={18} className="text-slate-400" /></button>
                </div>
              </div>
              <div className="p-4 max-h-[70vh] overflow-y-auto">
                <button onClick={() => { onStatusSelect(null); onClose(); }} className={`w-full flex items-center justify-between p-4 rounded-xl transition-all mb-3 ${activeStatus === null ? 'bg-indigo-50 border-2 border-indigo-200' : 'hover:bg-slate-50 border-2 border-transparent'}`}>
                  <div className="flex items-center gap-3"><div className="w-5 h-5 rounded-full bg-slate-400 flex items-center justify-center"><Circle size={12} className="text-white" /></div><span className="font-semibold text-slate-700">All Statuses</span></div>
                </button>
                
                {/* Active Section */}
                {activeOptions.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2 px-2"><Power size={14} className="text-green-600" /><span className="text-xs font-semibold text-green-600 uppercase tracking-wider">Active Statuses</span></div>
                    {activeOptions.map((status: any) => (
                       <button key={status.value} onClick={() => { onStatusSelect(status.value, 'active'); onClose(); }} className={`w-full flex items-center justify-between p-4 rounded-xl transition-all mb-2 ${activeStatus === status.value ? 'bg-green-50 border-2 border-green-200' : 'hover:bg-slate-50 border-2 border-transparent'}`}>
                         <div className="flex items-center gap-3"><div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: status.color || '#10b981' }}>{activeStatus === status.value ? <CircleDot size={12} className="text-white" /> : <Circle size={12} className="text-white" />}</div><span className="font-semibold text-slate-700">{status.label}</span></div>
                       </button>
                    ))}
                  </div>
                )}

                {/* Inactive Section */}
                {inactiveOptions.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2 px-2"><PowerOff size={14} className="text-red-500" /><span className="text-xs font-semibold text-red-500 uppercase tracking-wider">Inactive Statuses</span></div>
                    {inactiveOptions.map((status: any) => (
                       <button key={status.value} onClick={() => { onStatusSelect(status.value, 'inactive'); onClose(); }} className={`w-full flex items-center justify-between p-4 rounded-xl transition-all mb-2 ${activeStatus === status.value ? 'bg-red-50 border-2 border-red-200' : 'hover:bg-slate-50 border-2 border-transparent'}`}>
                         <div className="flex items-center gap-3"><div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: status.color || '#ef4444' }}>{activeStatus === status.value ? <CircleDot size={12} className="text-white" /> : <Circle size={12} className="text-white" />}</div><span className="font-semibold text-slate-700">{status.label}</span></div>
                       </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

// Pagination Component
const Pagination = ({ currentPage, totalItems, itemsPerPage, onPageChange, onItemsPerPageChange }: PaginationProps) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) { for (let i = 1; i <= totalPages; i++) pages.push(i); } 
    else {
      if (currentPage <= 3) { pages.push(1, 2, 3, 4, '...', totalPages); } 
      else if (currentPage >= totalPages - 2) { pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages); } 
      else { pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages); }
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-slate-100 bg-white relative z-10">
      <div className="flex items-center gap-4 text-sm text-slate-500">
        <span>Showing {startItem} to {endItem} of {totalItems} entries</span>
        {onItemsPerPageChange && (
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Show:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white cursor-pointer hover:border-indigo-300 transition-colors"
            >
              <option value={5}>5 rows</option>
              <option value={10}>10 rows</option>
              <option value={20}>20 rows</option>
              <option value={50}>50 rows</option>
              <option value={100}>100 rows</option>
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"><ChevronLeft size={18} /></button>
        <div className="flex gap-1.5">
          {getPageNumbers().map((page, idx) => (
            <button key={idx} onClick={() => typeof page === 'number' && onPageChange(page)} disabled={page === '...'} className={`min-w-[38px] h-9 rounded-lg font-medium text-sm transition-all ${page === currentPage ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : page === '...' ? 'text-slate-400 cursor-default' : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-600'}`}>{page}</button>
          ))}
        </div>
        <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"><ChevronRight size={18} /></button>
      </div>
    </div>
  );
};

// Main Table Component
const Table: React.FC<TableProps> = ({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = "No records found",
  className = "",
  showSelection = false,
  onSelectionChange,
  enableSearch = true,
  searchPlaceholder = "Search records...",
  onSearch,
  pagination,
  enableColumnFilter = true,
  statusOptions = [],
  onStatusFilter,
  activeStatus = null,
  activeStatusType = null,
  actionButtons = false,
  onRowClick,
  rowClickable = true,
  rowClassName,
  tableHeight = "auto",
  tableMaxHeight = "70vh",
  stickyHeader = true,
}) => {
  const [activeMenuId, setActiveMenuId] = useState<string | number | null>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [activeRecord, setActiveRecord] = useState<any>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<(string | number)[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilterColumn, setActiveFilterColumn] = useState<string | null>(null);
  const [activeFilterRect, setActiveFilterRect] = useState<DOMRect | null>(null);
  const [columnFilters, setColumnFilters] = useState<Map<string, string>>(new Map());
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [showManageColumns, setShowManageColumns] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set(columns.map(c => c.key)));
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  
  // Track drag state to distinguish between click and drag
  const [isDraggingRow, setIsDraggingRow] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  // --- Utility for Status Column Detection ---
  const isStatusColumn = (column: Column): boolean => {
    if (!column) return false;
    const title = column.title ? column.title.toLowerCase() : '';
    const dataIndex = column.dataIndex ? column.dataIndex.toLowerCase() : '';
    return title === 'status' || dataIndex === 'status' || dataIndex.includes('status');
  };

  // --- Drag to Scroll Logic ---
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input')) return;
    isDragging.current = true;
    startX.current = e.pageX - (scrollContainerRef.current?.offsetLeft || 0);
    scrollLeft.current = scrollContainerRef.current?.scrollLeft || 0;
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollContainerRef.current) return;
    e.preventDefault();
    const walk = ((e.pageX - scrollContainerRef.current.offsetLeft) - startX.current) * 1.5;
    scrollContainerRef.current.scrollLeft = scrollLeft.current - walk;
  };
  
  const stopDragging = () => { 
    isDragging.current = false; 
  };

  // Handle row mouse down to track drag start
  const handleRowMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('[data-no-row-click]')) {
      return;
    }
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    setIsDraggingRow(false);
  };

  // Handle row mouse move to detect drag
  const handleRowMouseMove = (e: React.MouseEvent) => {
    if (!dragStartRef.current) return;
    const dx = Math.abs(e.clientX - dragStartRef.current.x);
    const dy = Math.abs(e.clientY - dragStartRef.current.y);
    if (dx > 5 || dy > 5) {
      setIsDraggingRow(true);
    }
  };

  // Handle row click (only if not dragging)
  const handleRowClick = (record: any, e: React.MouseEvent) => {
    if (isDraggingRow) {
      setIsDraggingRow(false);
      dragStartRef.current = null;
      return;
    }
    
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('[data-no-row-click]')) {
      dragStartRef.current = null;
      return;
    }
    
    dragStartRef.current = null;
    
    if (onRowClick) {
      onRowClick(record);
    } else {
      const actions = typeof actionButtons === 'boolean' ? {} : actionButtons;
      if (actions?.onView) {
        actions.onView(record);
      }
    }
  };


  // --- Filtering & Sorting ---
  const filteredData = useMemo(() => {
    let filtered = [...data];

    // --- DEEP GLOBAL SEARCH FILTER ---
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(record => {
        // Recursive function to search all nested values in the entire row record
        const deepSearch = (obj: any): boolean => {
          if (obj === null || obj === undefined) return false;
          if (typeof obj === 'string') return obj.toLowerCase().includes(searchLower);
          if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj).toLowerCase().includes(searchLower);
          
          if (typeof obj === 'object') {
            // Check through Arrays and Objects
            return Object.values(obj).some(val => deepSearch(val));
          }
          return false;
        };

        // Execute deep search on the entire row object
        return deepSearch(record);
      });
    }

    // Individual Column Filters
    columnFilters.forEach((filterValue, columnKey) => {
      if (filterValue) {
        filtered = filtered.filter(record => {
          const value = record[columnKey];
          if (filterValue === 'active') {
            const statusValue = String(value).toLowerCase();
            return statusValue === 'active' || statusValue === '1' || statusValue === 'true';
          } else if (filterValue === 'inactive') {
            const statusValue = String(value).toLowerCase();
            return statusValue === 'inactive' || statusValue === '0' || statusValue === 'false';
          }
          return String(value).toLowerCase().includes(filterValue.toLowerCase());
        });
      }
    });

    // Global Status Filter
    if (activeStatus) {
      filtered = filtered.filter(record => (record.leadstatus?.statusName || record.status) === activeStatus);
    }

    // Sort Config
    if (sortConfig) {
      filtered.sort((a, b) => {
        let aVal = a[sortConfig.key]; let bVal = b[sortConfig.key];
        if (typeof aVal === 'string') aVal = aVal.toLowerCase();
        if (typeof bVal === 'string') bVal = bVal.toLowerCase();
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [data, searchTerm, columnFilters, sortConfig, columns, activeStatus]);

  const paginatedData = useMemo(() => {
    if (!pagination) return filteredData;
    const start = (pagination.currentPage - 1) * pagination.itemsPerPage;
    return filteredData.slice(start, start + pagination.itemsPerPage);
  }, [filteredData, pagination]);

  useEffect(() => {
    if (pagination && filteredData.length !== pagination.totalItems) pagination.onPageChange(1);
  }, [filteredData.length]);

  const handleSort = (key: string) => {
    setSortConfig(prev => prev?.key === key ? (prev.direction === 'asc' ? { key, direction: 'desc' } : null) : { key, direction: 'asc' });
  };

  const handleColumnFilter = (columnKey: string, value: string) => {
    setColumnFilters(prev => {
      const newFilters = new Map(prev);
      if (value) newFilters.set(columnKey, value);
      else newFilters.delete(columnKey);
      return newFilters;
    });
    setActiveFilterColumn(null);
    setActiveFilterRect(null);
  };

  const handleFilterClick = (e: React.MouseEvent, colKey: string, column: Column) => {
    if (isStatusColumn(column)) {
      setActiveFilterRect(e.currentTarget.getBoundingClientRect());
      setActiveFilterColumn(activeFilterColumn === colKey ? null : colKey);
    }
  };

  const handleActionClick = (e: React.MouseEvent, record: any, id: string | number) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPosition({ top: rect.bottom + window.scrollY + 8, left: rect.right + window.scrollX - 220 });
    setActiveRecord(record);
    setActiveMenuId(id);
  };

  const visibleColumnsList = columns.filter(col => visibleColumns.has(col.key));
  const hasActions = useMemo(() => typeof actionButtons === 'boolean' ? actionButtons : !!(actionButtons?.showView || actionButtons?.showEdit || actionButtons?.showDelete || actionButtons?.showFollowUp || actionButtons?.showConvert), [actionButtons]);
  const actions = typeof actionButtons === 'boolean' ? {} : actionButtons;

  return (
    <div className={`flex flex-col w-full bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden ${className}`}>
      
      {/* Header Toolbar - Responsive */}
      <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-100 bg-white z-10 relative">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {enableSearch && (
            <div className="relative flex-1 sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); if (onSearch) onSearch(e.target.value); }}
                className="w-full pl-9 pr-8 py-2 bg-slate-50/50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
              {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><X size={12} /></button>}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {statusOptions.length > 0 && (
            <button onClick={() => setShowStatusFilter(true)} className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg text-slate-600 text-sm font-medium hover:bg-slate-50 transition-all">
              <Filter size={14} /> Filter
            </button>
          )}
          <button onClick={() => setShowManageColumns(true)} className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg text-slate-600 text-sm font-medium hover:bg-slate-50 transition-all">
            <Columns size={14} /> Columns
          </button>
        </div>
      </div>

      {/* TABLE SCROLL CONTAINER */}
      <div 
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown} 
        onMouseMove={handleMouseMove} 
        onMouseUp={stopDragging} 
        onMouseLeave={stopDragging}
        style={{ 
          maxHeight: tableMaxHeight,
          height: tableHeight !== 'auto' ? tableHeight : 'auto',
          minHeight: '200px'
        }}
        // The important CSS part: [&::-webkit-scrollbar:horizontal]:hidden hides the bottom scrollbar while maintaining horizontal overflow ability for dragging. 
        className="overflow-auto cursor-grab active:cursor-grabbing [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar:horizontal]:hidden [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400 transition-colors"
      >
        <table className="w-full border-collapse relative min-w-[800px]">
          <thead className={`${stickyHeader ? 'sticky top-0 z-[20]' : ''} shadow-sm`}>
            <tr className="bg-slate-50/95 backdrop-blur-md">
              {showSelection && (
                <th className="p-3 w-10 sticky left-0 z-[30] bg-slate-50 border-b border-slate-200">
                  <div className="flex items-center justify-center">
                    <input 
                      type="checkbox" 
                      className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer"
                      checked={paginatedData.length > 0 && selectedRowKeys.length === paginatedData.length}
                      onChange={(e) => {
                        const keys = e.target.checked ? paginatedData.map((d, i) => d.id || d._id || i) : [];
                        setSelectedRowKeys(keys);
                        onSelectionChange?.(e.target.checked ? paginatedData : []);
                      }}
                    />
                  </div>
                </th>
              )}
              {visibleColumnsList.map(col => {
                const isStatus = isStatusColumn(col);
                return (
                  <th key={col.key} className="p-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap border-b border-slate-200 bg-slate-50" style={{ width: col.width || 'auto', minWidth: col.minWidth || '80px', maxWidth: col.maxWidth }}>
                    <div className="flex items-center gap-1.5">
                      <span className="truncate">{col.title}</span>
                      <div className="flex items-center gap-0.5 flex-shrink-0">
                        {col.sortable && (
                          <button onClick={() => handleSort(col.dataIndex)} className="p-1 hover:bg-slate-200 rounded transition-colors">
                            <ArrowUpDown size={10} className={sortConfig?.key === col.dataIndex ? "text-indigo-600" : "text-slate-400"} />
                          </button>
                        )}
                        {enableColumnFilter && isStatus && (
                          <button
                            onClick={(e) => handleFilterClick(e, col.key, col)}
                            className={`p-1 hover:bg-slate-200 rounded transition-colors ${columnFilters.has(col.dataIndex) ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400'}`}
                          >
                            <Filter size={10} />
                          </button>
                        )}
                      </div>
                    </div>
                  </th>
                )
              })}
              {hasActions && (
                <th className="p-3 text-center text-[11px] font-bold text-slate-500 uppercase tracking-wider sticky right-0 z-[30] bg-slate-50 border-b border-slate-200 shadow-[-5px_0_10px_-5px_rgba(0,0,0,0.05)] w-[80px]">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          
          <tbody className="bg-white">
            {loading ? (
              <tr><td colSpan={100}><LoadingDots /></td></tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={100} className="py-12 text-center">
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center"><Search size={20} className="text-slate-300" /></div>
                    <p className="text-slate-400 font-medium text-sm">{emptyMessage}</p>
                  </motion.div>
                </td>
              </tr>
            ) : (
              <AnimatePresence>
                {paginatedData.map((record, idx) => {
                  const rowId = record.id || record._id || idx;
                  const isSelected = selectedRowKeys.includes(rowId);
                  const isRowClickable = rowClickable && (onRowClick || actions?.onView);
                  const customRowClass = rowClassName ? rowClassName(record, idx) : '';

                  return (
                    <motion.tr 
                      key={rowId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2, delay: Math.min(idx * 0.03, 0.2) }}
                      className={`group transition-colors duration-200 border-b border-slate-50 last:border-0 ${
                        isSelected ? 'bg-indigo-50/50' : 'bg-white hover:bg-slate-50/80'
                      } ${isRowClickable ? 'cursor-pointer' : ''} ${customRowClass}`}
                      onMouseDown={(e) => isRowClickable && handleRowMouseDown(e)}
                      onMouseMove={(e) => isRowClickable && handleRowMouseMove(e)}
                      onMouseUp={() => {
                        if (isRowClickable) {
                          dragStartRef.current = null;
                          setIsDraggingRow(false);
                        }
                      }}
                      onClick={(e) => isRowClickable && handleRowClick(record, e)}
                    >
                      {showSelection && (
                        <td className="p-3 sticky left-0 z-10 bg-inherit border-b border-slate-50" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center">
                            <input 
                              type="checkbox" checked={isSelected}
                              className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                              onChange={() => {
                                const newKeys = isSelected ? selectedRowKeys.filter(k => k !== rowId) : [...selectedRowKeys, rowId];
                                setSelectedRowKeys(newKeys);
                                onSelectionChange?.(newKeys.map(key => paginatedData.find(r => (r.id || r._id) === key)));
                              }}
                            />
                          </div>
                        </td>
                      )}
                      {visibleColumnsList.map(col => {
                        const cellContent = col.render ? col.render(record[col.dataIndex], record, idx) : record[col.dataIndex];
                        return (
                          <td key={col.key} className="p-3 text-sm text-slate-600 whitespace-nowrap bg-inherit">
                            {cellContent}
                          </td>
                        );
                      })}
                      
                      {hasActions && (
                        <td className="p-3 text-center sticky right-0 z-10 bg-inherit shadow-[-5px_0_10px_-5px_rgba(0,0,0,0.03)] border-b border-slate-50">
                          <button 
                            data-no-row-click="true"
                            onClick={(e) => handleActionClick(e, record, rowId)}
                            className={`p-1.5 rounded-lg transition-all ${activeMenuId === rowId ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:text-slate-600 hover:bg-white shadow-sm border border-transparent hover:border-slate-200'}`}
                          >
                            <MoreVertical size={16} />
                          </button>
                        </td>
                      )}
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Container */}
      {pagination && !loading && paginatedData.length > 0 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalItems={filteredData.length}
          itemsPerPage={pagination.itemsPerPage}
          onPageChange={pagination.onPageChange}
          onItemsPerPageChange={pagination.onItemsPerPageChange}
        />
      )}

      {/* Portals and Modals */}
      <ManageColumnsModal
        isOpen={showManageColumns}
        onClose={() => setShowManageColumns(false)}
        columns={columns}
        visibleColumns={visibleColumns}
        onToggleColumn={(key: string) => {
          setVisibleColumns(prev => {
            const newSet = new Set(prev);
            if (newSet.has(key)) newSet.delete(key);
            else newSet.add(key);
            return newSet;
          });
        }}
      />

      <StatusFilterModal
        isOpen={showStatusFilter}
        onClose={() => setShowStatusFilter(false)}
        statusOptions={statusOptions}
        onStatusSelect={(status: string | null, type?: 'active' | 'inactive') => {
          if (onStatusFilter) onStatusFilter(status, type);
        }}
        activeStatus={activeStatus}
        activeStatusType={activeStatusType}
      />

      {/* Individual Column Filter Popup rendering */}
      {activeFilterColumn && (() => {
        const column = columns.find(c => c.key === activeFilterColumn);
        if (!column || !isStatusColumn(column)) return null;
        
        return (
          <StatusColumnFilterPopup
            isOpen={true}
            onClose={() => { setActiveFilterColumn(null); setActiveFilterRect(null); }}
            onFilter={(value: string) => handleColumnFilter(column.dataIndex, value)}
            currentFilter={columnFilters.get(column.dataIndex)}
            triggerRect={activeFilterRect || undefined}
          />
        );
      })()}

      {/* Action Menu Portal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {activeMenuId !== null && (
            <>
              <div className="fixed inset-0 z-[9998]" onClick={() => setActiveMenuId(null)} />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 10 }}
                transition={{ type: "spring", damping: 20 }}
                style={{ position: 'fixed', top: menuPosition.top, left: menuPosition.left, zIndex: 9999 }}
                className="w-[200px] bg-white rounded-xl shadow-xl border border-slate-100 p-1 py-2"
              >
                {actions?.showEdit && <button onClick={() => { actions.onEdit?.(activeRecord); setActiveMenuId(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-medium text-left"><Edit3 size={14} className="text-slate-400" /> Edit lead</button>}
                {actions?.showFollowUp && <button onClick={() => { actions.onFollowUp?.(activeRecord); setActiveMenuId(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-medium text-left"><Calendar size={14} className="text-slate-400" /> Add Follow-Up</button>}
                {actions?.showView && <button onClick={() => { actions.onView?.(activeRecord); setActiveMenuId(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-medium text-left"><Eye size={14} className="text-slate-400" /> View Lead</button>}
                {(actions?.showConvert || actions?.showDelete) && <div className="my-1 mx-2 border-t border-slate-100" />}
                {actions?.showConvert && <button onClick={() => { actions.onConvert?.(activeRecord); setActiveMenuId(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-slate-800 hover:bg-indigo-50 rounded-lg text-xs font-semibold text-left"><Users size={14} className="text-slate-400" /> Convert Customer</button>}
                {actions?.showDelete && <button onClick={() => { actions.onDelete?.(activeRecord); setActiveMenuId(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-medium text-left"><Trash2 size={14} className="text-rose-400" /> Delete Lead</button>}
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default Table;