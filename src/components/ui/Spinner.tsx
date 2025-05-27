interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  className?: string;
}

export default function Spinner({
  size = 'md',
  color = 'default',
  className = '',
}: SpinnerProps) {
  const sizeStyles = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const colorStyles = {
    default: 'text-gray-400 dark:text-gray-500',
    primary: 'text-blue-500 dark:text-blue-400',
    success: 'text-green-500 dark:text-green-400',
    warning: 'text-yellow-500 dark:text-yellow-400',
    error: 'text-red-500 dark:text-red-400',
  };

  return (
    <div
      className={`
        ${sizeStyles[size]}
        ${colorStyles[color]}
        ${className}
        animate-spin
      `}
      style={{ fontSize: 'var(--font-size-base)', color: 'var(--section-color)' }}
    >
      <svg
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
} 