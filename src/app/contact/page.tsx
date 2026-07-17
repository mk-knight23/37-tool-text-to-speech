import { Bug, Github, Mail } from "lucide-react";
import { SITE, ISSUES_URL } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";
import { StaticPage } from "@/components/content/StaticPage";

export const metadata = pageMetadata({
  title: "Contact",
  description:
    "How to reach the maintainer of MK VoiceKit: open a GitHub issue for bugs and requests, or email for private matters.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <StaticPage
      title="Contact"
      lede="MK VoiceKit is a one-person open-source project. Here's how to get in touch, and which channel is best for what."
      path="/contact"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <ContactCard
          icon={Bug}
          title="Report a bug or request a feature"
          body="The best place for anything about the app itself. Issues are public, searchable, and let others chime in. Please include your browser, operating system, and the voice you used."
          actionLabel="Open a GitHub issue"
          href={ISSUES_URL}
        />
        <ContactCard
          icon={Github}
          title="Browse or fork the code"
          body="The full source, the design system, and the product docs live in the repository. Pull requests are welcome — open an issue first for anything substantial."
          actionLabel="View the repository"
          href={SITE.repo}
        />
        <ContactCard
          icon={Mail}
          title="Email for private matters"
          body="For security reports or anything you'd rather not post publicly, email works. For ordinary bugs, a GitHub issue will get a faster, more useful answer."
          actionLabel={SITE.contactEmail}
          href={`mailto:${SITE.contactEmail}`}
          external={false}
        />
      </div>

      <p className="mt-8 text-sm text-text-muted">
        There&rsquo;s no support desk and no guaranteed response time &mdash;
        this is a project maintained in spare time. Clear, specific reports get
        dealt with fastest.
      </p>
    </StaticPage>
  );
}

interface ContactCardProps {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  title: string;
  body: string;
  actionLabel: string;
  href: string;
  external?: boolean;
}

function ContactCard({
  icon: Icon,
  title,
  body,
  actionLabel,
  href,
  external = true,
}: ContactCardProps) {
  return (
    <div className="flex flex-col rounded-xl border border-border bg-surface p-5">
      <Icon className="mb-3 size-6 text-primary" aria-hidden={true} />
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="mt-1 flex-1 text-sm text-text-muted">{body}</p>
      <a
        href={href}
        {...(external
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
        className="mt-4 font-medium text-primary hover:underline"
      >
        {actionLabel}
      </a>
    </div>
  );
}
