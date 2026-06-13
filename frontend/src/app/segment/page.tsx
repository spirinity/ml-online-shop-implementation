"use client";

import { Boxes, ChartPie, RefreshCw, Store, Workflow } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ErrorAlert } from "@/components/ui/error-alert";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useShop } from "@/components/shop-state";
import { PageHeader } from "@/components/page-header";
import type { CheckoutResponse } from "@/lib/api";
import { cn } from "@/lib/utils";

function currency(value: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function explainSegment(result: CheckoutResponse) {
  const entries = Object.entries(result.features)
    .map(([key, feature]) => ({ key, ...feature }))
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
    .slice(0, 4);
  return entries;
}

export default function SegmentPage() {
  const { result, busy, error, refreshSegment, clearError } = useShop();

  useEffect(() => {
    if (!result) void refreshSegment();
  }, [refreshSegment, result]);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Customer Segment"
        title="Hasil segmentasi pelanggan aktif."
        description="Halaman ini menampilkan segmentasi customer yang sudah pernah checkout. Jika customer belum membeli apa pun, lakukan checkout pertama dari halaman Cart."
        action={
          <Button className="h-11 rounded-full px-5" variant="outline" onClick={refreshSegment} disabled={busy}>
            <RefreshCw size={16} aria-hidden="true" />
            Refresh
          </Button>
        }
      />

      <ErrorAlert message={error} onDismiss={clearError} />

      {!result ? (
        <Card className="rounded-[var(--radius-card)] border-border shadow-none">
          <CardContent className="flex min-h-[380px] flex-col items-center justify-center gap-5 px-6 py-12 text-center">
            <span className="grid size-16 place-items-center rounded-full bg-secondary text-primary">
              <ChartPie size={28} aria-hidden="true" />
            </span>
            <div className="space-y-1.5">
              <strong className="block text-xl font-semibold text-primary">Belum ada segmentasi</strong>
              <p className="mx-auto max-w-md text-sm leading-6 text-muted-foreground">
                Tambahkan produk dan checkout dulu. Setelah itu, hasil C1-C6 akan muncul di halaman ini.
              </p>
            </div>
            <Link className={cn(buttonVariants(), "h-11 rounded-full px-5")} href="/">
              <Store size={16} aria-hidden="true" />
              Mulai Belanja
            </Link>
          </CardContent>
        </Card>
      ) : (
        <section className="space-y-6">
          <Card className="rounded-[var(--radius-container)] border-border bg-secondary/45 shadow-none animate-scale-in">
            <CardContent className="grid gap-6 p-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
              <div>
                <Badge className="rounded-full" variant="secondary">
                  {result.segment.profile}
                </Badge>
                <h2 className="mt-4 text-[4.5rem] font-semibold leading-none text-primary sm:text-[7rem]">
                  {result.segment.cluster_label}
                </h2>
                <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
                  {result.segment.strategy}
                </p>
              </div>
              <ChartPie className="hidden size-16 text-accent sm:block" aria-hidden="true" />
            </CardContent>
          </Card>

          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 motion-stagger">
            {[
              ["Purchases", result.summary.purchase_invoice_count ?? result.summary.invoice_count],
              ["Cancellations", result.summary.cancellation_invoice_count ?? 0],
              ["Total spend", currency(result.summary.total_spend)],
              ["Model proportion", `${Math.round(result.segment.proportion * 100)}%`],
            ].map(([label, value]) => (
              <Card className="rounded-[var(--radius-card)] border-border shadow-none transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5" key={label} size="sm">
                <CardContent>
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <strong className="mt-2 block break-words text-2xl font-semibold text-primary">{value}</strong>
                </CardContent>
              </Card>
            ))}
          </section>

          <Card className="rounded-[var(--radius-card)] border-border shadow-none">
            <CardHeader className="border-b border-border pb-4">
              <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Why this segment?
              </span>
              <CardTitle className="text-2xl text-primary">Fitur paling menonjol untuk customer ini</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {explainSegment(result).map((feature) => (
                  <div className="rounded-[var(--radius-card)] border border-border bg-secondary/35 p-4" key={feature.key}>
                    <span className="text-sm text-muted-foreground">{feature.key}</span>
                    <strong className="mt-2 block text-lg font-semibold text-primary">{feature.label}</strong>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Nilai customer: {feature.value.toLocaleString("id-ID")}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[var(--radius-card)] border-border shadow-none">
            <CardHeader className="border-b border-border pb-4">
              <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Var1-Var11
              </span>
              <CardTitle className="text-2xl text-primary">Feature snapshot</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Object.entries(result.features).map(([key, feature]) => (
                  <div className="rounded-[var(--radius-card)] border border-border p-4" key={key}>
                    <span className="text-sm text-muted-foreground">{key}</span>
                    <strong className="mt-2 block text-xl font-semibold text-primary">
                      {feature.value.toLocaleString("id-ID")}
                    </strong>
                    <small className="mt-2 block text-sm leading-5 text-muted-foreground">{feature.label}</small>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[var(--radius-card)] border-border shadow-none">
            <CardHeader className="border-b border-border pb-4">
              <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Latest history
              </span>
              <CardTitle className="text-2xl text-primary">Histori pembelian customer</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Invoice</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.history.map((item, index) => (
                    <TableRow key={`${item.invoice_no}-${item.stock_code}-${index}`}>
                      <TableCell>
                        <Badge
                          className={cn(
                            "rounded-full",
                            item.transaction_type === "cancel"
                              ? "bg-destructive/10 text-destructive"
                              : "bg-secondary text-primary",
                          )}
                        >
                          {item.transaction_type === "cancel" ? "Cancel" : "Purchase"}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[360px] whitespace-normal">
                        <strong className="block text-primary">{item.description}</strong>
                        <span className="text-sm text-muted-foreground">{item.stock_code}</span>
                      </TableCell>
                      <TableCell>
                        <span className="block">{item.invoice_no}</span>
                        <span className="text-sm text-muted-foreground">
                          {item.invoice_date ? formatDate(item.invoice_date) : "-"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {Math.abs(item.quantity)} x {currency(item.unit_price)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Alert className="border-accent/30 bg-secondary/60">
            <AlertDescription>{result.note}</AlertDescription>
          </Alert>

          <div className="flex flex-wrap gap-3">
            <Link className={cn(buttonVariants({ variant: "outline" }), "h-11 rounded-full px-5")} href="/clusters">
              <Boxes size={16} aria-hidden="true" />
              Lihat semua cluster
            </Link>
            <Link className={cn(buttonVariants({ variant: "outline" }), "h-11 rounded-full px-5")} href="/methodology">
              <Workflow size={16} aria-hidden="true" />
              Lihat pipeline model
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
