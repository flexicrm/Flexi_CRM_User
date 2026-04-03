import { AnimatePresence, motion, type PanInfo } from 'framer-motion';
import { useEffect, useState } from 'react';
import Group from "../../assets/Group.png";
import slider1 from "../../assets/slider1.png";
import slider2 from "../../assets/slider2.png";

const slides = [
  {
    id: 1,
    img: Group,
    title: 'Crafted for Performance',
    description: 'Everything you need in an easily customizable dashboard.'
  },
  {
    id: 2,
    img: slider1,
    title: 'Real-time Data Insights',
    description: 'Monitor your business metrics with precision and speed.'
  },
  {
    id: 3,
    img: slider2,
    title: 'Modular Design System',
    description: 'Build your own workspace using our flexible component library.'
  }
];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 200 : -200,
    opacity: 0,
    scale: 0.95
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 200 : -200,
    opacity: 0,
    scale: 0.95
  })
};

export default function Auth_Slider() {
  const [[page, direction], setPage] = useState([0, 0]);
  const imageIndex = Math.abs(page % slides.length);

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };

  useEffect(() => {
    const timer = setInterval(() => paginate(1), 6000);
    return () => clearInterval(timer);
  }, [page]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 50) {
      paginate(info.offset.x > 0 ? -1 : 1);
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Background Glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[400px] h-[400px] rounded-full bg-white/5 blur-3xl animate-pulse" />
      </div>

      <div className="relative w-full max-w-md mx-auto px-6">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={page}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.3 }
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.5}
            onDragEnd={handleDragEnd}
            className="text-center"
          >
            {/* Image */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <img
                src={slides[imageIndex].img}
                alt="Dashboard preview"
                className="w-64 h-auto mx-auto drop-shadow-2xl"
              />
            </motion.div>

            {/* Text Content */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight">
                {slides[imageIndex].title}
              </h2>
              <p className="text-white/70 text-sm md:text-base leading-relaxed">
                {slides[imageIndex].description}
              </p>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Pagination Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                const dir = i > imageIndex ? 1 : -1;
                setPage([i, dir]);
              }}
              className={`transition-all duration-300 rounded-full ${
                imageIndex === i
                  ? "w-8 h-2 bg-white"
                  : "w-2 h-2 bg-white/40 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}