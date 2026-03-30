import { motion, AnimatePresence } from "framer-motion";
import Reusable_Button from "../button/Reusable_Button";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
};

const modalVariants = {
  hidden: { y: "-100vh", opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 120, damping: 15 },
  },
  exit: { y: "100vh", opacity: 0, transition: { duration: 0.3 } },
};

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  title,
  onConfirm,
  onCancel,
  loading = false,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <motion.div
            className="bg-white rounded-xl w-full max-w-sm p-6 space-y-4 text-center"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <p className="text-lg font-semibold">{title || "Are you sure?"}</p>
            <div className="flex justify-center space-x-4">
              <Reusable_Button
                text="Delete"
                variant="danger"
                onClick={onConfirm}
                isLoading={loading}
                size="px-4 py-2"
              />

              <Reusable_Button
                text="Cancel"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
                size="px-4 py-2"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDeleteModal;
