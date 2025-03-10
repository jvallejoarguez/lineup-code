import React from 'react';
import { Link } from 'react-router-dom';

const LULogo = ({ size = 'md', linkTo = '/dashboard', className = '' }) => {
  const sizes = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-xl',
    lg: 'w-16 h-16 text-2xl',
    xl: 'w-24 h-24 text-3xl'
  };

  const LogoContent = (
    <div className={`${sizes[size]} bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg flex items-center justify-center ${className}`}>
      <span className="text-white font-bold">LU</span>
    </div>
  );

  return linkTo ? (
    <Link to={linkTo} className="block">
      {LogoContent}
    </Link>
  ) : LogoContent;
};

export default LULogo; 