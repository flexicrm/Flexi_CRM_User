import { AnimatePresence, motion, type Variants } from "framer-motion";
import { CheckSquare, ShieldCheck, Square } from "lucide-react";
import React from "react";
import { useSelector } from "react-redux";
import Reusable_Button from "../button/Reusable_Button";

// Permission fields type
export type PermissionField = "create" | "view" | "edit" | "delete";

// Strict Permission type
export interface Permission {
  module: string;
  create: boolean;
  view: boolean;
  edit: boolean;
  delete: boolean;
}

// Props type
interface OverallPermissionsProps {
  permissionss: Permission[];
  setPermissions: React.Dispatch<React.SetStateAction<Permission[]>>;
  customizeButtom?: boolean;
  deleteOnclick?: () => void;
  editOnclick?: () => void;
}

const Overall_Permissions: React.FC<OverallPermissionsProps> = ({
  customizeButtom,
  permissionss = [],
  setPermissions,
  deleteOnclick,
  editOnclick
}) => {
  const { primaryColor, darkMode } = useSelector((state: any) => state.theme);
  const { permissions } = useSelector((state: any) => state.auth);
  const Roles = permissions[5];

  // Theme-based styles
  const getContainerBg = () => darkMode ? 'bg-gray-800' : 'bg-white';
  const getContainerBorder = () => darkMode ? 'border-gray-700' : 'border-slate-100';
  const getHeaderBg = () => darkMode ? 'bg-gray-700/30' : 'bg-slate-50/30';
  const getHeaderBorder = () => darkMode ? 'border-gray-700' : 'border-slate-50';
  const getHeaderIconBg = () => darkMode ? 'bg-gray-700' : 'bg-blue-50';
  const getHeaderIconColor = () => darkMode ? primaryColor || '#818CF8' : '#0062a0';
  const getHeaderTitleColor = () => darkMode ? 'text-gray-200' : 'text-slate-800';
  const getHeaderSubtitleColor = () => darkMode ? 'text-gray-500' : 'text-slate-400';
  const getTableHeaderBg = () => darkMode ? 'bg-gray-700/50' : 'bg-slate-50';
  const getTableHeaderBorder = () => darkMode ? 'border-gray-700' : 'border-gray-200';
  const getTableHeaderTextColor = () => darkMode ? 'text-gray-300' : 'text-slate-600';
  const getTableRowBorder = () => darkMode ? 'border-gray-700' : 'border-gray-200';
  const getTableRowHoverBg = () => darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-slate-50';
  const getModuleTextColor = () => darkMode ? 'text-gray-200' : 'text-slate-800';
  const getEmptyStateBg = () => darkMode ? 'bg-gray-800' : 'bg-white';
  const getEmptyStateBorder = () => darkMode ? 'border-gray-700' : 'border-slate-200';
  const getEmptyStateTextColor = () => darkMode ? 'text-gray-500' : 'text-slate-400';
  const getColumnSelectButtonBg = () => darkMode ? 'hover:bg-gray-600/50' : 'hover:bg-slate-100';
  const getColumnSelectButtonColor = () => darkMode ? 'text-gray-400' : 'text-slate-500';

  // 1. Toggle single permission (SAFE immutable update)
  const togglePermission = (index: number, field: PermissionField) => {
    setPermissions((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: !item[field] } : item
      )
    );
  };

  // 2. Toggle entire row
  const toggleRow = (index: number) => {
    setPermissions((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;

        const allChecked =
          item.create && item.view && item.edit && item.delete;

        return {
          ...item,
          create: !allChecked,
          view: !allChecked,
          edit: !allChecked,
          delete: !allChecked,
        };
      })
    );
  };

  // 3. Toggle ALL permissions (all modules, all columns)
  const toggleAllPermissions = () => {
    setPermissions((prev) => {
      const isGloballyChecked = prev.every(
        (item) => item.create && item.view && item.edit && item.delete
      );

      return prev.map((item) => ({
        ...item,
        create: !isGloballyChecked,
        view: !isGloballyChecked,
        edit: !isGloballyChecked,
        delete: !isGloballyChecked,
      }));
    });
  };

  // 4. Toggle column for all rows
  const toggleColumnForAll = (field: PermissionField) => {
    setPermissions((prev) => {
      const isColumnFullyChecked = prev.every((item) => item[field] === true);
      
      return prev.map((item) => ({
        ...item,
        [field]: !isColumnFullyChecked
      }));
    });
  };

  // Get column check status
  const getColumnCheckStatus = (field: PermissionField): {
    isFullyChecked: boolean;
    isPartiallyChecked: boolean;
  } => {
    if (permissionss.length === 0) {
      return { isFullyChecked: false, isPartiallyChecked: false };
    }
    
    const checkedCount = permissionss.filter((item) => item[field] === true).length;
    const isFullyChecked = checkedCount === permissionss.length;
    const isPartiallyChecked = checkedCount > 0 && checkedCount < permissionss.length;
    
    return { isFullyChecked, isPartiallyChecked };
  };

  // Format module name
  const formatModuleName = (name: string): string => {
    return name
      ?.split("_")
      ?.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      ?.join(" ") || "";
  };

  // Animation
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const rowVariants: Variants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
  };

  // Master checkbox state
  const isGloballyChecked =
    permissionss.length > 0 &&
    permissionss.every(
      (item) => item.create && item.view && item.edit && item.delete
    );

  // Empty state
  if (!permissionss.length) {
    return (
      <div className={`p-10 text-center italic rounded-2xl border border-dashed ${getEmptyStateBg()} ${getEmptyStateBorder()} ${getEmptyStateTextColor()}`}>
        No modules available to display.
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border overflow-hidden ${getContainerBg()} ${getContainerBorder()}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-3 p-6 border-b ${getHeaderBg()} ${getHeaderBorder()}`}
        >
          <div className={`p-2.5 rounded-xl ${getHeaderIconBg()}`}>
            <ShieldCheck className={getHeaderIconColor()} size={24} />
          </div>
          <div>
            <h2 className={`text-xl font-bold ${getHeaderTitleColor()}`}>
              Module Access Control
            </h2>
            <p className={`text-[10px] font-bold uppercase tracking-widest ${getHeaderSubtitleColor()}`}>
              Configure permissions
            </p>
          </div>
        </motion.div>
        {customizeButtom && (
          <motion.div className="flex items-center gap-2 mr-4">
            <Reusable_Button
              variant="primary"
              text="Edit"
              size="px-4 py-2.5"
              className="m-2"
              onClick={editOnclick}
              disabled={!Roles?.canEdit}
            />
            <Reusable_Button
              variant="primary"
              text="Delete"
              size="px-4 py-2.5"
              className="m-2"
              onClick={deleteOnclick}
              disabled={!Roles?.canDelete}
            />
          </motion.div>
        )}
      </div>

      {/* Table */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className={`border-b ${getTableHeaderBg()} ${getTableHeaderBorder()}`}>
                {/* MASTER CHECKBOX - All Modules, All Columns */}
                <th className="p-5 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <button 
                      type="button" 
                      onClick={toggleAllPermissions}
                      className="transition-transform hover:scale-105"
                      title="Toggle all permissions for all modules"
                    >
                      {isGloballyChecked ? (
                        <CheckSquare size={22} style={{ color: primaryColor || '#0062a0' }} />
                      ) : (
                        <Square size={22} className={darkMode ? 'text-gray-500' : 'text-slate-300'} />
                      )}
                    </button>
                    <span className={`text-[10px] font-normal ${getColumnSelectButtonColor()}`}>
                      All
                    </span>
                  </div>
                </th>

                <th className={`p-5 text-left text-xs font-bold uppercase ${getTableHeaderTextColor()}`}>
                  Module
                </th>

                {/* Column headers with select all for each column */}
                {(["create", "view", "edit", "delete"] as PermissionField[]).map((field) => {
                  const { isFullyChecked, isPartiallyChecked } = getColumnCheckStatus(field);
                  const displayName = field.charAt(0).toUpperCase() + field.slice(1);
                  
                  return (
                    <th key={field} className="p-5 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <button
                          type="button"
                          onClick={() => toggleColumnForAll(field)}
                          className={`transition-transform hover:scale-105 p-1 rounded ${getColumnSelectButtonBg()}`}
                          title={`Toggle ${displayName} permission for all modules`}
                        >
                          {isFullyChecked ? (
                            <CheckSquare size={22} style={{ color: primaryColor || '#0062a0' }} />
                          ) : isPartiallyChecked ? (
                            <div className="relative">
                              <Square size={22} className={darkMode ? 'text-gray-500' : 'text-slate-300'} />
                              <div 
                                className="absolute inset-0 flex items-center justify-center"
                                style={{ color: primaryColor || '#0062a0' }}
                              >
                                <div className="w-3 h-0.5 bg-current rounded"></div>
                              </div>
                            </div>
                          ) : (
                            <Square size={22} className={darkMode ? 'text-gray-500' : 'text-slate-300'} />
                          )}
                        </button>
                        <span className={`text-[10px] font-normal ${getColumnSelectButtonColor()}`}>
                          {displayName}
                        </span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              <AnimatePresence>
                {permissionss.map((item, index) => {
                  const isRowChecked =
                    item.create && item.view && item.edit && item.delete;

                  return (
                    <motion.tr
                      key={item.module}
                      variants={rowVariants}
                      className={`border-b transition-colors ${getTableRowBorder()} ${getTableRowHoverBg()}`}
                    >
                      {/* ROW TOGGLE */}
                      <td className="p-4 text-center">
                        <button 
                          type="button" 
                          onClick={() => toggleRow(index)}
                          className="transition-transform hover:scale-105"
                          title="Toggle all permissions for this module"
                        >
                          {isRowChecked ? (
                            <CheckSquare size={22} style={{ color: primaryColor || '#0062a0' }} />
                          ) : (
                            <Square size={22} className={darkMode ? 'text-gray-500' : 'text-slate-300'} />
                          )}
                        </button>
                      </td>

                      {/* MODULE */}
                      <td className={`p-4 font-semibold ${getModuleTextColor()}`}>
                        {formatModuleName(item.module)}
                      </td>

                      {/* PERMISSIONS */}
                      {(["create", "view", "edit", "delete"] as PermissionField[]).map(
                        (field) => (
                          <td key={field} className="p-4 text-center">
                            <button 
                              onClick={() => togglePermission(index, field)}
                              className="transition-transform hover:scale-105"
                              title={`Toggle ${field} permission for ${formatModuleName(item.module)}`}
                            >
                              {item[field] ? (
                                <CheckSquare size={22} style={{ color: primaryColor || '#0062a0' }} />
                              ) : (
                                <Square size={22} className={darkMode ? 'text-gray-500' : 'text-slate-300'} />
                              )}
                            </button>
                          </td>
                        )
                      )}
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default Overall_Permissions;