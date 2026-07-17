import { pageMetadata } from "@/lib/seo";
import { getGuide } from "@/lib/content";
import { ArticleShell } from "@/components/content/ArticleShell";

const entry = getGuide("pdf-to-speech")!;

export const metadata = pageMetadata({
  title: entry.title,
  description: entry.description,
  path: "/guides/pdf-to-speech",
});

export default function Page() {
  return (
    <ArticleShell
      kind="guide"
      entry={entry}
      related={[
        {
          href: "/use-cases/studying-from-pdfs",
          title: "Studying from PDFs",
          excerpt: "A full revision workflow built on PDF import.",
        },
        {
          href: "/guides/text-prep-for-natural-speech",
          title: "Preparing text so it sounds natural",
          excerpt: "Clean up numbers and abbreviations from extracted text.",
        },
      ]}
    >
      <p>
        A PDF is a common way to receive something you&rsquo;d rather listen to
        than read &mdash; a report, a paper, a chapter. MK VoiceKit can pull the
        text out of a PDF and read it aloud, all inside your browser. This guide
        covers how that works, the one big limitation to know about, and how to
        get a clean read.
      </p>

      <h2>How extraction works</h2>
      <p>
        When you import a PDF, MK VoiceKit uses pdf.js &mdash; the same engine
        Firefox uses to display PDFs &mdash; to read the document&rsquo;s text
        layer directly on your device. A background worker does the heavy lifting
        so the interface stays responsive, and you&rsquo;ll see progress while a
        larger file is processed. The file is never uploaded; extraction is
        entirely local.
      </p>

      <h2>The big limitation: scanned PDFs</h2>
      <p>
        Not every PDF actually contains text. Many &mdash; especially anything
        scanned from paper or exported as images &mdash; are just pictures of
        pages. There are no characters to extract, only pixels, and MK VoiceKit
        does not do OCR (optical character recognition) to guess at them. When a
        PDF has no usable text, you&rsquo;ll get an honest &ldquo;no extractable
        text&rdquo; message rather than empty playback.
      </p>
      <p>
        There&rsquo;s a simple test: open the PDF in any normal viewer and try to
        select a sentence with your cursor. If you can highlight the words, they
        exist as text and MK VoiceKit can read them. If your selection grabs the
        whole page as an image, it&rsquo;s a scan, and you&rsquo;d need a separate
        OCR tool first.
      </p>

      <h2>Why the text sometimes comes out jumbled</h2>
      <p>
        A PDF stores where each piece of text sits on the page, not the order you
        should read it in. For a simple single-column document that&rsquo;s fine.
        For multi-column layouts, papers with sidebars, or pages with headers and
        footers, the extracted text can arrive in an odd order &mdash; a footnote
        dropped mid-paragraph, or two columns interleaved. This isn&rsquo;t a bug
        so much as a fact of the format.
      </p>

      <h2>Cleaning up before you listen</h2>
      <p>
        Because the extracted text lands in the editor, you can fix it before
        playing. A quick skim and a few edits go a long way:
      </p>
      <ul>
        <li>Delete repeated running headers, page numbers and footers.</li>
        <li>Rejoin paragraphs that got split across page breaks.</li>
        <li>Remove reference lists or tables you don&rsquo;t want read aloud.</li>
        <li>
          Turn on number and abbreviation expansion so figures and shorthand read
          properly &mdash; academic PDFs are full of both. See{" "}
          <a href="/guides/text-prep-for-natural-speech">preparing text so it sounds natural</a>.
        </li>
      </ul>

      <h2>Break long documents into chapters</h2>
      <p>
        A forty-page PDF is a lot to sit through in one block. Split the text at
        section boundaries so you can move between parts and know where you are.
        Headings make natural break points; you can detect them locally or use the
        optional AI chapter tool to propose sections. Then add the sections to the{" "}
        <a href="/guides/building-a-listening-queue">listening queue</a> to play
        through in order.
      </p>

      <h2>Follow along or listen away</h2>
      <p>
        At a screen, the highlighted sentence lets you read and listen together,
        and you can click any sentence to re-hear a passage. Away from the screen,
        the audio carries on its own, and whatever you play is saved to your local
        history so you can resume tomorrow. The full study routine is in{" "}
        <a href="/use-cases/studying-from-pdfs">studying from PDFs</a>.
      </p>

      <h2>The honest boundary</h2>
      <p>
        MK VoiceKit reads the PDF to you; it can&rsquo;t save that reading as an
        audio file, because the browser speech engine doesn&rsquo;t provide one.
        You listen within the app. And it won&rsquo;t read a scanned document,
        because there&rsquo;s genuinely no text there to read. Knowing those two
        boundaries up front saves the frustration of expecting something the
        format can&rsquo;t deliver.
      </p>
    </ArticleShell>
  );
}
