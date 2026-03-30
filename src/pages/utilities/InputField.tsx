import type { ChangeEvent } from "react";
import { motion } from "framer-motion";
import React from "react";

interface Props {
  label: string;
  type: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  dragHandleProps?: any;
}

export const InputField: React.FC<Props> = React.memo(
  ({ label, type, name, value, onChange }) => (
    <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
      <div className="mb-4 flex items-center gap-2">
        <div className="w-full">
          <label className="block text-sm text-white/70 mb-1">{label}</label>
          {type === "textarea" ? (
            <textarea
              name={name}
              value={value}
              onChange={onChange}
              rows={3}
              className="
                w-full px-3 py-2 rounded-lg
                bg-white/10 text-white text-sm
                border border-white/10
                focus:outline-none focus:ring-2 focus:ring-indigo-500
                backdrop-blur-md
                placeholder:text-white/40
              "
            />
          ) : (
            <input
              type={type}
              name={name}
              value={value}
              onChange={onChange}
              className="
                w-full px-3 py-2 rounded-lg
                bg-white/10 text-white text-sm
                border border-white/10
                focus:outline-none focus:ring-2 focus:ring-indigo-500
                backdrop-blur-md
                placeholder:text-white/40
              "
            />
          )}
        </div>
      </div>
    </motion.div>
  ),
);

InputField.displayName = "InputField";
