import React, { useState } from "react";

export function Dropdown({ options = [], placeholder = "Select", className = "", onChange }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  return (
    <div className={`relative ${className}`}>
      <div
        className="px-4 py-2 border rounded-xl bg-white cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        {value || placeholder}
      </div>

      {open && (
        <ul className="absolute z-20 mt-1 w-full bg-white shadow-md rounded-xl border border-slate-200">
          {options.map((opt, index) => (
            <li
              key={index}
              className="px-4 py-2 hover:bg-slate-100 cursor-pointer text-sm"
              onClick={() => {
                setValue(opt);
                setOpen(false);
                onChange && onChange(opt);
              }}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
