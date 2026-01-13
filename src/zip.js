import gulp from "gulp";
import zip from "gulp-zip";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Read package.json for version info
const pkgPath = join(__dirname, "../package.json");
const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));

const distDir = join(__dirname, "../build");
const outputDir = join(__dirname, "../dist");

// Create ZIP task
export const createZip = () => {
  return gulp
    .src(`${distDir}/**/*`)
    .pipe(zip(`${pkg.name}-${pkg.version}.zip`))
    .pipe(gulp.dest(outputDir));
};

// Run the zip task
gulp.task("default", createZip);
