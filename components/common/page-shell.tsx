import type { ReactNode } from "react";

export function PageShell({
  children,
  title,
  eyebrow,
  description,
  actions
}: {
  children: ReactNode;
  title: string;
  eyebrow: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 md:gap-8 md:px-10 md:py-10">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-[0.24em] text-clay">{eyebrow}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">{title}</h1>
          <p className="mt-3 text-sm leading-7 text-ink/70 md:text-base">{description}</p>
        </div>
        {actions ? <div className="flex flex-wrap gap-3 text-sm">{actions}</div> : null}
      </header>
      {children}
    </main>
  );
}
