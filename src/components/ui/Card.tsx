import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverEffect = false,
  ...props
}) => {
  return (
    <div
      className={`bg-white rounded-2xl border border-hairline shadow-soft transition-all duration-200 ${
        hoverEffect ? 'card-lift' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
