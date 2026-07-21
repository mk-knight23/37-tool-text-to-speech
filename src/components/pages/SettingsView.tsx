"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Trash2, Upload } from "lucide-react";
import {
  clearAllData,
  DEFAULT_PREFS,
  exportAllData,
  getByokKey,
  getStorageUsage,
  ImportDataError,
  importAllData,
  setByokKey,
  getProviderByokKey,
  setProviderByokKey,
  type StorageUsage,
} from "@/lib/storage";
import {
  GTM_ID,
  getConsent,
  setConsent,
  track,
  type ConsentState,
} from "@/lib/analytics";
import { usePrefs } from "@/hooks/usePrefs";
import { Slider } from "@/components/workspace/Slider";
import { ThemeModeSelect } from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function SettingsView() {
  const { prefs, loaded, update } = usePrefs();
  const [usage, setUsage] = useState<StorageUsage | null>(null);
  const [byok, setByok] = useState("");
  const [byokSaved, setByokSaved] = useState(false);
  const [consent, setConsentState] = useState<ConsentState | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const importRef = useRef<HTMLInputElement | null>(null);

  // Provider key states
  const [keyOpenAI, setKeyOpenAI] = useState("");
  const [keyOpenAISaved, setKeyOpenAISaved] = useState(false);
  const [keyElevenLabs, setKeyElevenLabs] = useState("");
  const [keyElevenLabsSaved, setKeyElevenLabsSaved] = useState(false);
  const [keyGoogle, setKeyGoogle] = useState("");
  const [keyGoogleSaved, setKeyGoogleSaved] = useState(false);
  const [keyAzure, setKeyAzure] = useState("");
  const [keyAzureSaved, setKeyAzureSaved] = useState(false);
  const [keyPolly, setKeyPolly] = useState("");
  const [keyPollySaved, setKeyPollySaved] = useState(false);

  useEffect(() => {
    void getStorageUsage().then(setUsage);
    void getByokKey().then((key) => {
      if (key) {
        setByok(key);
        setByokSaved(true);
      }
    });
    void getProviderByokKey("openai").then((key) => {
      if (key) {
        setKeyOpenAI(key);
        setKeyOpenAISaved(true);
      }
    });
    void getProviderByokKey("elevenlabs").then((key) => {
      if (key) {
        setKeyElevenLabs(key);
        setKeyElevenLabsSaved(true);
      }
    });
    void getProviderByokKey("google").then((key) => {
      if (key) {
        setKeyGoogle(key);
        setKeyGoogleSaved(true);
      }
    });
    void getProviderByokKey("azure").then((key) => {
      if (key) {
        setKeyAzure(key);
        setKeyAzureSaved(true);
      }
    });
    void getProviderByokKey("polly").then((key) => {
      if (key) {
        setKeyPolly(key);
        setKeyPollySaved(true);
      }
    });
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only consent read
    setConsentState(getConsent());
  }, []);

  const handleExport = async () => {
    const payload = await exportAllData();
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `mk-voicekit-backup-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage("Exported your data as a JSON file.");
  };

  const handleImportFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      await importAllData(await file.text());
      setMessage("Import complete. Reloading…");
      setTimeout(() => window.location.reload(), 600);
    } catch (error) {
      setMessage(
        error instanceof ImportDataError
          ? error.message
          : "Could not import that file."
      );
    }
  };

  const handleClearAll = async () => {
    await clearAllData();
    setConfirmClear(false);
    setMessage("All local data cleared. Reloading…");
    setTimeout(() => window.location.reload(), 600);
  };

  const saveByok = async () => {
    await setByokKey(byok.trim() || null);
    setByokSaved(byok.trim().length > 0);
    setMessage(byok.trim() ? "Saved your key on this device." : "Removed the key.");
  };

  const saveProviderKey = async (
    provider: string,
    keyValue: string,
    setSaved: (saved: boolean) => void
  ) => {
    await setProviderByokKey(provider, keyValue.trim() || null);
    setSaved(keyValue.trim().length > 0);
    setMessage(
      keyValue.trim()
        ? `Saved your ${provider} key on this device.`
        : `Removed the ${provider} key.`
    );
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold sm:text-3xl">Settings</h1>
      <p className="mt-1 text-text-muted">
        Preferences are stored on this device. Nothing here is uploaded.
      </p>

      {message ? (
        <p
          role="status"
          className="mt-4 rounded-md border border-border bg-surface-sunken px-3 py-2 text-sm text-text-muted"
        >
          {message}
        </p>
      ) : null}

      {/* Appearance */}
      <Section title="Appearance">
        <Field label="Theme">
          <ThemeModeSelect />
        </Field>
        <Field
          label="Reading text size"
          hint="Applies to the transcript in the workspace."
        >
          <div
            role="radiogroup"
            aria-label="Reading text size"
            className="inline-flex rounded-md border border-border-strong p-1 gap-1"
          >
            {(["base", "large"] as const).map((size) => (
              <button
                key={size}
                type="button"
                role="radio"
                aria-checked={prefs.textScale === size}
                onClick={() => {
                  update({ textScale: size });
                  track("settings_changed", { setting: "text_scale" });
                }}
                className={cn(
                  "min-h-9 rounded-sm px-3 text-sm font-bold capitalize",
                  prefs.textScale === size
                    ? "bg-primary text-on-primary"
                    : "text-text hover:bg-surface-sunken"
                )}
              >
                {size === "base" ? "Standard" : "Large"}
              </button>
            ))}
          </div>
        </Field>
      </Section>

      {/* Playback defaults */}
      <Section title="Default playback">
        <p className="text-sm text-text-muted">
          New sessions start with these values.
        </p>
        <div className="mt-2 flex flex-col gap-4">
          <Slider
            id="default-rate"
            label="Speed"
            min={0.5}
            max={3}
            step={0.1}
            largeStep={0.5}
            value={loaded ? prefs.defaultRate : DEFAULT_PREFS.defaultRate}
            defaultValue={DEFAULT_PREFS.defaultRate}
            onChange={(v) => update({ defaultRate: v })}
            format={(v) => `${v.toFixed(1)}×`}
            formatAria={(v) => `${v.toFixed(1)} times speed`}
          />
          <Slider
            id="default-pitch"
            label="Pitch"
            min={0.5}
            max={2}
            step={0.1}
            largeStep={0.5}
            value={loaded ? prefs.defaultPitch : DEFAULT_PREFS.defaultPitch}
            defaultValue={DEFAULT_PREFS.defaultPitch}
            onChange={(v) => update({ defaultPitch: v })}
            format={(v) => v.toFixed(1)}
            formatAria={(v) => `pitch ${v.toFixed(1)}`}
          />
          <Slider
            id="default-volume"
            label="Volume"
            min={0}
            max={1}
            step={0.05}
            largeStep={0.2}
            value={loaded ? prefs.defaultVolume : DEFAULT_PREFS.defaultVolume}
            defaultValue={DEFAULT_PREFS.defaultVolume}
            onChange={(v) => update({ defaultVolume: v })}
            format={(v) => `${Math.round(v * 100)}%`}
            formatAria={(v) => `volume ${Math.round(v * 100)} percent`}
          />
        </div>
        <ToggleRow
          label="Auto-scroll the transcript"
          hint="Keeps the sentence being read in view."
          checked={prefs.autoScroll}
          onChange={(value) => {
            update({ autoScroll: value });
            track("settings_changed", { setting: "auto_scroll" });
          }}
        />
      </Section>

      {/* Privacy */}
      <Section title="Privacy">
        <ToggleRow
          label="Save history"
          hint="When off, played text is not recorded on this device."
          checked={prefs.historyEnabled}
          onChange={(value) => {
            update({ historyEnabled: value });
            track("settings_changed", { setting: "history_enabled" });
          }}
        />
        <Field label="Analytics">
          {GTM_ID ? (
            <div
              role="radiogroup"
              aria-label="Analytics consent"
              className="inline-flex rounded-md border border-border-strong p-1 gap-1"
            >
              {(["denied", "granted"] as const).map((state) => (
                <button
                  key={state}
                  type="button"
                  role="radio"
                  aria-checked={consent === state}
                  onClick={() => {
                    setConsent(state);
                    setConsentState(state);
                    track("settings_changed", { setting: "analytics_consent" });
                  }}
                  className={cn(
                    "min-h-9 rounded-sm px-3 text-sm font-bold",
                    consent === state
                      ? "bg-primary text-on-primary"
                      : "text-text hover:bg-surface-sunken"
                  )}
                >
                  {state === "granted" ? "Allowed" : "Declined"}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-muted">
              Analytics is not configured in this build, so nothing is tracked
              and no third-party scripts load.
            </p>
          )}
        </Field>
      </Section>

      {/* BYOK */}
      <Section title="AI key (optional)">
        <p className="text-sm text-text-muted">
          The AI tools in the workspace (rewrite, summarise, translate, and
          more) work without any setup, up to a small daily limit. To lift that
          limit, paste your own Vercel AI Gateway key here. It stays on this
          device, is sent only with a request you start yourself, and is never
          logged or saved on a server. Clear the field and save to remove it.
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            type="password"
            value={byok}
            onChange={(event) => {
              setByok(event.target.value);
              setByokSaved(false);
            }}
            placeholder="Paste your key"
            aria-label="AI gateway key"
            autoComplete="off"
            className="flex-1 rounded-md border border-border-strong bg-surface px-3 py-2 text-sm"
          />
          <Button variant="secondary" onClick={saveByok}>
            {byokSaved ? "Saved" : "Save key"}
          </Button>
        </div>
      </Section>

      {/* BYOK TTS Keys */}
      <Section title="AI Speech Keys (optional)">
        <p className="text-sm text-text-muted">
          Configure API credentials to use premium AI voices. These stay locally on this device,
          are sent only when starting speech playback, and are never saved on the server.
          Clear any input and save to remove the credentials.
        </p>
        <div className="mt-4 space-y-4">
          <Field label="OpenAI API Key">
            <div className="flex gap-2 w-full mt-1">
              <input
                type="password"
                value={keyOpenAI}
                onChange={(e) => {
                  setKeyOpenAI(e.target.value);
                  setKeyOpenAISaved(false);
                }}
                placeholder="sk-..."
                className="flex-1 rounded-md border border-border-strong bg-surface px-3 py-2 text-sm"
              />
              <Button variant="secondary" onClick={() => saveProviderKey("openai", keyOpenAI, setKeyOpenAISaved)}>
                {keyOpenAISaved ? "Saved" : "Save"}
              </Button>
            </div>
          </Field>

          <Field label="ElevenLabs API Key">
            <div className="flex gap-2 w-full mt-1">
              <input
                type="password"
                value={keyElevenLabs}
                onChange={(e) => {
                  setKeyElevenLabs(e.target.value);
                  setKeyElevenLabsSaved(false);
                }}
                placeholder="Enter ElevenLabs Key"
                className="flex-1 rounded-md border border-border-strong bg-surface px-3 py-2 text-sm"
              />
              <Button variant="secondary" onClick={() => saveProviderKey("elevenlabs", keyElevenLabs, setKeyElevenLabsSaved)}>
                {keyElevenLabsSaved ? "Saved" : "Save"}
              </Button>
            </div>
          </Field>

          <Field label="Google Cloud API Key">
            <div className="flex gap-2 w-full mt-1">
              <input
                type="password"
                value={keyGoogle}
                onChange={(e) => {
                  setKeyGoogle(e.target.value);
                  setKeyGoogleSaved(false);
                }}
                placeholder="AIzaSy..."
                className="flex-1 rounded-md border border-border-strong bg-surface px-3 py-2 text-sm"
              />
              <Button variant="secondary" onClick={() => saveProviderKey("google", keyGoogle, setKeyGoogleSaved)}>
                {keyGoogleSaved ? "Saved" : "Save"}
              </Button>
            </div>
          </Field>

          <Field label="Azure Speech Key" hint="Format: region:subscriptionKey (e.g. eastus:xxxx)">
            <div className="flex gap-2 w-full mt-1">
              <input
                type="password"
                value={keyAzure}
                onChange={(e) => {
                  setKeyAzure(e.target.value);
                  setKeyAzureSaved(false);
                }}
                placeholder="region:subscriptionKey"
                className="flex-1 rounded-md border border-border-strong bg-surface px-3 py-2 text-sm"
              />
              <Button variant="secondary" onClick={() => saveProviderKey("azure", keyAzure, setKeyAzureSaved)}>
                {keyAzureSaved ? "Saved" : "Save"}
              </Button>
            </div>
          </Field>

          <Field label="Amazon Polly Credentials" hint="Format: region:accessKeyId:secretAccessKey (e.g. us-east-1:xxxx:yyyy)">
            <div className="flex gap-2 w-full mt-1">
              <input
                type="password"
                value={keyPolly}
                onChange={(e) => {
                  setKeyPolly(e.target.value);
                  setKeyPollySaved(false);
                }}
                placeholder="region:accessKeyId:secretAccessKey"
                className="flex-1 rounded-md border border-border-strong bg-surface px-3 py-2 text-sm"
              />
              <Button variant="secondary" onClick={() => saveProviderKey("polly", keyPolly, setKeyPollySaved)}>
                {keyPollySaved ? "Saved" : "Save"}
              </Button>
            </div>
          </Field>
        </div>
      </Section>

      {/* Data */}
      <Section title="Your data">
        {usage ? (
          <p className="text-sm text-text-muted">
            Using {formatBytes(usage.usedBytes || usage.storageEstimateMB * 1024 * 1024)}
            {usage.quotaBytes
              ? ` of about ${formatBytes(usage.quotaBytes)} available`
              : ""}
            .
          </p>
        ) : null}
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="secondary" onClick={handleExport}>
            <Download className="size-4" aria-hidden="true" />
            Export
          </Button>
          <Button variant="secondary" onClick={() => importRef.current?.click()}>
            <Upload className="size-4" aria-hidden="true" />
            Import
          </Button>
          <input
            ref={importRef}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            onChange={(event) => {
              void handleImportFile(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
          {confirmClear ? (
            <div className="flex items-center gap-2">
              <Button variant="danger" onClick={handleClearAll}>
                <Trash2 className="size-4" aria-hidden="true" />
                Confirm clear all
              </Button>
              <Button variant="ghost" onClick={() => setConfirmClear(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button variant="ghost" onClick={() => setConfirmClear(true)}>
              <Trash2 className="size-4" aria-hidden="true" />
              Clear all data
            </Button>
          )}
        </div>
      </Section>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6 rounded-xl border border-border bg-surface p-5">
      <h2 className="mb-3 text-lg font-bold">{title}</h2>
      {children}
    </section>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4 last:mb-0">
      <p className="mb-1 font-medium">{label}</p>
      {hint ? <p className="mb-2 text-sm text-text-muted">{hint}</p> : null}
      {children}
    </div>
  );
}

function ToggleRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="mt-4 flex cursor-pointer items-start justify-between gap-4">
      <span>
        <span className="font-medium text-text">{label}</span>
        {hint ? (
          <span className="block text-sm text-text-muted">{hint}</span>
        ) : null}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
          checked ? "bg-primary" : "bg-border-strong"
        )}
      >
        <span
          className={cn(
            "inline-block size-5 rounded-full bg-white transition-transform",
            checked ? "translate-x-5" : "translate-x-0.5"
          )}
        />
      </button>
    </label>
  );
}
