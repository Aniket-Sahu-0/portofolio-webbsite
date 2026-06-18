const fs = require('fs/promises');
const path = require('path');
const sharp = require('sharp');

const rootDir = path.resolve(__dirname, '..', '..');
const sourceDir = path.join(rootDir, 'media');
const outputDir = path.join(rootDir, 'media-optimized');
const supported = new Set(['.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff']);

const variants = [
  { suffix: 'hero-desktop', width: 1920, quality: 78 },
  { suffix: 'hero-mobile', width: 900, quality: 74 },
  { suffix: 'gallery-thumb', width: 900, quality: 72 },
  { suffix: 'portfolio-large', width: 1400, quality: 76 },
];

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      return entry.isDirectory() ? walk(fullPath) : fullPath;
    })
  );
  return files.flat();
}

function outputPathFor(file, variant) {
  const relative = path.relative(sourceDir, file);
  const parsed = path.parse(relative);
  return path.join(outputDir, parsed.dir, `${parsed.name}-${variant.suffix}.webp`);
}

async function optimizeFile(file) {
  await Promise.all(
    variants.map(async (variant) => {
      const target = outputPathFor(file, variant);
      await fs.mkdir(path.dirname(target), { recursive: true });
      await sharp(file)
        .rotate()
        .resize({ width: variant.width, withoutEnlargement: true })
        .webp({ quality: variant.quality })
        .toFile(target);
      console.log(`created ${path.relative(rootDir, target)}`);
    })
  );
}

async function main() {
  try {
    await fs.access(sourceDir);
  } catch (_) {
    console.error(`Missing source directory: ${sourceDir}`);
    process.exitCode = 1;
    return;
  }

  const files = (await walk(sourceDir)).filter((file) => supported.has(path.extname(file).toLowerCase()));
  if (files.length === 0) {
    console.log('No supported media files found.');
    return;
  }

  for (const file of files) {
    await optimizeFile(file);
  }

  console.log(`Optimized ${files.length} source files into ${path.relative(rootDir, outputDir)}.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
