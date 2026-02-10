import React from 'react';

export const Marquee: React.FC = () => {
  const content = '• PR REVIEWS • DOC UPDATES • TITLE GENERATION • BUG FIXES • SECURITY AUDITS ';
  const repeatedContent = content.repeat(4);

  return (
    <div className="flex overflow-hidden border-y-4 border-black bg-black py-4 whitespace-nowrap text-[var(--metis-orange-light)]">
      <div className="animate-marquee inline-block text-2xl font-bold tracking-wide">
        {repeatedContent}
      </div>
      <div className="animate-marquee inline-block text-2xl font-bold tracking-wide">
        {repeatedContent}
      </div>
    </div>
  );
};
