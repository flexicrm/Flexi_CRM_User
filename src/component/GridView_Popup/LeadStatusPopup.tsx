import { AnimatePresence, motion } from 'framer-motion';
import { Frown, Smile, X } from 'lucide-react';
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface LeadStatusPopupProps {
  type: 'won' | 'lost';
  onClose: () => void;
  leadName?: string;
}

const LeadStatusPopup: React.FC<LeadStatusPopupProps> = ({ type, onClose, leadName }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const isWon = type === 'won';
  
  const config = {
    won: {
      icon: Smile,
      title: 'Lead Won!',
      message: leadName ? `${leadName} has been marked as Won` : 'Lead has been successfully won!',
      bgColor: 'bg-white/95',
      iconColor: 'text-green-500',
      borderColor: 'border-green-200',
      progressColor: 'bg-green-500',
      shadowColor: 'shadow-xl'
    },
    lost: {
      icon: Frown,
      title: 'Lead Lost',
      message: leadName ? `${leadName} has been marked as Lost` : 'Lead has been marked as Lost',
      bgColor: 'bg-white/95',
      iconColor: 'text-red-500',
      borderColor: 'border-red-200',
      progressColor: 'bg-red-500',
      shadowColor: 'shadow-xl'
    }
  };

  const currentConfig = config[type];
  const IconComponent = currentConfig.icon;

  return createPortal(
    <AnimatePresence>
      {/* Full screen transparent overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-[10000] flex items-center justify-center"
        style={{ background: 'transparent' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className={`${currentConfig.bgColor} backdrop-blur-md border ${currentConfig.borderColor} rounded-3xl p-10 shadow-2xl ${currentConfig.shadowColor} flex flex-col items-center gap-5 min-w-[380px] max-w-[450px] mx-4 relative`}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-all duration-200"
          >
            <X size={20} className="text-gray-400 hover:text-gray-600 transition-colors" />
          </button>

          {/* Animated Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 260, 
              damping: 20,
              delay: 0.1
            }}
          >
            <div className={`p-4 rounded-full ${
              isWon ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <IconComponent 
                size={100} 
                className={`${currentConfig.iconColor} drop-shadow-lg`}
                strokeWidth={1.5}
              />
            </div>
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className={`text-3xl font-bold ${isWon ? 'text-green-600' : 'text-red-600'} text-center`}
          >
            {currentConfig.title}
          </motion.h2>

          {/* Message */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-600 text-center text-base"
          >
            {currentConfig.message}
          </motion.p>

          {/* Progress bar */}
          <div className="w-full mt-4">
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 2, ease: "linear" }}
              className={`h-1.5 rounded-full ${currentConfig.progressColor}`}
            />
          </div>

          {/* Auto-close text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ delay: 0.4 }}
            className="text-xs text-gray-400 mt-2"
          >
            Closing automatically...
          </motion.p>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default LeadStatusPopup;