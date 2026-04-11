import { motion } from "framer-motion";
import type { ChangeEvent } from "react";
import React from "react";
import { useSelector } from "react-redux";

interface Props {
  label: string;
  type: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  dragHandleProps?: any;
}

export const InputField: React.FC<Props> = React.memo(
  ({ label, type, name, value, onChange }) => {
    const { primaryColor, darkMode } = useSelector((state: any) => state.theme);
    
    const getInputBg = () => {
      if (darkMode) {
        return "bg-gray-800/50 text-gray-200 border-gray-700";
      }
      return "bg-white/10 text-white border-white/10";
    };
    
    const getLabelColor = () => {
      return darkMode ? "text-gray-400" : "text-white/70";
    };
    
    const getPlaceholderColor = () => {
      return darkMode ? "placeholder:text-gray-500" : "placeholder:text-white/40";
    };
    
    const getFocusRing = () => {
      return `focus:ring-2 focus:ring-${primaryColor}-500`;
    };

    return (
      <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
        <div className="mb-4 flex items-center gap-2">
          <div className="w-full">
            <label className={`block text-sm mb-1 ${getLabelColor()}`}>
              {label}
            </label>
            {type === "textarea" ? (
              <textarea
                name={name}
                value={value}
                onChange={onChange}
                rows={3}
                className={`
                  w-full px-3 py-2 rounded-lg text-sm
                  border backdrop-blur-md
                  focus:outline-none ${getFocusRing()}
                  transition-all duration-200
                  ${getInputBg()} ${getPlaceholderColor()}
                `}
              />
            ) : (
              <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                className={`
                  w-full px-3 py-2 rounded-lg text-sm
                  border backdrop-blur-md
                  focus:outline-none ${getFocusRing()}
                  transition-all duration-200
                  ${getInputBg()} ${getPlaceholderColor()}
                `}
              />
            )}
          </div>
        </div>
      </motion.div>
    );
  }
);

InputField.displayName = "InputField";