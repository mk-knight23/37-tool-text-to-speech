import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { SITE } from "@/lib/site";
import { JsonLd } from "./JsonLd";

export interface Crumb {
  name: string;
  /** Route path beginning with "/". The last crumb is the current page. */
  href: string;
}

interface BreadcrumbsProps {
  items: Crumb[];
}

/**
 * Visible breadcrumb trail plus a matching `BreadcrumbList` JSON-LD block
 * (STANDARDS §5) for nested pages. The final item renders as the current page
 * (not a link) and is marked with `aria-current`.
 */
export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE.url}${item.href === "/" ? "" : item.href}`,
    })),
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-text-muted">
        <ol className="flex flex-wrap items-center gap-1.5">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={item.href} className="flex items-center gap-1.5">
                {isLast ? (
                  <span aria-current="page" className="text-text">
                    {item.name}
                  </span>
                ) : (
                  <Link href={item.href} className="hover:text-primary">
                    {item.name}
                  </Link>
                )}
                {isLast ? null : (
                  <ChevronRight className="size-3.5" aria-hidden="true" />
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
