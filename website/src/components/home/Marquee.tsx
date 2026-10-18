const CONTENT =
  '• PR REVIEWS • INLINE FINDINGS • PR SUMMARIES • ISSUE → PR • SECURITY AUDITS • ANY LLM ';
const REPEATED_CONTENT = CONTENT.repeat(4);

export function Marquee() {
  return (
    <div
      aria-hidden="true"
      className="flex overflow-hidden border-b-4 border-black bg-black py-4 whitespace-nowrap text-[var(--metis-orange-light)]"
    >
      <div className="animate-marquee inline-block text-2xl font-bold tracking-wide">
        {REPEATED_CONTENT}
      </div>
      <div className="animate-marquee inline-block text-2xl font-bold tracking-wide">
        {REPEATED_CONTENT}
      </div>
    </div>
  );
}
