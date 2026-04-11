import type {
  DraggableProvided,
  DraggableStateSnapshot,
} from "@hello-pangea/dnd";
import { motion } from "framer-motion";
import { GripVertical } from "lucide-react";
import { useSelector } from "react-redux";

interface FieldItem {
  id: string;
  name: string;
  label: string;
  type: string;
}

interface Props {
  provided: DraggableProvided;
  snapshot: DraggableStateSnapshot;
  field: FieldItem;
  children?: React.ReactNode;
}

export const DraggableItem: React.FC<Props> = ({
  provided,
  snapshot,
  field,
  children,
}) => {
  const { primaryColor, darkMode } = useSelector((state: any) => state.theme);
  
  const getDraggingStyle = () => {
    if (snapshot.isDragging) {
      return {
        background: `linear-gradient(135deg, ${primaryColor}40, ${primaryColor}30)`,
        borderColor: `${primaryColor}80`,
        boxShadow: `0 20px 40px ${primaryColor}30`,
      };
    }
    return {
      background: darkMode 
        ? "linear-gradient(135deg, rgba(31, 41, 55, 0.9), rgba(17, 24, 39, 0.95))"
        : "linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))",
      borderColor: darkMode ? "rgba(75, 85, 99, 0.5)" : "rgba(255, 255, 255, 0.1)",
    };
  };

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      style={provided.draggableProps.style}
      className="relative z-999"
    >
      <motion.div
        whileHover={{ scale: 1.03, y: -2 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
      >
        <div
          className={`
            flex items-center mb-3 p-3 text-sm rounded-2xl
            backdrop-blur-xl border
            select-none relative overflow-hidden
            transition-all duration-200
            ${snapshot.isDragging ? "opacity-95 cursor-grabbing z-9999" : "cursor-grab"}
          `}
          style={getDraggingStyle()}
        >
          <div {...provided.dragHandleProps}>
            <GripVertical 
              className={`mr-3 w-5 h-5 transition ${
                darkMode 
                  ? 'text-gray-500 hover:text-indigo-400' 
                  : 'text-white/70 hover:text-indigo-500'
              } cursor-grab active:cursor-grabbing`} 
            />
          </div>
          <p className={`font-medium tracking-wide ${darkMode ? 'text-gray-200' : 'text-white'}`}>
            {field.label}
          </p>
          <div 
            className="ml-auto px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider"
            style={{ 
              backgroundColor: `${primaryColor}20`,
              color: primaryColor || (darkMode ? '#818CF8' : '#A5B4FC')
            }}
          >
            {field.type}
          </div>

          {children}
        </div>
      </motion.div>
    </div>
  );
};