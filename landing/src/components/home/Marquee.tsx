const CONTENT =
  '• PR REVIEWS • INLINE FINDINGS • PR SUMMARIES • ISSUE → PR • SECURITY AUDITS • ANY LLM ';
const REPEATED_CONTENT = CONTENT.repeat(4);

export function Marquee() {
  return (
    <div
      aria-hidden="true"
      className="border-ink bg-ink text-accent flex overflow-hidden border-y-4 py-4 whitespace-nowrap"
    >
      <div className="animate-marquee font-display inline-block text-2xl">{REPEATED_CONTENT}</div>
      <div className="animate-marquee font-display inline-block text-2xl">{REPEATED_CONTENT}</div>
    </div>
  );
}
