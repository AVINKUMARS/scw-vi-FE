import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2'

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg',
  }

  const variantStyles = {
    primary: 'bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 text-white shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed focus:ring-purple-500',
    secondary: 'bg-gradient-to-r from-purple-50 to-blue-50 text-purple-700 border-2 border-purple-200 hover:border-purple-300 hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed focus:ring-purple-500',
    outline: 'border-2 border-purple-300 text-purple-700 hover:bg-purple-50 disabled:opacity-60 disabled:cursor-not-allowed focus:ring-purple-500',
  }

  return (
    <button
      disabled={loading || disabled}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  )
}
