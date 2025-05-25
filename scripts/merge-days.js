// scripts/merge-days.js
import { readdirSync, readFileSync, writeFileSync } from "fs";

const folder = "data/questions";
const outputFile = "data/PQs_2025.json";

let mergedResults = [];

const files = readdirSync(folder)
  .filter(f => f.startsWith("day_") && f.endsWith(".json"))
  .sort();

for (const file of files) {
  const raw = readFileSync(`${folder}/${file}`, "utf-8");
  try {
    const json = JSON.parse(raw);
    if (Array.isArray(json.results)) {
      mergedResults.push(...json.results);
    } else {
      console.warn(`⚠️ No results array in ${file}`);
    }
  } catch (err) {
    console.error(`❌ Error parsing ${file}: ${err.message}`);
  }
}

writeFileSync(outputFile, JSON.stringify(mergedResults, null, 2));
console.log(`✅ Merged ${files.length} files into ${outputFile}`);
