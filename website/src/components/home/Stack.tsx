const STACK = [
  { name: 'FastAPI', role: 'Webhooks & REST API' },
  { name: 'Celery + Redis', role: 'Background job queue' },
  { name: 'PostgreSQL', role: 'Reviews, findings & runs' },
  { name: 'Daytona', role: 'Isolated code sandboxes' },
  { name: 'LiteLLM', role: '100+ LLM providers' },
  { name: 'React 19', role: 'Dashboard & analytics' },
] as const;

export function Stack() {
  return (
    <section className="border-b-4 border-black px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-display mb-4 text-center text-4xl font-black uppercase md:text-5xl">
          Boring tech, on purpose
        </h2>
        <p className="mx-auto mb-14 max-w-2xl text-center text-lg font-semibold text-black/70">
          Metis is built from well-known open-source parts you already know how to operate.
        </p>
        <ul className="grid grid-cols-2 gap-5 md:grid-cols-3">
          {STACK.map((item, index) => (
            <li
              key={item.name}
              className={`border-4 border-black p-5 shadow-[5px_5px_0px_0px_#000] ${
                index % 2 === 0 ? 'bg-white' : 'bg-[var(--metis-pastel-2)]'
              }`}
            >
              <p className="font-display text-xl font-black md:text-2xl">{item.name}</p>
              <p className="mt-1 text-sm font-semibold text-black/70">{item.role}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
