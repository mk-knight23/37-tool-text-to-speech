"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import {
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  CircleAlert,
  Sparkles,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";
import { SITE } from "@/lib/site";
import { Waveform } from "@/components/ui/Waveform";

export interface FAQItem {
  question: string;
  answer: string;
}

export interface StepItem {
  step: string;
  title: string;
  description: string;
}

export interface UseCaseItem {
  title: string;
  description: string;
}

export interface RelatedTool {
  href: string;
  title: string;
  description: string;
}

export interface LandingPageProps {
  slug: string;
  h1: string;
  subtitle: string;
  aeoAnswer: string; // 40-70 word direct answer for Google AI Overviews & ChatGPT
  toolComponent: React.ReactNode;
  steps: StepItem[];
  useCases: UseCaseItem[];
  faqs: FAQItem[];
  relatedTools: RelatedTool[];
  supportedFormats?: string;
  limitations?: string;
}

export function LandingPageShell({
  slug,
  h1,
  subtitle,
  aeoAnswer,
  toolComponent,
  steps,
  useCases,
  faqs,
  relatedTools,
  supportedFormats = "Plain text, PDF, DOCX, Markdown, SRT, VTT",
  limitations = "Browser voices rely on on-device OS speech synthesis. Downloadable MP3 audio files are available via optional AI voice providers.",
}: LandingPageProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: `${h1} — ${SITE.name}`,
        description: aeoAnswer,
        url: `${SITE.url}/${slug}`,
        applicationCategory: "MultimediaApplication",
        operatingSystem: "Any (web browser)",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        author: { "@type": "Person", name: SITE.creator.name, url: SITE.creator.portfolio },
      },
      {
        "@type": "HowTo",
        name: `How to use ${h1}`,
        description: aeoAnswer,
        step: steps.map((s, idx) => ({
          "@type": "HowToStep",
          position: idx + 1,
          name: s.title,
          text: s.description,
        })),
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero & AEO Direct Answer Section */}
      <section className="vk-hero-fade border-b border-border/60 pb-8 pt-8 sm:pt-12">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <Waveform bars={4} className="h-6 text-primary" />
            <span className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-bold text-primary">
              100% Free · Privacy-First
            </span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-balance">
            {h1}
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-sm sm:text-base text-text-muted leading-relaxed">
            {subtitle}
          </p>

          {/* 40-70 Word Direct AEO Answer Block */}
          <div className="mx-auto mt-6 max-w-3xl rounded-xl border border-primary/30 bg-primary/5 p-4 text-left shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-primary mb-1 flex items-center gap-1.5">
              <Sparkles size={14} /> Quick Answer
            </p>
            <p className="text-xs sm:text-sm font-medium text-text leading-relaxed">
              {aeoAnswer}
            </p>
          </div>
        </div>

        {/* Embedded Functional Tool */}
        <div className="mx-auto max-w-5xl px-2 sm:px-4 mt-8">
          <Suspense
            fallback={
              <div className="h-96 rounded-xl border border-border bg-surface-sunken animate-pulse flex items-center justify-center">
                <p className="text-xs text-text-muted">Loading interactive tool…</p>
              </div>
            }
          >
            {toolComponent}
          </Suspense>
        </div>
      </section>

      {/* Step-by-Step Instructions */}
      <section className="mx-auto max-w-5xl px-4 py-12">
        <h2 className="text-xl font-bold sm:text-2xl mb-6">How It Works: Step-by-Step</h2>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {steps.map((step, idx) => (
            <div key={idx} className="rounded-xl border border-border bg-surface p-5 shadow-sm space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-on-primary">
                  {idx + 1}
                </span>
                <h3 className="font-bold text-sm text-text">{step.title}</h3>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Genuine Use Cases */}
      <section className="mx-auto max-w-5xl px-4 py-8 border-t border-border">
        <h2 className="text-xl font-bold sm:text-2xl mb-6">Common Use Cases</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {useCases.map((uc, idx) => (
            <div key={idx} className="rounded-xl border border-border bg-surface p-5 shadow-sm space-y-1.5">
              <h3 className="font-bold text-base text-text flex items-center gap-2">
                <CheckCircle2 size={16} className="text-primary shrink-0" />
                <span>{uc.title}</span>
              </h3>
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed">{uc.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Supported Formats & Privacy */}
      <section className="mx-auto max-w-5xl px-4 py-8 border-t border-border">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-surface p-5 shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              <ShieldCheck size={18} />
              <span>Supported Formats & Privacy</span>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              <strong>Formats:</strong> {supportedFormats}.
            </p>
            <p className="text-xs text-text-muted leading-relaxed">
              <strong>Privacy:</strong> All files are parsed locally in your browser. Document text and audio streams are never saved or sent to external servers without explicit user confirmation.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface p-5 shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-accent font-bold text-sm">
              <CircleAlert size={18} />
              <span>Honest Capabilities & Limitations</span>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">{limitations}</p>
          </div>
        </div>
      </section>

      {/* Visible FAQs */}
      <section className="mx-auto max-w-5xl px-4 py-12 border-t border-border">
        <h2 className="text-xl font-bold sm:text-2xl mb-6">Frequently Asked Questions</h2>
        <div className="divide-y divide-border rounded-xl border border-border bg-surface overflow-hidden">
          {faqs.map((faq, idx) => (
            <details key={idx} className="group p-4 text-xs sm:text-sm cursor-pointer [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between font-bold text-text">
                <span>{faq.question}</span>
                <ChevronDown size={16} className="text-text-muted transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-text-muted leading-relaxed">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Related Tools Internal Linking */}
      <section className="mx-auto max-w-5xl px-4 py-12 border-t border-border mb-12">
        <h2 className="text-xl font-bold sm:text-2xl mb-6">Related Speech & Document Tools</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {relatedTools.map((tool, idx) => (
            <Link
              key={idx}
              href={tool.href}
              className="group rounded-xl border border-border bg-surface p-4 shadow-sm hover:border-primary/50 transition-all flex flex-col justify-between"
            >
              <div>
                <h3 className="font-bold text-sm text-text group-hover:text-primary transition-colors">
                  {tool.title}
                </h3>
                <p className="mt-1 text-xs text-text-muted">{tool.description}</p>
              </div>
              <span className="mt-3 text-xs font-semibold text-primary flex items-center gap-1">
                Open tool <ArrowRight size={12} />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
