import fs from "fs";
import path from "path";

const yearArg = process.argv[2];
const YEAR = (yearArg || new Date().getUTCFullYear().toString()).trim();

const INPUT_DIR = path.join("data", "PQs_paginated", YEAR);
const OUTPUT_FILE = `PQs_${YEAR}_paginated.json`;

// Only merge day files (prevents accidentally merging other JSON you may store here)
function getSortedDayFiles(dir) {
  return fs
    .readdirSync(dir)
    .filter((file) => /^day_\d{4}-\d{2}-\d{2}\.json$/.test(file))
    .sort();
}

function mergeFiles() {
  if (!fs.existsSync(INPUT_DIR)) {
    console.error(`❌ INPUT_DIR does not exist: ${INPUT_DIR}`);
    process.exit(1);
  }

  const files = getSortedDayFiles(INPUT_DIR);
  if (files.length === 0) {
    console.error(`❌ No day_YYYY-MM-DD.json files found in: ${INPUT_DIR}`);
    process.exit(1);
  }

  let merged = [];

  for (const file of files) {
    const filePath = path.join(INPUT_DIR, file);
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      const data = JSON.parse(content);

      if (Array.isArray(data)) {
        merged.push(...data);
        console.log(`✅ Merged ${YEAR}/${file} (${data.length} entries)`);
      } else {
        console.warn(`⚠️ Skipped ${YEAR}/${file} — not an array`);
      }
    } catch (err) {
      console.error(`❌ Failed to read/parse ${YEAR}/${file}: ${err.message}`);
    }
  }

  // Minified JSON for dashboards (smaller payload)
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(merged));
  console.log(`🎉 Wrote ${OUTPUT_FILE} with ${merged.length} entries (minified)`);
}

try {
  mergeFiles();
} catch (err) {
  console.error("💥 Merge script crashed:", err.message);
  process.exit(2);
}
