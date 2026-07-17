import Link from "next/link";
import { Clock } from "lucide-react";
import type { ContentEntry } from "@/lib/content";

interface ContentGridProps {
  /** Base route the entries live under, e.g. "/guides". */
  base: string;
  entries: ContentEntry[];
}

/** Card grid used by the guides and use-cases index pages. */
export function ContentGrid({ base, entries }: ContentGridProps) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {entries.map((entry) => (
        <li key={entry.slug}>
          <Link
            href={`${base}/${entry.slug}`}
            className="flex h-full flex-col rounded-xl border border-border bg-surface p-5 transition-colors hover:border-primary"
          >
            <h2 className="text-lg font-bold text-text">{entry.title}</h2>
            <p className="mt-2 flex-1 text-text-muted">{entry.excerpt}</p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm text-text-muted">
              <Clock className="size-4" aria-hidden="true" />
              {entry.minutes} min read
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
