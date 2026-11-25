import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
}) => {
  const iconDims =
    size === 'sm' ? 'h-6 w-6' : size === 'lg' ? 'h-9 w-9' : 'h-7 w-7';
  const textSize =
    size === 'sm' ? 'text-base' : size === 'lg' ? 'text-xl' : 'text-lg';

  return (
    <span className={`inline-flex items-center gap-2.5 whitespace-nowrap shrink-0 ${className}`}>
      <svg
        viewBox="0 0 36 36"
        className={`${iconDims} shrink-0`}
        fill="none"
        aria-hidden="true"
      >
        <rect width="36" height="36" rx="8" fill="#0B2545" />
        <path
          d="M10 25V13.5C10 10.4624 12.4624 8 15.5 8H22.5C24.433 8 26 9.567 26 11.5C26 13.433 24.433 15 22.5 15H15.5V25H10Z"
          fill="#FFFFFF"
        />
        <path
          d="M18.5 17.5L26 25H20.2L15.5 20.1V17.5H18.5Z"
          fill="#F59E0B"
        />
      </svg>
      <span className={`font-display ${textSize} font-bold tracking-tight`}>
        Redcrest Bank
      </span>
    </span>
  );
};
