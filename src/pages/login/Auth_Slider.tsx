import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

import Group from "../../assets/Group.png";
import slider1 from "../../assets/slider1.png";
import slider2 from "../../assets/slider2.png";

const slides = [
    { 
        id: 1,
        img: Group, 
        title: 'Crafted for Performance and Flexibility',
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

// Variants for the "Side Swiper" effect
const slideVariants = {
    enter: (direction) => ({
        x: direction > 0 ? 300 : -300,
        opacity: 0,
        scale: 0.9
    }),
    center: {
        zIndex: 1,
        x: 0,
        opacity: 1,
        scale: 1
    },
    exit: (direction) => ({
        zIndex: 0,
        x: direction < 0 ? 300 : -300,
        opacity: 0,
        scale: 0.9
    })
};

export default function Auth_Slider() {
    const [[page, direction], setPage] = useState([0, 0]);

    const imageIndex = Math.abs(page % slides.length);

    const paginate = (newDirection) => {
        setPage([page + newDirection, newDirection]);
    };

    // Autoplay
    useEffect(() => {
        const timer = setInterval(() => paginate(1), 5000);
        return () => clearInterval(timer);
    }, [page]);

    return (
        <div className="slider-wrapper">
            {/* The circular glow background */}
            <div className="bg-glow"></div>

            <div className="slider-content">
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={page}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.4 }
                        }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={1}
                        onDragEnd={(e, { offset, velocity }) => {
                            const swipe = Math.abs(offset.x) > 50;
                            if (swipe) {
                                paginate(offset.x > 0 ? -1 : 1);
                            }
                        }}
                        className="slide-inner"
                    >
                        {/* Mockup Image - Scaled down for "smaller" look */}
                        <div className="image-container">
                            <img src={slides[imageIndex].img} alt="Dashboard" className="mockup-img" />
                        </div>

                        {/* Text Content */}
                        <div className="text-container">
                            <h2 className="title">{slides[imageIndex].title}</h2>
                            <p className="description">{slides[imageIndex].description}</p>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Exact Pagination Dots */}
                <div className="dots-container">
                    {slides.map((_, i) => (
                        <div
                            key={i}
                            className={`dot ${imageIndex === i ? 'active' : ''}`}
                            onClick={() => {
                                const dir = i > imageIndex ? 1 : -1;
                                setPage([i, dir]);
                            }}
                        />
                    ))}
                </div>
            </div>

            <style>{`
                .slider-wrapper {
                    width: 100%;
                    max-width: 440px; /* Smaller container width */
                    height: 550px;
                    margin: 0 auto;
                    position: relative;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    overflow: hidden;
                    cursor: grab;
                }
                
                .slider-wrapper:active { cursor: grabbing; }

                .bg-glow {
                    position: absolute;
                    top: 20%;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 400px;
                    height: 400px;
                    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 70%);
                    z-index: 0;
                    pointer-events: none;
                }

                .slider-content {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                }

                .slide-inner {
                    position: absolute;
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                }

                .image-container {
                    margin-bottom: 50px;
                    display: flex;
                    justify-content: center;
                }

                .mockup-img {
                    width: 80%; /* Smaller image scale */
                    max-width: 320px;
                    height: auto;
                    filter: drop-shadow(0 20px 40px rgba(0,0,0,0.3));
                    user-select: none;
                    pointer-events: none;
                }

                .text-container {
                    color: white;
                    padding: 0 30px;
                    margin-top: 10px;
                }

                .title {
                    font-size: 28px; /* Slightly smaller title */
                    font-weight: 700;
                    margin-bottom: 12px;
                    line-height: 1.3;
                }

                .description {
                    font-size: 15px;
                    opacity: 0.8;
                    font-weight: 400;
                    line-height: 1.5;
                    max-width: 320px;
                    margin: 0 auto;
                }

                .dots-container {
                    position: absolute;
                    bottom: 20px;
                    display: flex;
                    gap: 10px;
                    z-index: 10;
                }

                .dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    border: 1.5px solid white;
                    background: transparent;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .dot.active {
                    background: white;
                }

                @media (max-width: 480px) {
                    .title { font-size: 22px; }
                    .mockup-img { width: 70%; }
                }
            `}</style>
        </div>
    );
}