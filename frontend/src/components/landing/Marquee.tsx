import React from 'react';

export const Marquee: React.FC = () => {
  return (
    <div className="overflow-hidden border-y-4 border-black bg-black py-4 whitespace-nowrap text-[#FCD34D]">
      <div className="animate-marquee inline-block font-mono text-2xl font-bold">
        PR REVIEWS • DOC UPDATES • TITLE GENERATION • BUG FIXES • SECURITY AUDITS • PR REVIEWS •
        DOC UPDATES • TITLE GENERATION • BUG FIXES • SECURITY AUDITS •
      </div>
    </div>
  );
};
