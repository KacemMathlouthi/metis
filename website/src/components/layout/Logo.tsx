import { Link } from 'react-router-dom';

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="Metis home">
      <span
        aria-hidden="true"
        className="border-ink bg-accent text-ink flex size-8 items-center justify-center border-2 text-lg font-black shadow-[2px_2px_0px_0px_#000]"
      >
        M
      </span>
      <span className="font-display text-2xl font-black tracking-tighter">METIS</span>
    </Link>
  );
}
