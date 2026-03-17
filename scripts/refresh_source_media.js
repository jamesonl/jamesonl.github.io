const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function run(command, args) {
  execFileSync(command, args, {
    cwd: ROOT,
    stdio: "inherit",
  });
}

function countFiles(dir) {
  if (!fs.existsSync(dir)) return 0;
  return fs.readdirSync(dir).filter((file) => !file.startsWith(".")).length;
}

function main() {
  run("python3", ["scripts/fetch_source_portraits.py"]);
  run("node", ["scripts/cache_source_icons.js"]);
  run("node", ["scripts/sync_sources.js"]);

  const portraits = countFiles(path.join(ROOT, "images", "source-portraits"));
  const icons = countFiles(path.join(ROOT, "images", "source-icons"));
  const covers = countFiles(path.join(ROOT, "images", "source-covers"));

  console.log(`Source media refreshed: ${portraits} portraits, ${icons} icons, ${covers} cover assets.`);
}

main();
