import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'teal' | 'white-outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-lg transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.99]';

  const sizeStyles = {
    sm: 'text-xs px-3 py-2 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3 gap-2.5',
  };

  const variantStyles = {
    primary: 'bg-ink hover:bg-deep-2 text-white focus-visible:ring-ink',
    teal: 'bg-brand-600 hover:bg-brand-700 text-white focus-visible:ring-brand-600',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-ink focus-visible:ring-slate-400',
    outline:
      'border border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400 text-ink focus-visible:ring-slate-400',
    'white-outline':
      'border border-white/30 hover:border-white/60 bg-white/10 hover:bg-white/20 text-white focus-visible:ring-white/40',
    ghost: 'text-slate-600 hover:text-ink hover:bg-slate-100 focus-visible:ring-slate-300',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white focus-visible:ring-rose-500',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
};
