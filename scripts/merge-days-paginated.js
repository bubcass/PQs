import fs from 'fs';
import path from 'path';

const INPUT_DIR = 'data/PQs_paginated';
const OUTPUT_FILE = 'PQs_2025_paginated.json';

function getSortedFiles(dir) {
  return fs.readdirSync(dir)
    .filter(file => file.endsWith('.json'))
    .sort(); // Lexical sort is fine since filenames are date-formatted
}

function mergeFiles() {
  const files = getSortedFiles(INPUT_DIR);
  let merged = [];

  for (const file of files) {
    const filePath = path.join(INPUT_DIR, file);
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);
      if (Array.isArray(data)) {
        merged.push(...data);
        console.log(`✅ Merged ${file} (${data.length} entries)`);
      } else {
        console.warn(`⚠️ Skipped ${file} — not an array`);
      }
    } catch (err) {
      console.error(`❌ Failed to read or parse ${file}:`, err.message);
    }
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(merged, null, 2));
  console.log(`🎉 Wrote merged file to ${OUTPUT_FILE} with ${merged.length} entries`);
}

mergeFiles();
