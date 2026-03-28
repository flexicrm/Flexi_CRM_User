import { AnimatePresence, motion } from 'framer-motion';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Eye,
  Filter,
  Loader2,
  Search,
  Trash2,
  X
} from 'lucide-react';
import React, { useMemo, useRef, useState } from 'react';

// --- Types ---
export interface Column {
  title: string;
  dataIndex: string;
  key: string;
  width?: string;
  minWidth?: string;
  align?: 'left' | 'center' | 'right';
  render?: (text: any, record: any, index: number) => React.ReactNode;
  className?: string;
  cellClassName?: string;
  filterable?: boolean;
  filterOptions?: Array<{ label: string; value: string }>;
  onFilter?: (value: string) => void;
}

export interface PaginationConfig {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (items: number) => void;
}

export interface TableProps {
  columns: Column[];
  data: any[];
  pagination: PaginationConfig;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  onRowClick?: (record: any, index: number) => void;
  showSelection?: boolean;
  onSelectionChange?: (selectedRows: any[]) => void;
  enableSearch?: boolean;
  searchPlaceholder?: string;
  onSearch?: (searchTerm: string) => void;
  actionButtons?: {
    showView?: boolean;
    showEdit?: boolean;
    showDelete?: boolean;
    onView?: (record: any) => void;
    onEdit?: (record: any) => void;
    onDelete?: (record: any) => void;
  } | boolean;
}

