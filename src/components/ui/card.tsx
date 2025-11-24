import * as React from "react";

export function Card({ className = "", children }) {
  return (
    <div className={`rounded-2xl bg-white shadow-sm border border-slate-200 ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ className = "", children }) {
  return <div className={`px-4 pt-4 ${className}`}>{children}</div>;
}

export function CardTitle({ className = "", children }) {
  return <h3 className={`text-lg font-semibold text-slate-800 ${className}`}>{children}</h3>;
}

export function CardContent({ className = "", children }) {
  return <div className={`px-4 pb-4 ${className}`}>{children}</div>;
}
