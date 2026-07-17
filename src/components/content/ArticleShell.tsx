import Link from "next/link";
import { ArrowRight, CalendarDays, Clock } from "lucide-react";
import { SITE } from "@/lib/site";
import type { ContentEntry } from "@/lib/content";
import { Button } from "@/components/ui/Button";
import { AdSlot } from "./AdSlot";
import { Breadcrumbs } from "./Breadcrumbs";
import { GuideTracker } from "./GuideTracker";
import { JsonLd } from "./JsonLd";

interface RelatedLink {
  href: string;
  title: string;
  excerpt: string;
}

interface ArticleShellProps {
  kind: "guide" | "use-case";
  entry: ContentEntry;
  /** Prose body — rendered inside a `.vk-prose` article. */
  children: React.ReactNode;
  /** Optional "read next" links for internal linking (STANDARDS §5). */
  related?: RelatedLink[];
}

const SECTION = {
  guide: { href: "/guides", label: "Guides" },
  "use-case": { href: "/use-cases", label: "Use cases" },
} as const;

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Shared layout for a single guide or use-case article: breadcrumb trail,
 * Article + BreadcrumbList JSON-LD, a title/meta header, the prose body, a
 * workspace call to action, and optional related links. Also fires the
 * consent-gated `guide_opened` event via {@link GuideTracker}.
 */
export function ArticleShell({
  kind,
  entry,
  children,
  related = [],
}: ArticleShellProps) {
  const section = SECTION[kind];
  const path = `${section.href}/${entry.slug}`;
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: entry.title,
    description: entry.description,
    datePublished: entry.date,
    dateModified: entry.date,
    url: `${SITE.url}${path}`,
    mainEntityOfPage: `${SITE.url}${path}`,
    inLanguage: "en",
    author: {
      "@type": "Person",
      name: SITE.creator.name,
      url: SITE.creator.portfolio,
    },
    publisher: {
      "@type": "Person",
      name: SITE.creator.name,
      url: SITE.creator.portfolio,
    },
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <JsonLd data={articleJsonLd} />
      <GuideTracker slug={`${kind}/${entry.slug}`} />
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: section.label, href: section.href },
          { name: entry.title, href: path },
        ]}
      />

      <header>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {entry.title}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-muted">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-4" aria-hidden="true" />
            {formatDate(entry.date)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-4" aria-hidden="true" />
            {entry.minutes} min read
          </span>
        </div>
      </header>

      <article className="vk-prose mt-8">{children}</article>

      {/* Reserved ad slot — renders nothing while ads are disabled (default). */}
      <AdSlot placement="guide-inline" />

      <aside className="mt-12 rounded-xl border border-border bg-surface-sunken p-6">
        <h2 className="text-xl font-bold">Try it with your own text</h2>
        <p className="mt-1 text-text-muted">
          Everything above works in your browser, free and without an account.
        </p>
        <div className="mt-4">
          <Link href="/tool">
            <Button>
              Open the workspace
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
          </Link>
        </div>
      </aside>

      {related.length > 0 ? (
        <section aria-labelledby="read-next" className="mt-12">
          <h2 id="read-next" className="text-xl font-bold">
            Read next
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {related.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block h-full rounded-lg border border-border bg-surface p-4 transition-colors hover:border-primary"
                >
                  <span className="font-bold text-text">{item.title}</span>
                  <span className="mt-1 block text-sm text-text-muted">
                    {item.excerpt}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="mt-10 text-sm">
        <Link href={section.href} className="text-primary hover:underline">
          ← All {section.label.toLowerCase()}
        </Link>
      </p>
    </div>
  );
}
