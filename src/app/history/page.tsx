import { pageMetadata } from "@/lib/seo";
import { HistoryView } from "@/components/pages/HistoryView";

export const metadata = pageMetadata({
  title: "History",
  description:
    "Replay or remove text you've listened to with MK VoiceKit. History is stored only on your device.",
  path: "/history",
});

export default function HistoryPage() {
  return <HistoryView />;
}
