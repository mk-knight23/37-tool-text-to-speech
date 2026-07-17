"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart3, Clock, FileText, Mic } from "lucide-react";
import {
  EMPTY_STATS,
  getStats,
  listHistory,
  listPresets,
  type UsageStats,
} from "@/lib/storage";
import { formatDuration } from "@/lib/format";
import { Button } from "@/components/ui/Button";

interface Loaded {
  stats: UsageStats;
  historyCount: number;
  presetCount: number;
}

export function DashboardView() {
  const [data, setData] = useState<Loaded | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const [stats, history, presets] = await Promise.all([
        getStats(),
        listHistory(),
        listPresets(),
      ]);
      if (active) {
        setData({
          stats,
          historyCount: history.length,
          presetCount: presets.length,
        });
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const stats = data?.stats ?? EMPTY_STATS;
  const hasActivity = stats.itemsSpoken > 0 || (data?.historyCount ?? 0) > 0;

  const topVoices = Object.entries(stats.voiceUsage)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold sm:text-3xl">Dashboard</h1>
      <p className="mt-1 text-text-muted">
        Everything here is measured on this device only. Nothing is collected or
        uploaded.
      </p>

      {!data ? (
        <p className="mt-8 text-text-muted" role="status">
          Loading your local activity…
        </p>
      ) : !hasActivity ? (
        <div className="mt-8 rounded-xl border border-border bg-surface p-8 text-center">
          <BarChart3
            className="mx-auto mb-3 size-8 text-text-muted"
            aria-hidden="true"
          />
          <p className="font-bold">No activity yet</p>
          <p className="mt-1 text-text-muted">
            Play some text and your stats will appear here.
          </p>
          <div className="mt-4">
            <Link href="/tool">
              <Button>Open the workspace</Button>
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={Mic}
              label="Items spoken"
              value={stats.itemsSpoken.toLocaleString()}
            />
            <StatCard
              icon={FileText}
              label="Characters spoken"
              value={stats.charactersSpoken.toLocaleString()}
            />
            <StatCard
              icon={Clock}
              label="Time listened"
              value={formatDuration(stats.msListened)}
            />
            <StatCard
              icon={BarChart3}
              label="Sessions"
              value={stats.sessions.toLocaleString()}
            />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-surface p-5">
              <h2 className="mb-3 font-bold">Most used voices</h2>
              {topVoices.length === 0 ? (
                <p className="text-text-muted">No voice data yet.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {topVoices.map(([voice, count]) => (
                    <li
                      key={voice}
                      className="flex items-center justify-between gap-4"
                    >
                      <span className="truncate">{voice}</span>
                      <span className="vk-tabular text-text-muted">
                        {count.toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="rounded-xl border border-border bg-surface p-5">
              <h2 className="mb-3 font-bold">Saved locally</h2>
              <ul className="flex flex-col gap-2">
                <li className="flex items-center justify-between">
                  <span>History entries</span>
                  <span className="vk-tabular text-text-muted">
                    {data.historyCount}
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Voice presets</span>
                  <span className="vk-tabular text-text-muted">
                    {data.presetCount}
                  </span>
                </li>
              </ul>
              <div className="mt-4 flex gap-2">
                <Link href="/history">
                  <Button variant="secondary" size="sm">
                    View history
                  </Button>
                </Link>
                <Link href="/settings">
                  <Button variant="ghost" size="sm">
                    Manage data
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mic;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <Icon className="mb-2 size-5 text-primary" aria-hidden="true" />
      <p className="vk-tabular text-2xl font-bold">{value}</p>
      <p className="text-sm text-text-muted">{label}</p>
    </div>
  );
}
