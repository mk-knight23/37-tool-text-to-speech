import { Breadcrumbs } from "./Breadcrumbs";

interface StaticPageProps {
  title: string;
  /** Short intro line under the title. */
  lede?: string;
  /** Route path of this page, for the breadcrumb trail. */
  path: string;
  /** Label shown for this page in the breadcrumb (defaults to `title`). */
  crumbLabel?: string;
  children: React.ReactNode;
  /** When set, the body is wrapped in the `.vk-prose` long-form styles. */
  prose?: boolean;
  /** Container width. Legal/docs read better narrow; hubs can go wider. */
  width?: "narrow" | "wide";
}

/**
 * Consistent frame for the standalone content pages (about, legal, docs, etc.):
 * a breadcrumb trail, an `h1`, an optional lede, and the page body. Long-form
 * pages opt into `.vk-prose` via the `prose` flag.
 */
export function StaticPage({
  title,
  lede,
  path,
  crumbLabel,
  children,
  prose = false,
  width = "narrow",
}: StaticPageProps) {
  return (
    <div
      className={`mx-auto px-4 py-10 ${
        width === "wide" ? "max-w-5xl" : "max-w-3xl"
      }`}
    >
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: crumbLabel ?? title, href: path },
        ]}
      />
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {title}
        </h1>
        {lede ? (
          <p className="mt-3 max-w-2xl text-lg text-text-muted">{lede}</p>
        ) : null}
      </header>
      {prose ? <div className="vk-prose">{children}</div> : children}
    </div>
  );
}
