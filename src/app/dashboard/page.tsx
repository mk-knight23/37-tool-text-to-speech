import { pageMetadata } from "@/lib/seo";
import { DashboardView } from "@/components/pages/DashboardView";

export const metadata = pageMetadata({
  title: "Dashboard",
  description:
    "Your local MK VoiceKit activity — items spoken, characters read, time listened and most-used voices. Measured on this device only.",
  path: "/dashboard",
});

export default function DashboardPage() {
  return <DashboardView />;
}
