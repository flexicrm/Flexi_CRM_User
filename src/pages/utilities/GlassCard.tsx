import React from "react";
import { useSelector } from "react-redux";

interface Props {
  children: React.ReactNode;
  gradient?: string;
}

export const GlassCard: React.FC<Props> = ({ children, gradient }) => {
  const { primaryColor, darkMode } = useSelector((state: any) => state.theme);
  
  const getDefaultGradient = () => {
    if (darkMode) {
      return `linear-gradient(135deg, #1f2937 0%, #111827 25%, #0f172a 50%, #1f2937 100%)`;
    }
    return `linear-gradient(135deg, #0f0f23 0%, #16213e 25%, #1a1a2e 50%, #0f0f23 100%)`;
  };
  
  const getRadialGradients = () => {
    if (darkMode) {
      return `
        radial-gradient(circle at 20% 30%, ${primaryColor}30 0%, transparent 50%),
        radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
        radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.08) 0%, transparent 70%)
      `;
    }
    return `
      radial-gradient(circle at 20% 30%, ${primaryColor}30 0%, transparent 50%),
      radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.2) 0%, transparent 50%),
      radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.1) 0%, transparent 70%)
    `;
  };

  return (
    <div
      className="
        relative overflow-hidden rounded-[20px] p-6
        backdrop-blur-xl border border-white/10
      "
      style={{
        background: gradient || getDefaultGradient(),
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: getRadialGradients(),
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
};