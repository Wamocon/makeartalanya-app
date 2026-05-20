"use client";

/**
 * Animated mesh gradient background — inspired by Linear.app & Stripe.
 * Pure CSS keyframe animations. No Three.js, no heavy WebGL canvas.
 * Three soft gradient orbs drift slowly to create depth and warmth.
 */
export default function LoginScene() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Base warm gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#FFF0F3_0%,_#FEFCFD_50%,_#F0F4FF_100%)]" />

      {/* Orb 1 — pink, top-left, drifts right */}
      <div
        className="absolute -top-[20%] -left-[10%] w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] rounded-full opacity-40 blur-[80px]"
        style={{
          background: "radial-gradient(circle, #DCA8B2 0%, transparent 70%)",
          animation: "drift1 20s ease-in-out infinite",
        }}
      />

      {/* Orb 2 — blue, bottom-right, drifts up-left */}
      <div
        className="absolute -bottom-[15%] -right-[10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full opacity-30 blur-[80px]"
        style={{
          background: "radial-gradient(circle, #A9C7E5 0%, transparent 70%)",
          animation: "drift2 25s ease-in-out infinite",
        }}
      />

      {/* Orb 3 — peach accent, center-bottom, subtle pulse */}
      <div
        className="absolute top-[50%] left-[30%] w-[35vw] h-[35vw] max-w-[400px] max-h-[400px] rounded-full opacity-20 blur-[60px]"
        style={{
          background: "radial-gradient(circle, #F5C6AA 0%, transparent 70%)",
          animation: "drift3 18s ease-in-out infinite",
        }}
      />

      {/* Subtle grain texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* CSS Keyframes */}
      <style jsx>{`
        @keyframes drift1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(5vw, 3vh) scale(1.05); }
          66% { transform: translate(-2vw, -2vh) scale(0.97); }
        }
        @keyframes drift2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-4vw, -5vh) scale(1.03); }
          66% { transform: translate(3vw, 2vh) scale(0.98); }
        }
        @keyframes drift3 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.2; }
          50% { transform: translate(2vw, -3vh) scale(1.08); opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
