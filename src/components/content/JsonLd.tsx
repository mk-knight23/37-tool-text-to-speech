/**
 * Renders a JSON-LD block (STANDARDS §5). Kept in one place so every structured
 * data payload is serialised the same safe way. `data` is a plain object built
 * on the server; there is no user input in it.
 */

interface JsonLdProps {
  data: Record<string, unknown>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
