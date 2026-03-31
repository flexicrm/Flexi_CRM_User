import { motion } from "framer-motion";
import Reusable_Button from "../button/Reusable_Button";
import { Plus } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  buttonText: string;
  onButtonClick: () => void;
  image: string;
}

const EmptyState = ({
  title,
  description,
  buttonText,
  onButtonClick,
  image,
}: EmptyStateProps) => {
  return (
    <div className="h-full flex items-center justify-center px-4">
      <div className="w-full h-full flex flex-col md:flex-row items-center justify-between bg-white rounded-2xl p-8 md:p-12 shadow-sm">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full md:w-1/2 flex justify-center mb-6 md:mb-0"
        >
          <img
            src={image}
            alt="empty-state"
            className="max-w-sm w-full object-contain"
          />
        </motion.div>
        <div className="w-full md:w-1/2 text-center md:text-left">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-2xl md:text-3xl font-semibold text-blue-900 mb-4"
          >
            {title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-gray-600 mb-6 leading-relaxed"
          >
            {description}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.6 }}
          >
            <Reusable_Button
              text={buttonText}
              onClick={onButtonClick}
              icon={<Plus size={16} />}
              iconPosition="left"
              size="px-6 py-3"
              variant="primary"
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default EmptyState;
