import React from "react";

export function Input({ className = "", ...props }) {
  return (
    <input
      className={`
        w-full px-4 py-2 rounded-xl border border-slate-300 
        focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
        outline-none transition
        ${className}
      `}
      {...props}
    />
  );
}
