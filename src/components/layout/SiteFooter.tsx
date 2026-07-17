import Link from "next/link";
import { Code, GitBranch, Globe } from "lucide-react";
import { FOOTER_SECTIONS, SITE } from "@/lib/site";
import { Waveform } from "@/components/ui/Waveform";

/**
 * Footer present on every public route. Carries the exact creator sentence and
 * links required by STANDARDS §3, plus grouped navigation to every public route
 * for discoverability and internal linking (STANDARDS §5).
 */
export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-md text-lg font-bold"
              aria-label={`${SITE.name} home`}
            >
              <Waveform bars={3} className="h-5" />
              <span>{SITE.name}</span>
            </Link>
            <p className="mt-3 text-sm text-text-muted">{SITE.tagline}</p>
          </div>

          {FOOTER_SECTIONS.map((section) => (
            <nav key={section.heading} aria-label={section.heading}>
              <h2 className="text-xs font-bold uppercase tracking-wide text-text-muted">
                {section.heading}
              </h2>
              <ul className="mt-3 flex flex-col gap-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-text hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-text-muted">{SITE.footerSentence}</p>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <a
              href={SITE.creator.github}
              className="inline-flex items-center gap-1.5 text-text hover:text-primary"
              rel="noopener noreferrer"
              target="_blank"
            >
              <GitBranch className="size-4" aria-hidden="true" />
              GitHub
            </a>
            <a
              href={SITE.creator.portfolio}
              className="inline-flex items-center gap-1.5 text-text hover:text-primary"
              rel="noopener noreferrer"
              target="_blank"
            >
              <Globe className="size-4" aria-hidden="true" />
              Portfolio
            </a>
            <a
              href={SITE.repo}
              className="inline-flex items-center gap-1.5 text-text hover:text-primary"
              rel="noopener noreferrer"
              target="_blank"
            >
              <Code className="size-4" aria-hidden="true" />
              Repository
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
