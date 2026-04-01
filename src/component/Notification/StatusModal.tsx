import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import Reusable_Button from "../button/Reusable_Button";

// Use 'import type' here to fix the SyntaxError
import type { StatusType } from "./statusHandler";

interface StatusModalProps {
  isOpen: boolean;
  type?: StatusType;
  title?: string;
  message?: string;
  buttonText?: string;
  cancelText?: string;
  onClose: () => void;
  onConfirm?: () => void;
}

// ... rest of the code remains the same as previous response ...
// (The getConfig function, the motion variants, and the component return)

const getConfig = (type: StatusType) => {
    switch (type) {
      case "success":
        return { img: "/success.jpg", color: "text-green-500", defaultTitle: "Awesome!", btn: "Done" };
      case "error":
        return { img: "/error2.jpg", color: "text-pink-500", defaultTitle: "Oops...", btn: "Try Again" };
      case "warning":
        return { img: "/warning.png", color: "text-yellow-500", defaultTitle: "Warning!", btn: "Okay" };
      case "confirm":
        return { img: "/confirm.png", color: "text-blue-500", defaultTitle: "Confirm?", btn: "Confirm" };
      default:
        return { img: "", color: "text-gray-500", defaultTitle: "", btn: "Okay" };
    }
  };

const StatusModal: React.FC<StatusModalProps> = ({
  isOpen,
  type = "success",
  title,
  message,
  buttonText,
  cancelText = "Cancel",
  onClose,
  onConfirm,
}) => {
  const config = getConfig(type);
  const isConfirmType = type === "confirm";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-2xl w-full max-w-sm p-8 text-center space-y-4 shadow-2xl"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {config.img && <img src={config.img} alt="status" className="w-40 mx-auto" />}
            
            <div className="space-y-1">
              <h2 className={`text-2xl font-bold ${config.color}`}>{title || config.defaultTitle}</h2>
              <p className="text-gray-600 font-medium">{message}</p>
            </div>

            <div className={`flex items-center gap-3 ${isConfirmType ? "flex-row" : "justify-center"}`}>
              {isConfirmType && (
                <button
                  onClick={onClose}
                  className="flex-1 px-5 py-2.5 rounded-lg font-semibold text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  {cancelText}
                </button>
              )}
              
              <div className={isConfirmType ? "flex-1" : "w-full flex justify-center"}>
                <Reusable_Button
                  text={buttonText || config.btn}
                  onClick={isConfirmType ? onConfirm : onClose}
                  variant="primary"
                  size="w-full py-2.5"
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StatusModal;