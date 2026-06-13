"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { BookText, ExternalLink, GraduationCap, Users, X } from "lucide-react";
import type { ReactNode } from "react";
import {
  APP_REPO_URL,
  APP_TAGLINE,
  COURSE,
  DATASET,
  MEMBERS,
  PAPER,
  RESEARCH_REPO_URL,
  RESULT_HIGHLIGHTS,
  memberInitials,
} from "@/lib/project-info";
import { Logo } from "@/components/logo";

interface AboutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function SectionLabel({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
      <span className="text-accent">{icon}</span>
      {children}
    </div>
  );
}

/**
 * About / project-info modal: explains that this is the Machine Learning
 * (Kelompok 5) course project, the reference paper, dataset, headline results,
 * and the group members.
 */
export function AboutModal({ open, onOpenChange }: AboutModalProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <DialogPrimitive.Popup className="fixed top-1/2 left-1/2 z-50 flex max-h-[88vh] w-[calc(100vw-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[18px] border border-border bg-popover text-popover-foreground shadow-xl ring-1 ring-foreground/10 transition-all duration-200 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0">
          {/* Header */}
          <div className="relative shrink-0 overflow-hidden border-b border-border bg-gradient-to-br from-[#e5f5fc] to-[#c7ecf8] px-6 py-5">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-primary/70">
              {COURSE.kind}
            </span>
            <DialogPrimitive.Title className="mt-1.5">
              <Logo markSize={34} />
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="mt-2 text-sm leading-6 text-primary/80">
              {APP_TAGLINE} — proyek mata kuliah {COURSE.name} ({COURSE.group}, {COURSE.term}).
            </DialogPrimitive.Description>
            <DialogPrimitive.Close
              aria-label="Tutup"
              className="absolute right-4 top-4 grid size-8 place-items-center rounded-full bg-background/70 text-primary backdrop-blur-sm transition-colors hover:bg-background"
            >
              <X size={16} aria-hidden="true" />
            </DialogPrimitive.Close>
          </div>

          {/* Body */}
          <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
            <section className="space-y-2">
              <SectionLabel icon={<BookText size={14} aria-hidden="true" />}>Paper Referensi</SectionLabel>
              <p className="text-sm leading-6 text-foreground">
                Reimplementasi paper{" "}
                <a
                  href={PAPER.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-accent underline-offset-4 hover:underline"
                >
                  “{PAPER.title}”
                </a>{" "}
                ({PAPER.author}, {PAPER.venue}, {PAPER.year}). DOI: {PAPER.doi}.
              </p>
              <p className="text-sm leading-6 text-muted-foreground">
                Pipeline: feature engineering RFM (Var1–Var11) → Z-score → PCA (11→6 komponen) → K-Means (K=6),
                divalidasi dengan Decision Tree.
              </p>
            </section>

            <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {RESULT_HIGHLIGHTS.map((item) => (
                <div className="rounded-[var(--radius-card)] border border-border bg-secondary/40 p-3" key={item.label}>
                  <strong className="block text-lg font-semibold text-primary">{item.value}</strong>
                  <span className="mt-0.5 block text-xs leading-4 text-muted-foreground">{item.label}</span>
                </div>
              ))}
            </section>

            <section className="space-y-3">
              <SectionLabel icon={<Users size={14} aria-hidden="true" />}>Anggota {COURSE.group}</SectionLabel>
              <ul className="grid gap-2 sm:grid-cols-2">
                {MEMBERS.map((member) => (
                  <li
                    className="flex items-center gap-3 rounded-[var(--radius-card)] border border-border p-3"
                    key={member.studentId}
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-xs font-semibold [color:var(--primary-foreground)]">
                      {memberInitials(member.name)}
                    </span>
                    <span className="min-w-0">
                      <strong className="block truncate text-sm font-medium text-primary">{member.name}</strong>
                      <span className="block font-mono text-xs text-muted-foreground">{member.studentId}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="space-y-2">
              <SectionLabel icon={<GraduationCap size={14} aria-hidden="true" />}>Dataset</SectionLabel>
              <p className="text-sm leading-6 text-muted-foreground">
                {DATASET.name} — {DATASET.source} (DOI: {DATASET.doi}).
              </p>
            </section>
          </div>

          {/* Footer */}
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-border px-6 py-4">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <a
                href={APP_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-accent underline-offset-4 hover:underline"
              >
                Repositori aplikasi
                <ExternalLink size={14} aria-hidden="true" />
              </a>
              <a
                href={RESEARCH_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground underline-offset-4 hover:text-accent hover:underline"
              >
                Riset & notebook
                <ExternalLink size={14} aria-hidden="true" />
              </a>
            </div>
            <DialogPrimitive.Close className="inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-medium [color:var(--primary-foreground)] transition-colors hover:bg-primary/85">
              Tutup
            </DialogPrimitive.Close>
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
