import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import { useSelector } from "react-redux";
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

const getConfig = (type: StatusType, primaryColor?: string) => {
  switch (type) {
    case "success":
      return { 
        img: "/success_boy.png",
        bgColor: "bg-gradient-to-br from-green-400 to-green-500",
        btnColor: primaryColor ? `bg-[${primaryColor}] hover:opacity-90` : "bg-gradient-to-r from-green-500 to-green-600",
        defaultTitle: "Success!", 
        btnText: "Done",
        icon: "✅"
      };
    case "error":
      return { 
        img: "/error_boy.png",
        bgColor: "bg-gradient-to-br from-red-400 to-red-500",
        btnColor: "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700",
        defaultTitle: "Error!", 
        btnText: "Try Again",
        icon: "❌"
      };
    case "warning":
      return { 
        img: "/warning.png", 
        bgColor: "bg-gradient-to-br from-yellow-400 to-yellow-500",
        btnColor: "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700",
        defaultTitle: "Warning!",
        btnText: "Okay",
        icon: "⚠️"
      };
    case "confirm":
      return { 
        img: "/confirmationPopup.png", 
        bgColor: primaryColor ? `bg-gradient-to-br from-[${primaryColor}] to-[${primaryColor}cc]` : "bg-gradient-to-br from-blue-500 to-purple-600",
        btnColor: primaryColor ? `bg-[${primaryColor}] hover:opacity-90` : "bg-gradient-to-r from-blue-500 to-purple-600",
        defaultTitle: "Confirm?",
        btnText: "Confirm",
        icon: "❓"
      };
    default:
      return { 
        img: "", 
        bgColor: "bg-gradient-to-br from-gray-400 to-gray-500", 
        btnColor: "bg-gradient-to-r from-gray-500 to-gray-600",
        defaultTitle: "Notice",
        btnText: "Okay",
        icon: "ℹ️"
      };
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
  // Safely get theme with fallback for when Redux is not available
  let primaryColor = "#3b82f6";
  let darkMode = false;
  
  try {
    const theme = useSelector((state: any) => state?.theme);
    if (theme) {
      primaryColor = theme.primaryColor || "#3b82f6";
      darkMode = theme.darkMode || false;
    }
  } catch (error) {
    console.warn("Redux theme not available, using fallback colors");
  }
  
  const config = getConfig(type, primaryColor,);
  const isConfirmType = type === "confirm";

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

  // Get dynamic button style
  const getButtonStyle = () => {
    if (type === "success") {
      return { background: primaryColor ? primaryColor : "linear-gradient(135deg, #22c55e, #16a34a)" };
    }
    if (type === "error") {
      return { background: "linear-gradient(135deg, #ef4444, #dc2626)" };
    }
    if (type === "warning") {
      return { background: "linear-gradient(135deg, #eab308, #ca8a04)" };
    }
    if (type === "confirm") {
      return { background: primaryColor ? primaryColor : "linear-gradient(135deg, #3b82f6, #8b5cf6)" };
    }
    return { background: "linear-gradient(135deg, #6b7280, #4b5563)" };
  };

  // Get background style for the colored section
  const getBgStyle = () => {
    if (type === "success") {
      return { background: primaryColor ? `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)` : "linear-gradient(135deg, #22c55e, #16a34a)" };
    }
    if (type === "error") {
      return { background: "linear-gradient(135deg, #ef4444, #dc2626)" };
    }
    if (type === "warning") {
      return { background: "linear-gradient(135deg, #eab308, #ca8a04)" };
    }
    if (type === "confirm") {
      return { background: primaryColor ? `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)` : "linear-gradient(135deg, #3b82f6, #8b5cf6)" };
    }
    return { background: "linear-gradient(135deg, #6b7280, #4b5563)" };
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={`fixed inset-0 flex items-center justify-center z-[9999] p-4 ${
            darkMode ? 'bg-black/60 backdrop-blur-sm' : 'bg-black/40 backdrop-blur-[2px]'
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={`relative rounded-[28px] w-full max-w-[340px] overflow-hidden shadow-2xl ${
              darkMode ? 'bg-gray-900' : 'bg-white'
            }`}
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Right Close Button */}
            <button
              onClick={onClose}
              className={`absolute top-3 right-3 z-50 w-[30px] h-[30px] rounded-full flex items-center justify-center shadow-sm transition-all duration-200 ${
                darkMode 
                  ? 'bg-gray-800/80 text-gray-400 hover:bg-gray-700 hover:text-white' 
                  : 'bg-white/80 backdrop-blur-sm text-gray-500 hover:bg-gray-100 hover:text-black'
              }`}
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            {/* Top Colored Section with Image */}
            <div 
              className="relative w-full h-[220px] overflow-hidden"
              style={getBgStyle()}
            >
              {/* Animated background circles */}
              <motion.div
                className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-white/10"
                animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-white/10"
                animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              />
              
              {/* Icon or Image */}
              {config.img ? (
                <img 
                  src={config.img} 
                  alt={type} 
                  className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-[160px] object-contain drop-shadow-lg"
                  style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}
                  onError={(e) => { 
                    e.currentTarget.style.display = 'none';
                    // Show emoji fallback
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      const fallback = document.createElement('div');
                      fallback.className = "absolute bottom-10 left-1/2 transform -translate-x-1/2 text-7xl";
                      fallback.textContent = config.icon;
                      parent.appendChild(fallback);
                    }
                  }}
                />
              ) : (
                <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-7xl">
                  {config.icon}
                </div>
              )}
              
              {/* Wave effect at the bottom */}
              <svg 
                className="absolute bottom-0 left-0 w-full h-8" 
                preserveAspectRatio="none" 
                viewBox="0 0 1440 120" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M0 64L60 58.7C120 53 240 43 360 48C480 53 600 75 720 80C840 85 960 75 1080 64C1200 53 1320 43 1380 37.3L1440 32V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V64Z" 
                  fill={darkMode ? '#1f2937' : 'white'} 
                />
              </svg>
            </div>

            {/* White/Gray Foreground Section */}
            <div className={`relative z-10 w-full flex flex-col items-center px-6 pb-8 text-center ${
              darkMode ? 'bg-gray-900' : 'bg-white'
            }`}>
              
              {/* Title */}
              <motion.h2 
                className={`text-[28px] font-bold mb-2 tracking-tight ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {title || config.defaultTitle}
              </motion.h2>

              {/* Message */}
              <motion.div 
                className="flex flex-col gap-1.5 mb-6 w-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <p className={`text-[16px] font-semibold break-words ${
                  darkMode ? 'text-gray-200' : 'text-gray-800'
                }`}>
                  {primaryMessage}
                </p>
                {secondaryMessage && (
                  <p className={`text-[14px] whitespace-pre-line break-words ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {secondaryMessage}
                  </p>
                )}
              </motion.div>

              {/* Action Buttons */}
              <motion.div 
                className={`w-full flex items-center gap-3 ${isConfirmType ? "flex-row" : "justify-center"}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {isConfirmType && (
                  <motion.button
                    onClick={onClose}
                    className={`flex-1 px-4 py-3 rounded-[14px] font-semibold transition-all duration-200 text-[15px] ${
                      darkMode 
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {cancelText}
                  </motion.button>
                )}
                
                <div className={isConfirmType ? "flex-1" : "w-full"}>
                  <motion.button
                    onClick={handleButtonClick}
                    className={`w-full px-4 py-3 rounded-[14px] font-semibold text-white shadow-lg transition-all duration-200 text-[15px] ${
                      type === "error" ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700' :
                      type === "warning" ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700' :
                      'hover:opacity-90'
                    }`}
                    style={type !== "error" && type !== "warning" ? getButtonStyle() : {}}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {buttonText || config.btnText}
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StatusModal;