import { pageMetadata } from "@/lib/seo";
import { SettingsView } from "@/components/pages/SettingsView";

export const metadata = pageMetadata({
  title: "Settings",
  description:
    "Set default voice, speed and theme, manage privacy and history, and export, import or clear your local MK VoiceKit data.",
  path: "/settings",
});

export default function SettingsPage() {
  return <SettingsView />;
}
