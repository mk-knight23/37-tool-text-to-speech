import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Waveform } from "@/components/ui/Waveform";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-6 px-4 py-24 text-center">
      <Waveform bars={5} className="h-8" />
      <h1 className="text-4xl font-bold">Page not found</h1>
      <p className="text-text-muted">
        That page does not exist. It may have moved, or the link was mistyped.
      </p>
      <div className="flex gap-3">
        <Link href="/">
          <Button>Go home</Button>
        </Link>
        <Link href="/tool">
          <Button variant="secondary">Open the workspace</Button>
        </Link>
      </div>
    </div>
  );
}
