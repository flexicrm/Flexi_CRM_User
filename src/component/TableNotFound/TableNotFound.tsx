import { motion } from "framer-motion";
import { PlusCircle } from "lucide-react";
import { useSelector } from "react-redux";
import Reusable_Button from "../../component/button/Reusable_Button";

interface TableNotFoundProps {
  image: string;
  title: string;
  description: string;
  buttonText?: string;
  buttonIcon?: React.ReactNode;
  onAction?: () => void;
}

const TableNotFound = ({ 
  image, 
  title, 
  description, 
  buttonText = "Create New", 
  buttonIcon = <PlusCircle size={18} />, 
  onAction 
}: TableNotFoundProps) => {
  const { darkMode } = useSelector((state: any) => state.theme);
  
  // Theme-based styles
  const getCardBg = () => darkMode ? 'bg-gray-800' : 'bg-white';
  const getCardBorder = () => darkMode ? 'border-gray-700' : 'border-slate-100';
  const getTitleColor = () => darkMode ? 'text-gray-200' : 'text-[#0d1954]';
  const getDescriptionColor = () => darkMode ? 'text-gray-400' : 'text-slate-500';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`w-full flex items-center justify-center py-16 px-4 rounded-[32px] my-6 ${getCardBg()} ${getCardBorder()}`}
    >
      <div className="flex items-center">
        {/* Animated Image/GIF */}
        <motion.div 
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-64 h-64 md:w-[450px] md:h-[450px] mb-6"
        >
          <img 
            src={image} 
            alt="No Data Found" 
            className="w-full h-full object-contain"
          />
        </motion.div>

        {/* Text Content */}
        <div className="text-center max-w-md mb-8">
          <h2 className={`text-2xl md:text-3xl font-black mb-3 tracking-tight ${getTitleColor()}`}>
            {title}
          </h2>
          <p className={`text-sm leading-relaxed ${getDescriptionColor()}`}>
            {description}
          </p>
          {/* Reusable Button Action */}
          {onAction && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Reusable_Button
                text={buttonText}
                variant="primary"
                icon={buttonIcon}
                onClick={onAction}
                size="px-8 py-3 font-bold text-sm rounded-xl mt-4"
              />
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TableNotFound;