import React from "react";

interface Props {
  children: React.ReactNode;
  gradient?: string;
}

export const GlassCard: React.FC<Props> = ({ children, gradient }) => {
  return (
    <div
      className="
        relative overflow-hidden rounded-[20px] p-6
        backdrop-blur-xl border border-white/10
      "
      style={{
        background:
          gradient ||
          "linear-gradient(135deg, #0f0f23 0%, #16213e 25%, #1a1a2e 50%, #0f0f23 100%)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: `
            radial-gradient(circle at 20% 30%, rgba(99, 102, 241, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.2) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.1) 0%, transparent 70%)
          `,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
};
