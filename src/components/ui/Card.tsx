import React, { ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface CardProps extends HTMLMotionProps<'div'> {
  title: string;
  children: ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'indigo';
  action?: ReactNode;
  description?: string;
  icon?: ReactNode;
  className?: string;
}

const colorStyles = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-900/30',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800',
    header: 'bg-gradient-to-r from-blue-50 to-blue-50/50 dark:from-blue-900/50 dark:to-blue-900/30',
    title: 'text-blue-700 dark:text-blue-300',
    accent: 'bg-blue-600 dark:bg-blue-500',
    hover: 'hover:bg-blue-700 dark:hover:bg-blue-600',
    ring: 'ring-blue-500 dark:ring-blue-400',
    chip: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300',
    icon: 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400',
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-900/30',
    text: 'text-green-700 dark:text-green-400',
    border: 'border-green-200 dark:border-green-800',
    header: 'bg-gradient-to-r from-green-50 to-green-50/50 dark:from-green-900/50 dark:to-green-900/30',
    title: 'text-green-700 dark:text-green-300',
    accent: 'bg-green-600 dark:bg-green-500',
    hover: 'hover:bg-green-700 dark:hover:bg-green-600',
    ring: 'ring-green-500 dark:ring-green-400',
    chip: 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300',
    icon: 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-900/30',
    text: 'text-purple-700 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-800',
    header: 'bg-gradient-to-r from-purple-50 to-purple-50/50 dark:from-purple-900/50 dark:to-purple-900/30',
    title: 'text-purple-700 dark:text-purple-300',
    accent: 'bg-purple-600 dark:bg-purple-500',
    hover: 'hover:bg-purple-700 dark:hover:bg-purple-600',
    ring: 'ring-purple-500 dark:ring-purple-400',
    chip: 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300',
    icon: 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400',
  },
  orange: {
    bg: 'bg-orange-50 dark:bg-orange-900/30',
    text: 'text-orange-700 dark:text-orange-400',
    border: 'border-orange-200 dark:border-orange-800',
    header: 'bg-gradient-to-r from-orange-50 to-orange-50/50 dark:from-orange-900/50 dark:to-orange-900/30',
    title: 'text-orange-700 dark:text-orange-300',
    accent: 'bg-orange-600 dark:bg-orange-500',
    hover: 'hover:bg-orange-700 dark:hover:bg-orange-600',
    ring: 'ring-orange-500 dark:ring-orange-400',
    chip: 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300',
    icon: 'bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400',
  },
  indigo: {
    bg: 'bg-indigo-50 dark:bg-indigo-900/30',
    text: 'text-indigo-700 dark:text-indigo-400',
    border: 'border-indigo-200 dark:border-indigo-800',
    header: 'bg-gradient-to-r from-indigo-50 to-indigo-50/50 dark:from-indigo-900/50 dark:to-indigo-900/30',
    title: 'text-indigo-700 dark:text-indigo-300',
    accent: 'bg-indigo-600 dark:bg-indigo-500',
    hover: 'hover:bg-indigo-700 dark:hover:bg-indigo-600',
    ring: 'ring-indigo-500 dark:ring-indigo-400',
    chip: 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300',
    icon: 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400',
  },
};

const Card = ({ title, children, color = 'blue', action, description, icon, className = '', ...props }: CardProps) => {
  const style = colorStyles[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden ring-1 ${style.ring} ${className}`}
      {...props}
    >
      <div className={`${style.header} px-6 py-4 border-b ${style.border}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon && (
              <div className={`p-2 rounded-lg ${style.icon}`}>
                {icon}
              </div>
            )}
            <div>
              <h3 className={`text-lg font-semibold ${style.title}`}>{title}</h3>
              {description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
              )}
            </div>
          </div>
          {action && <div>{action}</div>}
        </div>
      </div>
      <div className="p-6">{children}</div>
    </motion.div>
  );
};

interface ChipProps {
  children: React.ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'orange';
  onClick?: () => void;
  className?: string;
}

export function Chip({ children, color = 'blue', onClick, className = '' }: ChipProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses[color]} ${className}`}
      onClick={onClick}
    >
      {children}
    </span>
  );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  color?: 'blue' | 'green' | 'purple' | 'orange';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'outline' | 'ghost';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export function Button({
  children,
  color = 'blue',
  size = 'md',
  variant = 'solid',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const style = colorStyles[color];
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };
  const variantStyles = {
    solid: `${style.accent} ${style.hover} text-white`,
    outline: `bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 ${style.ring}`,
    ghost: `bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700`,
  };

  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 rounded-lg font-medium
        transition-colors duration-200 ease-in-out
        disabled:opacity-50 disabled:cursor-not-allowed
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {!isLoading && leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
    </button>
  );
}

export default Card; 
