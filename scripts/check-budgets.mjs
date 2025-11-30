import { readdir, stat } from "node:fs/promises";
import path from "node:path";

const DIST_DIR = path.resolve(process.cwd(), "dist");
const ASSETS_DIR = path.join(DIST_DIR, "assets");

const BUDGETS = {
  jsKb: 280,
  cssKb: 120,
};

const walk = async (dir) => {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return walk(fullPath);
      }
      return fullPath;
    }),
  );
  return files.flat();
};

const sumByExtension = async (files, ext) => {
  const target = files.filter((file) => file.endsWith(ext));
  let total = 0;
  for (const file of target) {
    const stats = await stat(file);
    total += stats.size;
  }
  return total / 1024; // KB
};

const format = (value) => `${value.toFixed(1)} KB`;

const run = async () => {
  const assetsDir = ASSETS_DIR;
  const files = await walk(assetsDir);
  const jsKb = await sumByExtension(files, ".js");
  const cssKb = await sumByExtension(files, ".css");

  const results = [
    { label: "JS", used: jsKb, budget: BUDGETS.jsKb },
    { label: "CSS", used: cssKb, budget: BUDGETS.cssKb },
  ];

  let hasError = false;
  for (const result of results) {
    const within = result.used <= result.budget;
    const status = within ? "PASS" : "FAIL";
    console.log(
      `${status} ${result.label}: ${format(result.used)} / ${format(result.budget)}`,
    );
    if (!within) {
      hasError = true;
    }
  }

  if (hasError) {
    console.error("Performance budgets exceeded. See docs/performance.md for guidance.");
    process.exit(1);
  } else {
    console.log("Performance budgets satisfied.");
  }
};

run().catch((error) => {
  console.error("Unable to evaluate performance budgets:", error);
  process.exit(1);
});

