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
      return { 
        img: "/success_boy.png", // Must be transparent .png!
        bgColor: "bg-[#c4f49c]", 
        btnColor: "bg-[#4ade80] hover:bg-[#22c55e]",
        defaultTitle: "Great!", 
        btnText: "Done"
      };
    case "error":
      return { 
        img: "/error_boy.png", // Must be transparent .png!
        bgColor: "bg-[#fce3e3]", 
        btnColor: "bg-[#f87171] hover:bg-[#ef4444]",
        defaultTitle: "Oops...", 
        btnText: "Retry"
      };
    case "warning":
      return { 
        img: "/warning.png", 
        bgColor: "bg-[#fef08a]", 
        btnColor: "bg-[#eab308] hover:bg-[#ca8a04]",
        defaultTitle: "Warning!",
        btnText: "Okay"
      };
    case "confirm":
      return { 
        img: "/confirm.png", 
        bgColor: "bg-[#bfdbfe]", 
        btnColor: "bg-[#3b82f6] hover:bg-[#2563eb]",
        defaultTitle: "Confirm?",
        btnText: "Confirm"
      };
    default:
      return { img: "", bgColor: "bg-gray-100", btnColor: "bg-gray-500", defaultTitle: "", btnText: "Okay" };
  }
};

const StatusModal: React.FC<StatusModalProps> = ({
  isOpen,
  type = "success",
  title,
  message = "",
  buttonText,
  cancelText = "Cancel",
  onClose,
  onConfirm,
}) => {
  const config = getConfig(type);
  const isConfirmType = type === "confirm";
  const isDesignedType = type === "success" || type === "error";

  // Split message to format the first line bolder 
  const messageLines = message.split('\n');
  const primaryMessage = messageLines[0];
  const secondaryMessage = messageLines.length > 1 ? messageLines.slice(1).join('\n') : "";

  const handleButtonClick = () => {
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
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative bg-white rounded-[28px] w-full max-w-[310px] overflow-hidden shadow-2xl"
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Right Close Button (Always top-most layer) */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-50 w-[30px] h-[30px] bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm text-gray-500 hover:text-black hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            {/* LAYER 1: Background Color & Image (Sits in the back) */}
            {isDesignedType && (
              <div className={`relative w-full h-[200px] ${config.bgColor}`}>
                {config.img && (
                  <img 
                    src={config.img} 
                    alt={type} 
                    // Lowered the image using 'bottom-[15px]' so the white box cuts it off
                    className="absolute bottom-[15px] left-1/2 -translate-x-1/2 h-[155px] object-contain drop-shadow-sm"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                )}
              </div>
            )}

            {/* LAYER 2: White Foreground Shape (Overlaps the image to cut it off) */}
            <div 
              className={`relative z-10 bg-white w-full flex flex-col items-center px-6 pb-6 text-center ${!isDesignedType ? 'pt-10' : ''}`}
              style={isDesignedType ? {
                marginTop: '-50px', // Pulls the white section UP to overlap the top section
                paddingTop: '50px', // Adds inner padding so text doesn't touch the slanted line
                clipPath: 'polygon(0 40px, 100% 0, 100% 100%, 0 100%)' // Creates the slant
              } : {}}
            >
              
              {/* Show simple image layout for warning/confirm alerts */}
              {!isDesignedType && config.img && (
                <div className="h-[100px] w-full flex items-end justify-center mb-5">
                  <img src={config.img} alt={type} className="h-full object-contain drop-shadow-sm"/>
                </div>
              )}

              {/* Typography */}
              <h2 className="text-[28px] font-semibold text-black mb-2 tracking-tight">
                {title || config.defaultTitle}
              </h2>

              {/* Message Formatting */}
              <div className="flex flex-col gap-1.5 mb-6">
                <p className="text-[15px] font-medium text-gray-800">
                  {primaryMessage}
                </p>
                {secondaryMessage && (
                  <p className="text-[14px] text-gray-500 whitespace-pre-line">
                    {secondaryMessage}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className={`w-full flex items-center gap-3 ${isConfirmType ? "flex-row" : "justify-center"}`}>
                {isConfirmType && (
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 py-3 rounded-[14px] font-semibold text-gray-600 hover:bg-gray-100 transition-colors border border-gray-200 text-[15px]"
                  >
                    {cancelText}
                  </button>
                )}
                
                <div className={isConfirmType ? "flex-1" : "w-full"}>
                  <button
                    onClick={handleButtonClick}
                    className={`w-full px-4 py-3 rounded-[14px] font-semibold text-white shadow-sm transition-all active:scale-[0.98] text-[15px] ${config.btnColor}`}
                  >
                    {buttonText || config.btnText}
                  </button>
                </div>
              </div>

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StatusModal;