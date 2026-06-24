"use client";

export default function AuroraBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
      {/* Blob 1 */}
      <div className="aurora aurora-1" />

      {/* Blob 2 */}
      <div className="aurora aurora-2" />

      {/* Blob 3 */}
      <div className="aurora aurora-3" />
    </div>
  );
}