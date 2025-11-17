import type { InputHTMLAttributes } from 'react'

export default function FormInput(props: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, className, ...rest } = props as any
  return (
    <label className="grid gap-1.5">
      <span className="text-xs opacity-75">{label}</span>
      <input
        {...rest}
        className={`px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 ${className ?? ''}`}
      />
    </label>
  )
}
