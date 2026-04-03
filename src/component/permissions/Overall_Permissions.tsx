import { AnimatePresence, motion, type Variants } from "framer-motion";
import { CheckSquare, ShieldCheck, Square } from "lucide-react";
import React from "react";
import { useSelector } from "react-redux";
import Reusable_Button from "../button/Reusable_Button";

//  Permission fields type
export type PermissionField = "create" | "view" | "edit" | "delete";

//  Strict Permission type (removed `any`)
export interface Permission {
  module: string;
  create: boolean;
  view: boolean;
  edit: boolean;
  delete: boolean;
}

//  Props type
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
  //  1. Toggle single permission (SAFE immutable update)
  const togglePermission = (index: number, field: PermissionField) => {
    setPermissions((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: !item[field] } : item
      )
    );
  };
     const {permissions} = useSelector((state : any) => state.auth)
  const Roles = permissions[5]

  //  2. Toggle entire row
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

  //  3. Toggle ALL permissions
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

  //  Format module name
  const formatModuleName = (name: string): string => {
    return name
      ?.split("_")
      ?.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      ?.join(" ") || "";
  };

  //  Animation
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

  //  Master checkbox state
  const isGloballyChecked =
    permissionss.length > 0 &&
    permissionss.every(
      (item) => item.create && item.view && item.edit && item.delete
    );

  //  Empty state
  if (!permissionss.length) {
    return (
      <div className="p-10 text-center text-slate-400 italic bg-white rounded-2xl border border-dashed border-slate-200">
        No modules available to display.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 p-6 border-b border-slate-50 bg-slate-50/30"
      >
        <div className="p-2.5 bg-blue-50 rounded-xl">
          <ShieldCheck className="text-[#0062a0]" size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            Module Access Control
          </h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            Configure permissions
          </p>
        </div>
      </motion.div>
     {customizeButtom && (
       <motion.div>
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
              <tr className="bg-slate-50 border-b">
                {/* MASTER */}
                <th className="p-5 text-center">
                  <button type="button" onClick={toggleAllPermissions}>
                    {isGloballyChecked ? (
                      <CheckSquare size={22} className="text-[#0062a0]" />
                    ) : (
                      <Square size={22} className="text-slate-300" />
                    )}
                  </button>
                </th>

                <th className="p-5 text-left text-xs font-bold uppercase">
                  Module
                </th>

                {["Create", "View", "Edit", "Delete"].map((head) => (
                  <th key={head} className="p-5 text-center text-xs font-bold uppercase">
                    {head}
                  </th>
                ))}
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
                      className="border-b hover:bg-slate-50"
                    >
                      {/* ROW TOGGLE */}
                      <td className="p-4 text-center">
                        <button type="button" onClick={() => toggleRow(index)}>
                          {isRowChecked ? (
                            <CheckSquare size={22} className="text-[#0062a0]" />
                          ) : (
                            <Square size={22} />
                          )}
                        </button>
                      </td>

                      {/* MODULE */}
                      <td className="p-4 font-semibold">
                        {formatModuleName(item.module)}
                      </td>

                      {/* PERMISSIONS */}
                      {(["create", "view", "edit", "delete"] as PermissionField[]).map(
                        (field) => (
                          <td key={field} className="p-4 text-center">
                            <button onClick={() => togglePermission(index, field)}>
                              {item[field] ? (
                                <CheckSquare size={22} className="text-[#0062a0]" />
                              ) : (
                                <Square size={22} className="text-slate-300" />
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