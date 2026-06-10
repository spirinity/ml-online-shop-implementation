"use client";

import { useEffect, useMemo, useState } from "react";
import { ClusterProfile, fetchClusters } from "@/lib/api";

const colors = ["#1c1c1c", "#6d6257", "#9a6b4f", "#b89778", "#d2bfa2", "#8f9c8a"];

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
    <>
      <header className="page-hero">
        <div>
          <span className="eyebrow">Cluster guide</span>
          <h1>Penjelasan semua cluster pelanggan.</h1>
          <p>
            Halaman ini menjelaskan C1-C6 dari model, termasuk proporsi customer, fitur dominan, rata-rata fitur, dan
            strategi marketing untuk setiap segmen.
          </p>
        </div>
      </header>

      {error ? <div className="notice error">{error}</div> : null}

      <section className="panel soft-panel cluster-chart-panel">
        <div className="panel-head">
          <div>
            <span className="eyebrow">Distribution</span>
            <h2>Proporsi cluster dari model</h2>
          </div>
        </div>
        <div className="bar-chart">
          {clusters.map((cluster, index) => (
            <div className="bar-row" key={cluster.cluster}>
              <span>{cluster.cluster_label}</span>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{
                    width: `${Math.max(8, (cluster.proportion / maxProportion) * 100)}%`,
                    background: colors[index % colors.length],
                  }}
                />
              </div>
              <strong>{Math.round(cluster.proportion * 1000) / 10}%</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="cluster-card-grid">
        {clusters.map((cluster) => {
          const featureEntries = Object.entries(cluster.features).slice(0, 6);
          return (
            <article className="cluster-card" key={cluster.cluster}>
              <div className="cluster-card-head">
                <span>{cluster.cluster_label}</span>
                <strong>{cluster.profile}</strong>
              </div>
              <p>{cluster.strategy}</p>
              <div className="dominant-line">{cluster.dominant_features}</div>
              <div className="mini-feature-grid">
                {featureEntries.map(([key, feature]) => (
                  <div key={key}>
                    <span>{key}</span>
                    <strong>{feature.mean.toLocaleString("id-ID")}</strong>
                    <small>{feature.label}</small>
                  </div>
                ))}
              </div>
            </article>
          );
        })}
      </section>

      <div className="notice">
        Label C1-C6 adalah mapping bisnis dari hasil KMeans. Nomor cluster mentah KMeans bersifat arbitrary, lalu
        dipetakan berdasarkan profil fitur.
      </div>
    </>
  );
}
