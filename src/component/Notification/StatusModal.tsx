import { AnimatePresence, motion } from "framer-motion";
import React from "react";
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

const getConfig = (type: StatusType) => {
  switch (type) {
    case "success":
      return { img: "/success.jpg", color: "text-green-500", defaultTitle: "Success!", btn: "Done" };
    case "error":
      return { img: "/error2.jpg", color: "text-red-500", defaultTitle: "Error!", btn: "Try Again" };
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

  const handleButtonClick = () => {
    console.log('Button clicked for type:', type);
    if (isConfirmType && onConfirm) {
      onConfirm();
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
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
            {config.img && (
              <img 
                src={config.img} 
                alt="status" 
                className="w-32 h-32 mx-auto object-contain"
                onError={(e) => {
                  console.error('Failed to load image:', config.img);
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            
            <div className="space-y-2">
              <h2 className={`text-2xl font-bold ${config.color}`}>
                {title || config.defaultTitle}
              </h2>
              <p className="text-gray-600 font-medium break-words">
                {message}
              </p>
            </div>

            <div className={`flex items-center gap-3 ${isConfirmType ? "flex-row" : "justify-center"}`}>
              {isConfirmType && (
                <button
                  onClick={onClose}
                  className="flex-1 px-5 py-2.5 rounded-lg font-semibold text-gray-600 hover:bg-gray-100 transition-colors border border-gray-300"
                >
                  {cancelText}
                </button>
              )}
              
              <div className={isConfirmType ? "flex-1" : "w-full"}>
                <button
                  onClick={handleButtonClick}
                  className={`w-full px-5 py-2.5 rounded-lg font-semibold text-white transition-all ${
                    type === 'error' 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : type === 'success'
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-gradient-to-r from-[#05264e] to-[#0a3a6e] hover:shadow-lg'
                  }`}
                >
                  {buttonText || config.btn}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StatusModal;