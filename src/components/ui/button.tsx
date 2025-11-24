import React from "react";

export function Button({ children, className = "", ...props }) {
  return (
    <button
      className={`
        px-4 py-2 rounded-xl font-medium 
        bg-indigo-600 text-white 
        hover:bg-indigo-700 
        transition 
        disabled:opacity-50
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
