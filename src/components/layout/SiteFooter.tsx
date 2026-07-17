import Link from "next/link";
import { Code, GitBranch, Globe } from "lucide-react";
import { PRIMARY_NAV, SITE } from "@/lib/site";

/**
 * Footer present on every public route. Carries the exact creator sentence
 * and links required by STANDARDS §3.
 */
export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
          {PRIMARY_NAV.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-text-muted hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

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
