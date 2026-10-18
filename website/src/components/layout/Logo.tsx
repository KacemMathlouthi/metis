import { Link } from 'react-router-dom';

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-3" aria-label="Metis home">
      <span
        aria-hidden="true"
        className="flex h-11 w-11 items-center justify-center border-4 border-black bg-gradient-to-br from-[var(--metis-yellow)] via-[var(--metis-orange-light)] to-[var(--metis-red)] text-2xl font-black text-white shadow-[4px_4px_0px_0px_#000]"
      >
        M
      </span>
      <span className="font-display text-3xl font-black tracking-tighter md:text-4xl">METIS</span>
    </Link>
  );
}
