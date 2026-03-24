import React from "react";

const Timeline = ({ steps }) => {
  return (
    <div className="flex gap-6 justify-center">
      {steps.map((step, index) => (
        <div key={index} className="text-center">
          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r from-green-400 to-blue-500 text-black font-bold">
            {index + 1}
          </div>
          <p className="text-sm mt-2">{step}</p>
        </div>
      ))}
    </div>
  );
};

export default Timeline;