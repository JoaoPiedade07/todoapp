'use client';

export const Button = ({ 
  children, 
  className = '', 
  ...props 
}: any) => {
  return (
    <button 
      className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};