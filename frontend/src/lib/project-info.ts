/**
 * Single source of truth for project / course metadata shown in the About modal
 * and the landing page. Sourced from the Kelompok 5 ML project repository.
 */

export const APP_NAME = "Segmenta";
export const APP_TAGLINE = "Customer Segmentation Playground";

export const COURSE = {
  name: "Machine Learning",
  term: "Semester Genap 2024/2025",
  group: "Kelompok 5",
  kind: "Tugas Proyek Mata Kuliah",
};

export const PAPER = {
  title:
    "Customer segmentation in the digital marketing using a Q-learning based differential evolution algorithm integrated with K-means clustering",
  author: "Guanqun Wang",
  venue: "PLoS ONE 20(2): e0318519",
  year: 2025,
  doi: "10.1371/journal.pone.0318519",
  url: "https://doi.org/10.1371/journal.pone.0318519",
};

export const DATASET = {
  name: "Customer Segmentation (UCI Online Retail)",
  source: "Zenodo",
  doi: "10.5281/zenodo.14614252",
  url: "https://zenodo.org/records/14614253",
};

/** Research / notebook repository (paper reimplementation). */
export const RESEARCH_REPO_URL = "https://github.com/spirinity/machine-learning-kelompok-5";
/** This web app's implementation repository. */
export const APP_REPO_URL = "https://github.com/spirinity/ml-online-shop-implementation";
/** Back-compat alias (research repo). */
export const REPO_URL = RESEARCH_REPO_URL;

export type Member = {
  name: string;
  studentId: string;
};

export const MEMBERS: Member[] = [
  { name: "Aisyah Wilda Fauziah Amanda", studentId: "11231005" },
  { name: "Galuh Juliviana Romanita", studentId: "11231027" },
  { name: "Mahardika Arka", studentId: "11231037" },
  { name: "Muhammad Shadiq Al-Fatiy", studentId: "11231065" },
  { name: "Olivia Dafina", studentId: "11231077" },
];

/** Headline results from the notebook pipeline. */
export const RESULT_HIGHLIGHTS: { label: string; value: string }[] = [
  { label: "PCA variance retained", value: "92,43%" },
  { label: "Decision Tree accuracy", value: "98,73%" },
  { label: "Customer segments", value: "C1–C6" },
  { label: "RFM features", value: "Var1–Var11" },
];

export function memberInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}
