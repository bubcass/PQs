import { readdirSync, readFileSync, writeFileSync } from "fs";

const folder = "data/questions";
const outputFile = "data/PQs_2025.json";

let mergedResults = [];
let totalDays = 0;
let totalRecords = 0;

const files = readdirSync(folder)
  .filter(f => f.startsWith("day_") && f.endsWith(".json"))
  .sort();

for (const file of files) {
  const path = `${folder}/${file}`;
  try {
    const raw = readFileSync(path, "utf-8");
    const json = JSON.parse(raw);
    if (Array.isArray(json.results)) {
      mergedResults.push(...json.results);
      console.log(`✅ ${file}: ${json.results.length} records`);
      totalRecords += json.results.length;
    } else {
      console.warn(`⚠️ ${file}: No .results[] array`);
    }
    totalDays += 1;
  } catch (err) {
    console.error(`❌ Failed to parse ${file}: ${err.message}`);
  }
}

writeFileSync(outputFile, JSON.stringify(mergedResults, null, 2));
console.log(`🎉 Merged ${totalDays} files, ${totalRecords} total records into ${outputFile}`);
