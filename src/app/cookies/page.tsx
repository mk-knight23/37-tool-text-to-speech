import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { StaticPage } from "@/components/content/StaticPage";
import { ConsentControl } from "@/components/content/ConsentControl";

export const metadata = pageMetadata({
  title: "Cookies",
  description:
    "How MK VoiceKit uses local storage and cookies. No tracking cookies by default; analytics load only if you opt in. Change your choice here.",
  path: "/cookies",
});

export default function CookiesPage() {
  return (
    <StaticPage
      title="Cookies and local storage"
      lede="MK VoiceKit sets no tracking cookies by default. Here's exactly what it stores, and a switch to change your analytics choice."
      path="/cookies"
    >
      <div className="vk-prose">
        <h2>Your choice</h2>
        <p>
          Analytics are declined by default. You can change your preference here;
          it takes effect immediately and is remembered on this device. The same
          control is available in <Link href="/settings">Settings</Link>.
        </p>
      </div>

      <div className="my-6">
        <ConsentControl />
      </div>

      <div className="vk-prose">
        <h2>What MK VoiceKit stores on your device</h2>
        <p>
          These are used to make the app work and are never sent anywhere:
        </p>
        <ul>
          <li>
            <strong>Preferences</strong> &mdash; your theme, default speed, pitch
            and volume, text size and similar settings.
          </li>
          <li>
            <strong>History, presets and queue</strong> &mdash; stored in
            IndexedDB so your work survives a reload. You can clear these in
            Settings.
          </li>
          <li>
            <strong>Consent choice</strong> &mdash; whether you allowed or
            declined analytics, so you aren&rsquo;t asked repeatedly.
          </li>
          <li>
            <strong>Your AI key</strong>, if you chose to add one &mdash; kept on
            this device only.
          </li>
        </ul>

        <h2>Analytics cookies</h2>
        <p>
          If a measurement container is configured for the deployment and you opt
          in, Google Tag Manager loads and the analytics provider may set its own
          cookies to measure anonymous usage. Declining prevents the script from
          loading at all, so no such cookies are set. No analytics script runs in
          development, regardless of your choice.
        </p>
        <p>
          For the full picture of what is and isn&rsquo;t collected, see the{" "}
          <Link href="/privacy">privacy policy</Link>.
        </p>
      </div>
    </StaticPage>
  );
}
