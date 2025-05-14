import { FaUser } from 'react-icons/fa';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Avatar({
  src,
  alt,
  size = 'md',
  className = '',
}: AvatarProps) {
  const sizeStyles = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSizeStyles = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div
      className={`
        ${sizeStyles[size]}
        rounded-full
        overflow-hidden
        bg-gray-100
        dark:bg-gray-700
        flex
        items-center
        justify-center
        ${className}
      `}
    >
      {src ? (
        <img
          src={src}
          alt={alt || 'Avatar'}
          className="w-full h-full object-cover"
        />
      ) : (
        <FaUser
          className={`
            ${iconSizeStyles[size]}
            text-gray-500
            dark:text-gray-400
          `}
        />
      )}
    </div>
  );
} 