"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ClusterProfile } from "@/lib/api";
import { fetchClusters } from "@/lib/api";

const colors = ["#004876", "#0194ce", "#0075a7", "#58b8dd", "#9bd6ee", "#c7ecf8"];

export default function ClustersPage() {
  const [clusters, setClusters] = useState<ClusterProfile[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetchClusters();
        setClusters(response.clusters);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat cluster.");
      }
    }
    void load();
  }, []);

  const maxProportion = useMemo(() => Math.max(...clusters.map((item) => item.proportion), 0.01), [clusters]);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Cluster guide"
        title="Penjelasan semua cluster pelanggan."
        description="Halaman ini menjelaskan C1-C6 dari model, termasuk proporsi customer, fitur dominan, rata-rata fitur, dan strategi marketing untuk setiap segmen."
      />

      {error ? (
        <Alert className="border-destructive/25 bg-destructive/10 text-destructive" variant="destructive">
          <AlertDescription className="text-destructive">{error}</AlertDescription>
        </Alert>
      ) : null}

      <Card className="rounded-[var(--radius-card)] border-border shadow-none">
        <CardHeader className="border-b border-border pb-4">
          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Distribution
          </span>
          <CardTitle className="text-2xl text-primary">Proporsi cluster dari model</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {clusters.map((cluster, index) => (
              <div
                className="grid grid-cols-[44px_minmax(0,1fr)_56px] items-center gap-3"
                key={cluster.cluster}
              >
                <span className="font-mono text-sm font-semibold text-primary">{cluster.cluster_label}</span>
                <div className="h-4 overflow-hidden rounded-full border border-border bg-secondary">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.max(8, (cluster.proportion / maxProportion) * 100)}%`,
                      background: colors[index % colors.length],
                    }}
                  />
                </div>
                <strong className="text-right text-sm text-primary">
                  {Math.round(cluster.proportion * 1000) / 10}%
                </strong>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-3 motion-stagger">
        {clusters.map((cluster) => {
          const featureEntries = Object.entries(cluster.features).slice(0, 6);
          return (
            <Card className="rounded-[var(--radius-card)] border-border shadow-none transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-lg" key={cluster.cluster} size="sm">
              <CardHeader className="gap-3">
                <Badge className="w-fit rounded-full">{cluster.cluster_label}</Badge>
                <CardTitle className="text-2xl leading-tight text-primary">{cluster.profile}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-6 text-muted-foreground">{cluster.strategy}</p>
                <div className="rounded-[var(--radius-card)] border border-border bg-secondary/40 p-3 text-sm leading-6 text-primary">
                  {cluster.dominant_features}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {featureEntries.map(([key, feature]) => (
                    <div className="rounded-[var(--radius-card)] border border-border p-3" key={key}>
                      <span className="text-xs text-muted-foreground">{key}</span>
                      <strong className="mt-1 block text-sm text-primary">
                        {feature.mean.toLocaleString("id-ID")}
                      </strong>
                      <small className="mt-1 block text-xs leading-4 text-muted-foreground">{feature.label}</small>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <Alert className="border-accent/30 bg-secondary/60">
        <AlertDescription>
          Label C1-C6 adalah mapping bisnis dari hasil KMeans. Nomor cluster mentah KMeans bersifat arbitrary, lalu
          dipetakan berdasarkan profil fitur.
        </AlertDescription>
      </Alert>
    </div>
  );
}
