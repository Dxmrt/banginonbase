'use client';
import * as React from 'react';

type ButtonSize = 'sm' | 'md' | 'lg'
type ButtonVariant = 'default' | 'outline' | 'ghost'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string
  size?: ButtonSize
  variant?: ButtonVariant
}

export function Button({ className = '', children, size = 'md', variant = 'default', ...props }: ButtonProps) {
  const sizeClasses = size === 'sm'
    ? 'px-3 py-1 text-sm'
    : size === 'lg'
    ? 'px-6 py-3 text-base'
    : 'px-4 py-2 text-sm'

  const variantClasses =
    variant === 'outline'
      ? 'bg-transparent border border-gray-600 text-white hover:bg-gray-800'
      : variant === 'ghost'
      ? 'bg-transparent text-white hover:bg-gray-800'
      : 'bg-pink-600 text-white hover:bg-pink-700'

  return (
    <button
      className={`rounded-2xl shadow focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
