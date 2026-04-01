import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowUpDown,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
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
  render?: (text: any, record: any, index: number) => React.ReactNode;
  filterable?: boolean;
  sortable?: boolean;
  filterType?: 'text' | 'select' | 'date';
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
}

// Loading Dots Animation Component
const LoadingDots = () => {
  return (
    <div className="flex items-center justify-center gap-2 py-12">
      {[0, 1, 2].map((dot) => (
        <motion.div
          key={dot}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            delay: dot * 0.2,
          }}
          className="w-2 h-2 bg-indigo-500 rounded-full"
        />
      ))}
    </div>
  );
};

// Manage Columns Modal (Portal based)
const ManageColumnsModal = ({
  isOpen,
  onClose,
  columns,
  visibleColumns,
  onToggleColumn
}: {
  isOpen: boolean;
  onClose: () => void;
  columns: Column[];
  visibleColumns: Set<string>;
  onToggleColumn: (key: string) => void;
}) => {
  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[10000]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-[10001]"
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-blue-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Columns size={20} className="text-indigo-600" />
                    <h3 className="text-lg font-bold text-slate-800">Manage Columns</h3>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/50 rounded-xl transition-colors"
                  >
                    <X size={18} className="text-slate-400" />
                  </button>
                </div>
                <p className="text-sm text-slate-500 mt-1">Select which columns to display</p>
              </div>
              <div className="max-h-96 overflow-y-auto p-4">
                <div className="space-y-2">
                  {columns.map(col => (
                    <label
                      key={col.key}
                      className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl cursor-pointer transition-all group"
                    >
                      <input
                        type="checkbox"
                        checked={visibleColumns.has(col.key)}
                        onChange={() => onToggleColumn(col.key)}
                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0"
                      />
                      <span className="text-sm text-slate-700 group-hover:text-indigo-600 transition-colors">
                        {col.title}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="p-4 border-t border-slate-100 bg-slate-50">
                <button
                  onClick={onClose}
                  className="w-full px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-all transform hover:scale-[1.02]"
                >
                  Apply Changes
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

// Status Filter Modal with Active/Inactive Options
const StatusFilterModal = ({
  isOpen,
  onClose,
  statusOptions,
  onStatusSelect,
  activeStatus,
  activeStatusType
}: {
  isOpen: boolean;
  onClose: () => void;
  statusOptions: StatusFilterOption[];
  onStatusSelect: (status: string | null, type?: 'active' | 'inactive') => void;
  activeStatus: string | null;
  activeStatusType: 'active' | 'inactive' | null;
}) => {
  if (!isOpen) return null;

  const activeOptions = statusOptions.filter(opt => opt.type === 'active');
  const inactiveOptions = statusOptions.filter(opt => opt.type === 'inactive');

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[10000]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-[10001]"
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-blue-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Filter size={20} className="text-indigo-600" />
                    <h3 className="text-lg font-bold text-slate-800">Filter by Status</h3>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/50 rounded-xl transition-colors"
                  >
                    <X size={18} className="text-slate-400" />
                  </button>
                </div>
                <p className="text-sm text-slate-500 mt-1">Select a status to filter leads</p>
              </div>
              
              <div className="p-4 max-h-[70vh] overflow-y-auto">
                {/* All Statuses Option */}
                <button
                  onClick={() => {
                    onStatusSelect(null);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between p-4 rounded-xl transition-all mb-3 ${
                    activeStatus === null
                      ? 'bg-indigo-50 border-2 border-indigo-200 shadow-sm'
                      : 'hover:bg-slate-50 border-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-slate-400 flex items-center justify-center">
                      <Circle size={12} className="text-white" />
                    </div>
                    <span className="font-semibold text-slate-700">All Statuses</span>
                  </div>
                  {activeStatus === null && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center"
                    >
                      <Check size={12} className="text-white" />
                    </motion.div>
                  )}
                </button>

                {/* Active Statuses Section */}
                {activeOptions.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2 px-2">
                      <Power size={14} className="text-green-600" />
                      <span className="text-xs font-semibold text-green-600 uppercase tracking-wider">Active Statuses</span>
                    </div>
                    <div className="space-y-2">
                      {activeOptions.map((status) => (
                        <button
                          key={status.value}
                          onClick={() => {
                            onStatusSelect(status.value, 'active');
                            onClose();
                          }}
                          className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
                            activeStatus === status.value && activeStatusType === 'active'
                              ? 'bg-green-50 border-2 border-green-200 shadow-sm'
                              : 'hover:bg-slate-50 border-2 border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-5 h-5 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: status.color || '#10b981' }}
                            >
                              {activeStatus === status.value && activeStatusType === 'active' ? (
                                <CircleDot size={12} className="text-white" />
                              ) : (
                                <Circle size={12} className="text-white" />
                              )}
                            </div>
                            <div className="flex flex-col items-start">
                              <span className="font-semibold text-slate-700">{status.label}</span>
                              <span className="text-xs text-green-600">Active leads</span>
                            </div>
                          </div>
                          {activeStatus === status.value && activeStatusType === 'active' && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center"
                            >
                              <Check size={12} className="text-white" />
                            </motion.div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Inactive Statuses Section */}
                {inactiveOptions.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2 px-2">
                      <PowerOff size={14} className="text-red-500" />
                      <span className="text-xs font-semibold text-red-500 uppercase tracking-wider">Inactive Statuses</span>
                    </div>
                    <div className="space-y-2">
                      {inactiveOptions.map((status) => (
                        <button
                          key={status.value}
                          onClick={() => {
                            onStatusSelect(status.value, 'inactive');
                            onClose();
                          }}
                          className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
                            activeStatus === status.value && activeStatusType === 'inactive'
                              ? 'bg-red-50 border-2 border-red-200 shadow-sm'
                              : 'hover:bg-slate-50 border-2 border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-5 h-5 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: status.color || '#ef4444' }}
                            >
                              {activeStatus === status.value && activeStatusType === 'inactive' ? (
                                <CircleDot size={12} className="text-white" />
                              ) : (
                                <Circle size={12} className="text-white" />
                              )}
                            </div>
                            <div className="flex flex-col items-start">
                              <span className="font-semibold text-slate-700">{status.label}</span>
                              <span className="text-xs text-red-500">Inactive leads</span>
                            </div>
                          </div>
                          {activeStatus === status.value && activeStatusType === 'inactive' && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center"
                            >
                              <Check size={12} className="text-white" />
                            </motion.div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {(activeStatus || activeStatusType) && (
                <div className="p-4 border-t border-slate-100 bg-slate-50">
                  <button
                    onClick={() => {
                      onStatusSelect(null);
                      onClose();
                    }}
                    className="w-full px-4 py-2.5 bg-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-300 transition-all"
                  >
                    Clear Filter
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

// Column Filter Popup (Portal based for better positioning)
const ColumnFilterPopup = ({
  isOpen,
  onClose,
  column,
  onFilter,
  currentFilter,
  triggerRect
}: {
  isOpen: boolean;
  onClose: () => void;
  column: Column;
  onFilter: (value: string) => void;
  currentFilter?: string;
  triggerRect?: DOMRect;
}) => {
  const [filterValue, setFilterValue] = useState(currentFilter || '');
  const popupRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (isOpen && triggerRect) {
      let top = triggerRect.bottom + window.scrollY + 8;
      let left = triggerRect.left + window.scrollX;
      
      const popupHeight = 300;
      const popupWidth = 288;
      
      if (top + popupHeight > window.innerHeight + window.scrollY) {
        top = triggerRect.top + window.scrollY - popupHeight - 8;
      }
      
      if (left + popupWidth > window.innerWidth + window.scrollX) {
        left = window.innerWidth + window.scrollX - popupWidth - 16;
      }
      
      setPosition({ top, left });
    }
  }, [isOpen, triggerRect]);

  const handleApply = () => {
    onFilter(filterValue);
    onClose();
  };

  const handleClear = () => {
    setFilterValue('');
    onFilter('');
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={popupRef}
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          style={{ position: 'fixed', top: position.top, left: position.left, zIndex: 10001 }}
          className="w-72 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden"
        >
          <div className="p-3 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
            <span className="text-sm font-semibold text-slate-700">Filter by {column.title}</span>
          </div>
          <div className="p-4">
            {column.filterType === 'select' && column.filterOptions ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {column.filterOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setFilterValue(option.value);
                      onFilter(option.value);
                      onClose();
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                      filterValue === option.value
                        ? 'bg-indigo-50 text-indigo-700 font-medium'
                        : 'hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ) : column.filterType === 'date' ? (
              <input
                type="date"
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            ) : (
              <input
                type="text"
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                placeholder={`Search ${column.title.toLowerCase()}...`}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                onKeyPress={(e) => e.key === 'Enter' && handleApply()}
                autoFocus
              />
            )}
            
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleApply}
                className="flex-1 px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Apply
              </button>
              <button
                onClick={handleClear}
                className="px-3 py-2 bg-slate-100 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

// Pagination Component
const Pagination = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange
}: PaginationProps) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-slate-100 bg-white"
    >
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
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <ChevronsLeft size={18} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft size={18} />
        </motion.button>

        <div className="flex gap-1.5">
          {getPageNumbers().map((page, idx) => (
            <motion.button
              key={idx}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => typeof page === 'number' && onPageChange(page)}
              disabled={page === '...'}
              className={`
                min-w-[38px] h-9 rounded-lg font-medium text-sm transition-all
                ${page === currentPage
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : page === '...'
                  ? 'text-slate-400 cursor-default'
                  : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-600'
                }
              `}
            >
              {page}
            </motion.button>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <ChevronRight size={18} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <ChevronsRight size={18} />
        </motion.button>
      </div>
    </motion.div>
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
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    scrollContainerRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const stopDragging = () => { isDragging.current = false; };

  // --- Filter and Sort Data ---
  const filteredData = useMemo(() => {
    let filtered = [...data];

    // Global search
    if (searchTerm) {
      filtered = filtered.filter(record => {
        return columns.some(col => {
          const value = record[col.dataIndex];
          if (typeof value === 'string') {
            return value.toLowerCase().includes(searchTerm.toLowerCase());
          }
          if (typeof value === 'object' && value !== null) {
            return Object.values(value).some(v => 
              String(v).toLowerCase().includes(searchTerm.toLowerCase())
            );
          }
          return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        });
      });
    }

    // Column filters
    columnFilters.forEach((filterValue, columnKey) => {
      if (filterValue) {
        filtered = filtered.filter(record => {
          const value = record[columnKey];
          return String(value).toLowerCase().includes(filterValue.toLowerCase());
        });
      }
    });

    // Status filter (active/inactive)
    if (activeStatus) {
      filtered = filtered.filter(record => {
        const status = record.leadstatus?.statusName || record.status;
        return status === activeStatus;
      });
    }

    // Sorting
    if (sortConfig) {
      filtered.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];
        
        if (typeof aVal === 'string') aVal = aVal.toLowerCase();
        if (typeof bVal === 'string') bVal = bVal.toLowerCase();
        
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, searchTerm, columnFilters, sortConfig, columns, activeStatus]);

  // --- Pagination Logic ---
  const paginatedData = useMemo(() => {
    if (!pagination) return filteredData;
    const start = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const end = start + pagination.itemsPerPage;
    return filteredData.slice(start, end);
  }, [filteredData, pagination]);

  // Update total items when filtered data changes
  useEffect(() => {
    if (pagination && filteredData.length !== pagination.totalItems) {
      pagination.onPageChange(1);
    }
  }, [filteredData.length]);

  const handleSort = (key: string) => {
    setSortConfig(prev => {
      if (prev?.key === key) {
        if (prev.direction === 'asc') return { key, direction: 'desc' };
        return null;
      }
      return { key, direction: 'asc' };
    });
  };

  const handleFilter = (columnKey: string, value: string) => {
    setColumnFilters(prev => {
      const newFilters = new Map(prev);
      if (value) {
        newFilters.set(columnKey, value);
      } else {
        newFilters.delete(columnKey);
      }
      return newFilters;
    });
    setActiveFilterColumn(null);
    setActiveFilterRect(null);
  };

  const handleGlobalSearch = (term: string) => {
    setSearchTerm(term);
    if (onSearch) onSearch(term);
  };

  const handleStatusSelect = (status: string | null, type?: 'active' | 'inactive') => {
    if (onStatusFilter) onStatusFilter(status, type);
  };

  const toggleColumn = (key: string) => {
    setVisibleColumns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const handleFilterClick = (e: React.MouseEvent, colKey: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setActiveFilterRect(rect);
    setActiveFilterColumn(activeFilterColumn === colKey ? null : colKey);
  };

  // --- Menu Positioning Logic ---
  const handleActionClick = (e: React.MouseEvent, record: any, id: string | number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPosition({
      top: rect.bottom + window.scrollY + 8,
      left: rect.right + window.scrollX - 220,
    });
    setActiveRecord(record);
    setActiveMenuId(id);
  };

  const visibleColumnsList = columns.filter(col => visibleColumns.has(col.key));

  const hasActions = useMemo(() => {
    if (typeof actionButtons === 'boolean') return actionButtons;
    const b = actionButtons;
    return b.showView || b.showEdit || b.showDelete || b.showFollowUp || b.showConvert;
  }, [actionButtons]);

  const actions = typeof actionButtons === 'boolean' ? {} : actionButtons;

  // Get active status label for display
  const activeStatusLabel = statusOptions.find(s => s.value === activeStatus)?.label;
  const activeStatusTypeIcon = activeStatusType === 'active' ? 
    <Power size={14} className="text-green-600" /> : 
    activeStatusType === 'inactive' ? 
    <PowerOff size={14} className="text-red-500" /> : null;

  return (
    <div className={`flex flex-col w-full bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden ${className}`}>
      {/* Header Area */}
      <div className="p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 bg-gradient-to-r from-white to-slate-50/30">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {enableSearch && (
            <div className="relative flex-1 sm:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => handleGlobalSearch(e.target.value)}
                className="w-full pl-11 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => handleGlobalSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {statusOptions.length > 0 && (
            <button
              onClick={() => setShowStatusFilter(true)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeStatus
                  ? activeStatusType === 'active'
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'bg-red-100 text-red-700 border border-red-200'
                  : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {activeStatusTypeIcon}
              <Filter size={16} />
              {activeStatus ? `Status: ${activeStatusLabel}` : 'Filter by Status'}
              {activeStatus && (
                <X
                  size={14}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusSelect(null);
                  }}
                  className="ml-1 hover:opacity-70"
                />
              )}
            </button>
          )}
          
          <button
            onClick={() => setShowManageColumns(true)}
            className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 text-sm font-medium hover:bg-slate-50 transition-all"
          >
            <Columns size={16} />
            Manage Columns
          </button>
          
          {(searchTerm || columnFilters.size > 0 || activeStatus) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setColumnFilters(new Map());
                handleStatusSelect(null);
                setSortConfig(null);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-medium hover:bg-indigo-100 transition-all"
            >
              <X size={16} />
              Clear All Filters
            </button>
          )}
        </div>
      </div>

      {/* Table Container with Drag-Scroll */}
      <div 
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={stopDragging}
        onMouseLeave={stopDragging}
        className="overflow-x-auto custom-scrollbar cursor-grab active:cursor-grabbing"
      >
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100">
              {showSelection && (
                <th className="p-4 w-12 bg-slate-50/80 sticky left-0 z-[12]">
                  <div className="flex items-center justify-center">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer"
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
              {visibleColumnsList.map(col => (
                <th 
                  key={col.key} 
                  className="p-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                  style={{ width: col.width, minWidth: col.minWidth }}
                >
                  <div className="flex items-center gap-2">
                    <span>{col.title}</span>
                    <div className="flex items-center gap-1">
                      {col.sortable && (
                        <button
                          onClick={() => handleSort(col.dataIndex)}
                          className="p-1 hover:bg-slate-200 rounded transition-colors"
                        >
                          {sortConfig?.key === col.dataIndex ? (
                            <span className="text-indigo-600 text-xs">
                              {sortConfig.direction === 'asc' ? '↑' : '↓'}
                            </span>
                          ) : (
                            <ArrowUpDown size={12} className="text-slate-400" />
                          )}
                        </button>
                      )}
                      {enableColumnFilter && col.filterable && (
                        <button
                          onClick={(e) => handleFilterClick(e, col.key)}
                          className={`p-1 hover:bg-slate-200 rounded transition-colors ${
                            columnFilters.has(col.dataIndex) ? 'text-indigo-600' : 'text-slate-400'
                          }`}
                        >
                          <Filter size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                </th>
              ))}
              {hasActions && (
                <th className="p-4 text-center text-[11px] font-bold text-slate-500 uppercase tracking-wider sticky right-0 bg-slate-50/80 z-[12] shadow-[-5px_0_10px_-5px_rgba(0,0,0,0.05)]">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={100} className="p-0">
                  <LoadingDots />
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={100} className="py-16 text-center">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center gap-3"
                  >
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                      <Search size={24} className="text-slate-400" />
                    </div>
                    <p className="text-slate-400 font-medium">{emptyMessage}</p>
                  </motion.div>
                </td>
              </tr>
            ) : (
              paginatedData.map((record, idx) => {
                const rowId = record.id || record._id || idx;
                const isSelected = selectedRowKeys.includes(rowId);

                return (
                  <motion.tr 
                    key={rowId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    className={`group hover:bg-slate-50/80 transition-all duration-200 border-b border-slate-50 last:border-0 ${isSelected ? 'bg-indigo-50/30' : ''}`}
                  >
                    {showSelection && (
                      <td className="p-4 sticky left-0 bg-inherit z-10">
                        <div className="flex items-center justify-center">
                          <input 
                            type="checkbox" 
                            checked={isSelected}
                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer"
                            onChange={() => {
                              const newKeys = isSelected 
                                ? selectedRowKeys.filter(k => k !== rowId) 
                                : [...selectedRowKeys, rowId];
                              setSelectedRowKeys(newKeys);
                              const selectedRecords = paginatedData.filter((_, i) => 
                                newKeys.includes(paginatedData[i].id || paginatedData[i]._id || i)
                              );
                              onSelectionChange?.(selectedRecords);
                            }}
                          />
                        </div>
                      </td>
                    )}
                    {visibleColumnsList.map(col => (
                      <td key={col.key} className="p-4 text-sm text-slate-600 whitespace-nowrap">
                        {col.render 
                          ? col.render(record[col.dataIndex], record, idx) 
                          : record[col.dataIndex]}
                      </td>
                    ))}
                    
                    {hasActions && (
                      <td className="p-4 text-center sticky right-0 bg-inherit z-10 shadow-[-5px_0_10px_-5px_rgba(0,0,0,0.05)]">
                        <button 
                          onClick={(e) => handleActionClick(e, record, rowId)}
                          className={`p-2 rounded-xl transition-all ${activeMenuId === rowId ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                        >
                          <MoreVertical size={18} />
                        </button>
                      </td>
                    )}
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && !loading && paginatedData.length > 0 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalItems={filteredData.length}
          itemsPerPage={pagination.itemsPerPage}
          onPageChange={pagination.onPageChange}
          onItemsPerPageChange={pagination.onItemsPerPageChange}
        />
      )}

      {/* Modals using Portal */}
      <ManageColumnsModal
        isOpen={showManageColumns}
        onClose={() => setShowManageColumns(false)}
        columns={columns}
        visibleColumns={visibleColumns}
        onToggleColumn={toggleColumn}
      />

      <StatusFilterModal
        isOpen={showStatusFilter}
        onClose={() => setShowStatusFilter(false)}
        statusOptions={statusOptions}
        onStatusSelect={handleStatusSelect}
        activeStatus={activeStatus}
        activeStatusType={activeStatusType}
      />

      {activeFilterColumn && (
        <ColumnFilterPopup
          isOpen={true}
          onClose={() => {
            setActiveFilterColumn(null);
            setActiveFilterRect(null);
          }}
          column={columns.find(c => c.key === activeFilterColumn)!}
          onFilter={(value) => handleFilter(columns.find(c => c.key === activeFilterColumn)!.dataIndex, value)}
          currentFilter={columnFilters.get(columns.find(c => c.key === activeFilterColumn)?.dataIndex || '')}
          triggerRect={activeFilterRect || undefined}
        />
      )}

      {/* Portal Menu for Actions */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {activeMenuId !== null && (
            <>
              <div className="fixed inset-0 z-[9998]" onClick={() => setActiveMenuId(null)} />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: 20 }}
                transition={{ type: "spring", damping: 20 }}
                style={{ position: 'fixed', top: menuPosition.top, left: menuPosition.left, zIndex: 9999 }}
                className="w-[230px] bg-white rounded-2xl shadow-xl border border-slate-100 p-2 py-3"
              >
                {actions?.showEdit && (
                  <button 
                    onClick={() => { actions.onEdit?.(activeRecord); setActiveMenuId(null); }} 
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-700 hover:bg-slate-50 rounded-xl transition-colors text-[14px] font-medium text-left"
                  >
                    <Edit3 size={16} className="text-slate-400" /> Edit lead
                  </button>
                )}
                {actions?.showFollowUp && (
                  <button 
                    onClick={() => { actions.onFollowUp?.(activeRecord); setActiveMenuId(null); }} 
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-700 hover:bg-slate-50 rounded-xl transition-colors text-[14px] font-medium text-left"
                  >
                    <Calendar size={16} className="text-slate-400" /> Add Follow-Up
                  </button>
                )}
                {actions?.showView && (
                  <button 
                    onClick={() => { actions.onView?.(activeRecord); setActiveMenuId(null); }} 
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-700 hover:bg-slate-50 rounded-xl transition-colors text-[14px] font-medium text-left"
                  >
                    <Eye size={16} className="text-slate-400" /> View Lead
                  </button>
                )}
                
                {(actions.showConvert || actions.showDelete) && <div className="my-2 mx-2 border-t border-slate-100" />}
                
                {actions?.showConvert && (
                  <button 
                    onClick={() => { actions.onConvert?.(activeRecord); setActiveMenuId(null); }} 
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-800 hover:bg-indigo-50 rounded-xl transition-colors text-[14px] font-semibold text-left"
                  >
                    <Users size={16} className="text-slate-400" /> Convert Customer
                  </button>
                )}

                {actions?.showDelete && (
                  <button 
                    onClick={() => { actions.onDelete?.(activeRecord); setActiveMenuId(null); }} 
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-[14px] font-medium text-left"
                  >
                    <Trash2 size={16} className="text-rose-400" /> Delete Lead
                  </button>
                )}
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