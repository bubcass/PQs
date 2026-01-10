import fs from "fs";
import path from "path";

const yearArg = process.argv[2];
const YEAR = (yearArg || new Date().getUTCFullYear().toString()).trim();

const NEW_DIR = path.join("data", "PQs_paginated", YEAR);     // new layout
const OLD_DIR = path.join("data", "PQs_paginated");          // legacy layout

const OUTPUT_FILE = `PQs_${YEAR}_paginated.json`;

function isDayFile(file) {
  return /^day_\d{4}-\d{2}-\d{2}\.json$/.test(file);
}

function isYearDayFile(file, year) {
  return new RegExp(`^day_${year}-\\d{2}-\\d{2}\\.json$`).test(file);
}

function listFilesIfExists(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(isDayFile).sort();
}

function writeEmptyOutput(reason) {
  fs.writeFileSync(OUTPUT_FILE, "[]");
  console.log(`ℹ️ Wrote empty ${OUTPUT_FILE} ([]). Reason: ${reason}`);
}

function mergeFrom(dir, filterFn, label) {
  const files = fs
    .readdirSync(dir)
    .filter((f) => isDayFile(f) && filterFn(f))
    .sort();

  if (files.length === 0) return { merged: [], files: 0 };

  let merged = [];
  for (const file of files) {
    const filePath = path.join(dir, file);
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      const data = JSON.parse(content);
      if (Array.isArray(data)) {
        merged.push(...data);
      } else {
        console.warn(`⚠️ Skipped ${label}/${file} — not an array`);
      }
    } catch (err) {
      console.error(`❌ Failed to read/parse ${label}/${file}: ${err.message}`);
    }
  }

  console.log(`✅ Merged ${files.length} files from ${label}`);
  return { merged, files: files.length };
}

function main() {
  // Prefer new layout if it exists and has any day files
  const newFiles = listFilesIfExists(NEW_DIR);

  let result;
  if (newFiles.length > 0) {
    result = mergeFrom(NEW_DIR, () => true, `${YEAR}`);
  } else if (fs.existsSync(OLD_DIR)) {
    // Fall back to old layout but only merge the target year's files
    result = mergeFrom(OLD_DIR, (f) => isYearDayFile(f, YEAR), "legacy");
  } else {
    writeEmptyOutput("no input directories found");
    return;
  }

  if (!result || result.files === 0) {
    writeEmptyOutput(`no day files found for ${YEAR} in new or legacy layout`);
    return;
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result.merged));
  console.log(`🎉 Wrote ${OUTPUT_FILE} with ${result.merged.length} entries (minified)`);
}

try {
  main();
} catch (err) {
  console.error("💥 Merge script crashed:", err.message);
  process.exit(2);
}
