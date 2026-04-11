import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import favIconForFlexi from "../../assets/logo/favIconForFlexi.png";

const RippleLoader = () => {
  const { primaryColor, darkMode } = useSelector((state: any) => state.theme);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        darkMode 
          ? 'bg-gray-900/80 backdrop-blur-sm' 
          : 'bg-gray-500/50 backdrop-blur-sm'
      }`}
    >
      <div className="relative flex items-center justify-center">
        {/* Simple Ripple Ring */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 60,
            height: 60,
            border: `2px solid ${primaryColor || '#3b82f6'}`,
          }}
          animate={{
            scale: [1, 1.5, 2],
            opacity: [0.5, 0.2, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
        
        {/* Second Ripple Ring with Delay */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 60,
            height: 60,
            border: `2px solid ${primaryColor || '#3b82f6'}`,
          }}
          animate={{
            scale: [1, 1.8, 2.5],
            opacity: [0.5, 0.2, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: 0.5,
            ease: "easeOut",
          }}
        />

        {/* Logo - NO FILTERS applied to preserve original colors */}
        <motion.img
          src={favIconForFlexi}
          alt="Loading..."
          className="w-8 h-8 object-contain relative z-10 rounded-full"
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
    </motion.div>
  );
};

export default RippleLoader;