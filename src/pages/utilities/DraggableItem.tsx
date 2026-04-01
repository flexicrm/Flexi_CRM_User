import { motion } from "framer-motion";
import { GripVertical } from "lucide-react";
import type {
  DraggableProvided,
  DraggableStateSnapshot,
} from "@hello-pangea/dnd";

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
            select-none relative overflow-hidden text-white
            transition-all duration-200
            ${
              snapshot.isDragging
                ? "bg-linear-to-br from-indigo-500/30 to-purple-500/30 border-indigo-500/50 shadow-[0_20px_40px_rgba(99,102,241,0.3)] opacity-95 cursor-grabbing z-9999"
                : "bg-linear-to-br from-white/10 to-white/5 border-white/10 shadow-md cursor-grab"
            }
          `}
        >
          <div {...provided.dragHandleProps}>
            <GripVertical className="mr-3 w-5 h-5 text-white/70 hover:text-indigo-500 cursor-grab active:cursor-grabbing transition" />
          </div>
          <p className="font-medium tracking-wide">{field.label}</p>
          <div className="ml-auto px-3 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
            {field.type}
          </div>

          {children}
        </div>
      </motion.div>
    </div>
  );
};
