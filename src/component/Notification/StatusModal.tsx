import { motion, AnimatePresence } from "framer-motion";
import Reusable_Button from "../button/Reusable_Button";
import type { Variants } from "framer-motion";
import React from "react";

interface StatusModalProps {
  isOpen: boolean;
  type?: "success" | "error" | "warning";
  title?: string;
  message?: string;
  buttonText?: string;
  onClose: () => void;
}

type StatusConfig = {
  img: string;
  color: string;
  defaultTitle: string;
  defaultMsg: string;
  btn: string;
};

const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: 40,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 18,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: 40,
    transition: { duration: 0.25 },
  },
};

const getConfig = (type: string): StatusConfig => {
  switch (type) {
    case "success":
      return {
        img: "/success.jpg",
        color: "text-green-500",
        defaultTitle: "Awesome!",
        defaultMsg: "Action completed successfully.",
        btn: "Done",
      };
    case "error":
      return {
        img: "/error2.jpg",
        color: "text-pink-500",
        defaultTitle: "Oops...",
        defaultMsg: "Something went wrong. Please try again!",
        btn: "Try Again",
      };
    case "warning":
      return {
        img: "/warning.png",
        color: "text-yellow-500",
        defaultTitle: "Warning!",
        defaultMsg: "Please check your input.",
        btn: "Okay",
      };
    default:
      return {
        img: "",
        color: "text-gray-500",
        defaultTitle: "",
        defaultMsg: "",
        btn: "Okay",
      };
  }
};

const StatusModal: React.FC<StatusModalProps> = ({
  isOpen,
  type = "success",
  title,
  message,
  buttonText,
  onClose,
}) => {
  const config = getConfig(type);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-xl w-full max-w-sm p-6 text-center space-y-2"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            {config.img && (
              <motion.img
                src={config.img}
                alt="status"
                className="w-60 mx-auto"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              />
            )}
            <h2 className={`text-2xl font-bold ${config.color}`}>
              {title ?? config.defaultTitle}
            </h2>
            <p className=" text-sm font-medium">
              {message ?? config.defaultMsg}
            </p>
            <Reusable_Button
              text={buttonText ?? config.btn}
              onClick={onClose}
              variant="primary"
              size="px-5 py-2"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StatusModal;
