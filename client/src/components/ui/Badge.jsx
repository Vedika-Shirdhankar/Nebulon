import React from "react";
import { motion } from "framer-motion";

const Badge = ({ text, type = "default", showPulse = false }) => {
  const styles = {
    default: "bg-gray-800/50 border-gray-700 text-gray-300",
    success: "bg-green-500/10 border-green-500/50 text-green-400",
    warning: "bg-yellow-500/10 border-yellow-500/50 text-yellow-400",
    danger: "bg-red-500/10 border-red-500/50 text-red-400",
    info: "bg-blue-500/10 border-blue-500/50 text-blue-400",
  };

  // Pulse colors mapping
  const pulseColors = {
    default: "bg-gray-400",
    success: "bg-green-400",
    warning: "bg-yellow-400",
    danger: "bg-red-400",
    info: "bg-blue-400",
  };

  return (
    <div className={`
      inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border 
      backdrop-blur-md transition-all duration-300
      ${styles[type]}
    `}>
      {/* Animated Pulse Dot */}
      {(showPulse || type === "success" || type === "danger") && (
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${pulseColors[type]}`}></span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${pulseColors[type]}`}></span>
        </span>
      )}
      
      <span className="uppercase tracking-wider">{text}</span>
    </div>
  );
};

export default Badge;