import { pageMetadata } from "@/lib/seo";
import { getUseCase } from "@/lib/content";
import { ArticleShell } from "@/components/content/ArticleShell";

const entry = getUseCase("studying-from-pdfs")!;

export const metadata = pageMetadata({
  title: entry.title,
  description: entry.description,
  path: "/use-cases/studying-from-pdfs",
});

export default function Page() {
  return (
    <ArticleShell
      kind="use-case"
      entry={entry}
      related={[
        {
          href: "/guides/pdf-to-speech",
          title: "Listening to a PDF",
          excerpt: "How text extraction works and when a PDF can't be read.",
        },
        {
          href: "/guides/building-a-listening-queue",
          title: "Building a listening queue",
          excerpt: "Queue chapters and sections to play through in order.",
        },
      ]}
    >
      <p>
        Revision doesn&rsquo;t have to happen at a desk. If your course materials
        are PDFs &mdash; lecture notes, journal articles, chapters &mdash; you can
        turn them into audio and get through them on a walk, on the bus, or while
        doing something else with your hands. MK VoiceKit extracts the text from a
        PDF in your browser and reads it aloud, so your revision comes with you.
      </p>

      <h2>Get the text out of the PDF</h2>
      <p>
        Open the <a href="/tool">workspace</a> and import your PDF. The text layer
        is extracted on your device using pdf.js; the file is never uploaded. Two
        things are worth knowing before you rely on it:
      </p>
      <ul>
        <li>
          <strong>Scanned PDFs won&rsquo;t work.</strong> If a document is just
          photographed or scanned pages, there&rsquo;s no text to extract and no
          OCR to invent it. You&rsquo;ll see an honest &ldquo;no extractable
          text&rdquo; message rather than silence. A quick test: if you can select
          the text in a normal PDF viewer, MK VoiceKit can read it.
        </li>
        <li>
          <strong>Layout can get messy.</strong> Multi-column papers, footnotes
          and headers sometimes come out in an odd order, because a PDF stores
          position, not reading flow. Skim the extracted text and tidy anything
          that will trip up the reading. The{" "}
          <a href="/guides/pdf-to-speech">PDF guide</a> has tips for this.
        </li>
      </ul>

      <h2>Break it into chapters</h2>
      <p>
        A whole chapter in one block is hard to navigate by ear. Split the text at
        natural section boundaries so you can jump between parts and know roughly
        where you are. If your notes use headings, those make obvious break
        points. You can also use the local, non-AI heading detection, or the
        optional AI chapter generator, to propose sections for you.
      </p>

      <h2>Queue the sections</h2>
      <p>
        Add each section to the <a href="/guides/building-a-listening-queue">listening queue</a>{" "}
        so they play back to back like a playlist. The current item is marked, and
        the queue survives a reload, so if you close the tab and come back later
        it&rsquo;s still there. This is the difference between &ldquo;read one
        page&rdquo; and &ldquo;get through the week&rsquo;s reading&rdquo;.
      </p>

      <h2>Set a pace you can actually absorb</h2>
      <p>
        Revision is not a race. Start around normal speaking speed and slow down
        for dense material &mdash; anything with a lot of numbers, names or
        definitions deserves a lower rate. Turning on the number and abbreviation
        expansion in the text-prep panel helps here: &ldquo;approx. 3.5kg&rdquo;
        read as &ldquo;approximately three point five kilograms&rdquo; is far
        easier to take in than the raw characters. That processing runs in your
        browser and is clearly marked as not AI.
      </p>

      <h2>Pick up where you left off</h2>
      <p>
        Everything you play is recorded in a local history &mdash; the excerpt,
        the voice, the settings and the time. When you come back tomorrow, you can
        replay the section you finished on with one tap rather than hunting for
        your place in the PDF. If you&rsquo;d rather not keep a history, you can
        turn it off in Settings, and clear it there too.
      </p>

      <h2>Follow along when you can</h2>
      <p>
        When you are at a screen, the highlighted sentence lets you read and
        listen at once, which helps things stick and keeps your attention from
        wandering. Click any sentence to re-hear a definition you didn&rsquo;t
        quite catch. When you&rsquo;re away from the screen, the audio stands on
        its own.
      </p>

      <p>
        One honest limit: there&rsquo;s no way to save the audio as a file to load
        into a separate player, because the browser speech engine doesn&rsquo;t
        expose one. You listen inside MK VoiceKit. For most revision that&rsquo;s
        fine &mdash; you keep the tab open and let the queue run.
      </p>
    </ArticleShell>
  );
}
