"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { PRIMARY_NAV, SECONDARY_NAV, SITE } from "@/lib/site";
import { cn } from "@/lib/cn";
import { Waveform } from "@/components/ui/Waveform";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { GitHubIcon } from "@/components/ui/icons";

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-surface/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-md font-bold text-lg"
          aria-label={`${SITE.name} home`}
        >
          <Waveform bars={3} className="h-5" />
          <span>{SITE.name}</span>
        </Link>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {PRIMARY_NAV.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={isActive(pathname, link.href) ? "page" : undefined}
                  className={cn(
                    "inline-flex min-h-11 items-center rounded-md px-3 font-medium transition-colors",
                    isActive(pathname, link.href)
                      ? "text-primary font-semibold"
                      : "text-text hover:bg-surface-sunken"
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}

            <li className="h-4 w-px bg-border mx-2" aria-hidden="true" />

            {SECONDARY_NAV.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={isActive(pathname, link.href) ? "page" : undefined}
                  className={cn(
                    "inline-flex min-h-11 items-center rounded-md px-3 font-medium transition-colors",
                    isActive(pathname, link.href)
                      ? "text-primary font-semibold"
                      : "text-text hover:bg-surface-sunken"
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <a
            href={SITE.repo}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex size-11 items-center justify-center rounded-md text-text hover:bg-surface-sunken transition-colors"
            aria-label="GitHub Repository"
          >
            <GitHubIcon size={18} className="text-text hover:text-primary transition-colors" />
          </a>
          <button
            type="button"
            className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md text-text hover:bg-surface-sunken md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? (
              <X className="size-5" aria-hidden="true" />
            ) : (
              <Menu className="size-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {open ? (
        <nav
          id="mobile-nav"
          aria-label="Primary"
          className="border-t border-border md:hidden bg-surface"
        >
          <div className="mx-auto flex max-w-6xl flex-col px-4 py-3">
            <div className="font-semibold text-2xs uppercase tracking-[0.06em] text-text-muted px-3 mb-1">
              Reader
            </div>
            <ul className="flex flex-col gap-0.5">
              {PRIMARY_NAV.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={isActive(pathname, link.href) ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex min-h-11 items-center rounded-md px-3 font-medium",
                      isActive(pathname, link.href)
                        ? "text-primary"
                        : "text-text hover:bg-surface-sunken"
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="font-semibold text-2xs uppercase tracking-[0.06em] text-text-muted px-3 mt-3 mb-1">
              Library & Settings
            </div>
            <ul className="flex flex-col gap-0.5">
              {SECONDARY_NAV.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={isActive(pathname, link.href) ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex min-h-11 items-center rounded-md px-3 font-medium",
                      isActive(pathname, link.href)
                        ? "text-primary"
                        : "text-text hover:bg-surface-sunken"
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
