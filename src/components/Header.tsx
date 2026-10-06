import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="w-full bg-white border-b border-slate-200/80 px-4 sm:px-6 py-2.5 flex items-center shadow-2xs select-none">
      <img
        src="/logo-wateh.png"
        alt="واته"
        className="h-10 sm:h-12 w-auto object-contain cursor-default"
      />
    </header>
  );
};
