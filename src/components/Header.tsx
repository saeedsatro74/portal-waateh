import React from 'react';

const WAATEH_REMOTE_LOGO =
  'https://wobpwhryytitzymcgdaf.supabase.co/storage/v1/object/sign/portal%20waateh/logo%20wateh.png?token=eyJraWQiOiJhNmNmZDA2YS1hYWJkLTQ0YjMtYmVkMy1lOThkYTk5MjE5MDgiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJwb3J0YWwgd2FhdGVoL2xvZ28gd2F0ZWgucG5nIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc5MTI3MjYxMSwiZXhwIjoxODIyODA4NjExfQ.Yrny1CpFK7LIiWTylEkReiaYyBE3hmcyaEhtxyJjk3CvZeJvTrN37WFGOhfWXj2ua_Q9OjXud6rctxiU_2twaw';

export const Header: React.FC = () => {
  return (
    <header className="w-full bg-white border-b border-slate-200/80 px-4 sm:px-6 py-2.5 flex items-center shadow-2xs select-none">
      <img
        src="/logo-wateh.png"
        onError={(e) => {
          (e.target as HTMLImageElement).src = WAATEH_REMOTE_LOGO;
        }}
        alt="واته"
        className="h-10 sm:h-12 w-auto object-contain cursor-default"
      />
    </header>
  );
};