const Table: React.FC<TableProps> = ({
  columns = [],
  data = [],
  pagination,
  loading = false,
  emptyMessage = "No records found",
  className = "",
  onRowClick,
  showSelection = false,
  onSelectionChange,
  enableSearch = true,
  searchPlaceholder = "Search records...",
  onSearch,
  actionButtons = { showView: true, showEdit: true, showDelete: true },
}) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<(string | number)[]>([]);
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [openFilterDropdown, setOpenFilterDropdown] = useState<string | null>(null);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const hasActions = useMemo(() => {
    if (typeof actionButtons === 'boolean') return actionButtons;
    return actionButtons?.showView || actionButtons?.showEdit || actionButtons?.showDelete;
  }, [actionButtons]);

  const visibleColumns = useMemo(() => 
    columns.filter(col => {
        const key = col?.key?.toLowerCase() || "";
        const dataIndex = col?.dataIndex?.toLowerCase() || "";
        return key !== 'id' && dataIndex !== 'id';
    }),
  [columns]);

  const handleSearch = (value: string) => {
    setLocalSearchTerm(value);
    onSearch?.(value);
  };

  const handleFilterChange = (columnKey: string, value: string) => {
    const newFilters = { ...activeFilters };
    if (value === '') delete newFilters[columnKey];
    else newFilters[columnKey] = value;
    setActiveFilters(newFilters);
    
    const col = columns.find(c => c.key === columnKey);
    if (col?.onFilter) col.onFilter(value);

    setOpenFilterDropdown(null);
  };

  // ✅ Filtering Engine: Combines Search + Status/Column Filters
  const filteredData = useMemo(() => {
    let result = Array.isArray(data) ? [...data] : [];

    // 1. Apply Search
    if (localSearchTerm) {
      const lowerSearch = String(localSearchTerm).toLowerCase();
      result = result.filter(item => {
        if (!item) return false;
        return Object.values(item).some((val) => 
            String(val ?? "").toLowerCase().includes(lowerSearch)
        );
      });
    }

    // 2. Apply Column Filters (like Status)
    Object.entries(activeFilters).forEach(([key, val]) => {
      result = result.filter(item => {
        if (!item) return false;
        // String conversion ensures '1' matches 1
        return String(item[key] ?? "") === String(val);
      });
    });

    return result;
  }, [data, localSearchTerm, activeFilters]);

  const totalPagesCount = Math.ceil(filteredData.length / (pagination?.itemsPerPage || 10));

  // --- Drag Scroll Handlers ---
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleSelectAll = (checked: boolean) => {
    const keys = checked ? filteredData.map(d => d.id || d._id || d.key) : [];
    setSelectedRowKeys(keys);
    onSelectionChange?.(checked ? filteredData : []);
  };

  const handleRowSelect = (record: any) => {
    const key = record.id || record._id || record.key;
    const newKeys = selectedRowKeys.includes(key) 
      ? selectedRowKeys.filter(k => k !== key) 
      : [...selectedRowKeys, key];
    setSelectedRowKeys(newKeys);
    onSelectionChange?.(filteredData.filter(d => newKeys.includes(d.id || d._id || d.key)));
  };

  return (
    <div className={`flex flex-col w-full bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden ${className}`}>
      
      {/* Search Header */}
      <div className="p-6 bg-white border-b border-slate-50">
        {enableSearch && (
          <div className="relative w-full max-w-sm group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={localSearchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50/50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-400 transition-all text-sm font-medium"
            />
          </div>
        )}
      </div>

      {/* Table Area */}
      <div 
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} onMouseMove={handleMouseMove}
        className={`relative overflow-x-auto overflow-y-auto hide-scrollbar select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{ maxHeight: filteredData.length > 6 ? "480px" : "auto" }}
      >
        <table className="w-full border-separate border-spacing-0">
          <thead className="sticky top-0 z-50">
            <tr>
              {showSelection && (
                <th className="px-6 py-5 w-16 text-center sticky left-0 z-[51] bg-white border-b border-slate-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                  <input
                    type="checkbox"
                    checked={filteredData.length > 0 && selectedRowKeys.length === filteredData.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </th>
              )}
              {visibleColumns.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.width, minWidth: col.minWidth || '150px', textAlign: col.align || 'left' }}
                  className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] bg-white border-b border-slate-100"
                >
                  <div className="flex items-center gap-2 relative">
                    {col.title}
                    {col.filterable && (
                      <div className="relative">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenFilterDropdown(openFilterDropdown === col.key ? null : col.key);
                          }}
                          className={`p-1 rounded-md transition-all ${activeFilters[col.key] ? 'bg-indigo-50 text-indigo-600' : 'text-slate-300 hover:text-slate-500'}`}
                        >
                          <Filter size={13} />
                        </button>
                        
                        {/* ✅ Status/Filter Dropdown UI */}
                        <AnimatePresence>
                          {openFilterDropdown === col.key && (
                            <motion.div
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.95 }}
                              className="absolute top-full mt-2 left-0 w-48 bg-white rounded-xl shadow-2xl border border-slate-100 p-2 z-[100]"
                            >
                              <div className="flex items-center justify-between px-2 py-1 mb-1 border-b border-slate-50">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Filter By</span>
                                <X size={12} className="cursor-pointer text-slate-300 hover:text-rose-500" onClick={() => setOpenFilterDropdown(null)} />
                              </div>
                              <button onClick={() => handleFilterChange(col.key, '')} className="w-full text-left px-3 py-2 text-xs text-slate-500 hover:bg-slate-50 rounded-lg">Clear All</button>
                              {col.filterOptions?.map(opt => (
                                <button 
                                  key={opt.value} 
                                  onClick={() => handleFilterChange(col.key, opt.value)} 
                                  className={`w-full text-left px-3 py-2 text-xs rounded-lg mt-1 flex items-center justify-between ${activeFilters[col.key] === opt.value ? 'bg-indigo-50 text-indigo-600 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                                >
                                  {opt.label}
                                  {activeFilters[col.key] === opt.value && <Check size={12} />}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                </th>
              ))}
              {hasActions && (
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] text-center sticky right-0 z-[51] bg-white border-b border-slate-100 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          
          <tbody className="bg-white">
            <AnimatePresence mode="popLayout">
              {loading ? (
                <tr>
                    <td colSpan={100} className="py-32 text-center"><Loader2 className="mx-auto text-indigo-600 animate-spin" size={40} /></td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan={100} className="py-24 text-center text-slate-400 text-sm font-medium italic">{emptyMessage}</td></tr>
              ) : (
                filteredData.map((record, idx) => {
                  const isSelected = selectedRowKeys.includes(record.id || record._id || record.key);
                  const actions = typeof actionButtons === 'boolean' ? {} : actionButtons;

                  return (
                    <motion.tr
                      key={record.id || record._id || idx}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      onClick={() => onRowClick?.(record, idx)}
                      className={`group transition-all ${isSelected ? 'bg-indigo-50/40' : 'bg-white hover:bg-slate-50/50'}`}
                    >
                      {showSelection && (
                        <td className={`px-6 py-4 text-center sticky left-0 z-20 border-b border-slate-50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] ${isSelected ? 'bg-indigo-50' : 'bg-white group-hover:bg-slate-50'}`}>
                          <input type="checkbox" checked={isSelected} onChange={() => handleRowSelect(record)} onClick={(e) => e.stopPropagation()} className="w-4 h-4 rounded-md text-indigo-600 cursor-pointer" />
                        </td>
                      )}
                      {visibleColumns.map((col) => (
                        <td key={col.key} className="px-6 py-5 text-sm font-medium text-slate-600 whitespace-nowrap border-b border-slate-50">
                          {col.render ? col.render(record[col.dataIndex], record, idx) : record[col.dataIndex]}
                        </td>
                      ))}
                      {hasActions && (
                        <td className={`px-6 py-4 text-center sticky right-0 z-20 border-b border-slate-50 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.05)] ${isSelected ? 'bg-indigo-50' : 'bg-white group-hover:bg-slate-50'}`}>
                          <div className="flex items-center justify-center gap-1">
                            {actions?.showView && <button onClick={(e) => { e.stopPropagation(); actions.onView?.(record); }} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Eye size={17} /></button>}
                            {actions?.showEdit && <button onClick={(e) => { e.stopPropagation(); actions.onEdit?.(record); }} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"><Edit3 size={17} /></button>}
                            {actions?.showDelete && <button onClick={(e) => { e.stopPropagation(); actions.onDelete?.(record); }} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={17} /></button>}
                          </div>
                        </td>
                      )}
                    </motion.tr>
                  );
                })
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Footer / Pagination */}
      <div className="px-8 py-6 flex flex-col lg:flex-row items-center justify-between gap-6 border-t border-slate-100 bg-white">
        <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400">
          <span>Showing <b>{filteredData.length > 0 ? (pagination.currentPage - 1) * pagination.itemsPerPage + 1 : 0} to {Math.min(pagination.currentPage * pagination.itemsPerPage, filteredData.length)}</b> of <b>{filteredData.length}</b></span>
          <select 
            value={pagination.itemsPerPage}
            onChange={(e) => pagination.onItemsPerPageChange?.(Number(e.target.value))}
            className="bg-slate-50 border border-slate-100 text-slate-700 text-xs font-bold rounded-xl p-2 cursor-pointer outline-none focus:ring-2 focus:ring-indigo-500/10"
          >
            {[10, 20, 50, 100].map(size => <option key={size} value={size}>{size} Rows</option>)}
          </select>
        </div>
        
        <div className="flex items-center gap-3">
          <button disabled={pagination.currentPage === 1} onClick={() => pagination.onPageChange(pagination.currentPage - 1)} className="p-2 rounded-2xl border border-slate-200 bg-white text-slate-400 hover:text-indigo-600 shadow-sm transition-all disabled:opacity-30"><ChevronLeft size={20} /></button>
          <div className="flex gap-2">
            {[...Array(totalPagesCount)].map((_, i) => (
              <button 
                key={i} 
                onClick={() => pagination.onPageChange(i + 1)}
                className={`w-10 h-10 rounded-2xl text-xs font-black transition-all ${pagination.currentPage === i + 1 ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 scale-105' : 'bg-white text-slate-500 border border-slate-100 hover:border-indigo-200'}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button disabled={pagination.currentPage >= totalPagesCount} onClick={() => pagination.onPageChange(pagination.currentPage + 1)} className="p-2 rounded-2xl border border-slate-200 bg-white text-slate-400 hover:text-indigo-600 shadow-sm transition-all disabled:opacity-30"><ChevronRight size={20} /></button>
        </div>
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        table { border-collapse: separate; }
      `}</style>
    </div>
  );
};

export default Table;