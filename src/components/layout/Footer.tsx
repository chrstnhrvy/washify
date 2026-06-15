import { Github } from "lucide-react";
import Logo from "../ui/Logo";

const BADGES = ["React", "TypeScript", "Supabase", "n8n", "Tailwind", "Vercel"];

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-bg">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <Logo />
          <p className="mt-2 max-w-sm text-sm text-muted">
            Built as a portfolio project to showcase full-stack and automation
            work. Free to run on free tiers.
          </p>
        </div>
        <div className="flex flex-col items-start gap-4 sm:items-end">
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-[44px] items-center gap-2 text-base font-semibold text-ink transition-colors hover:text-primary-dark"
          >
            <Github size={18} aria-hidden="true" />
            View on GitHub
          </a>
          <ul className="flex flex-wrap gap-2">
            {BADGES.map((b) => (
              <li
                key={b}
                className="rounded-lg bg-surface px-2.5 py-1 text-xs font-semibold text-muted ring-1 ring-slate-200"
              >
                {b}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
