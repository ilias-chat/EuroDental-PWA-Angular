const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');

const root = path.resolve(__dirname, '..');
const iconsDir = path.join(root, 'icons');
const manifestPath = path.join(root, 'public', 'manifest.webmanifest');
const sizes = [48, 72, 96, 128, 192, 256, 512];

async function main() {
  await Promise.all(
    sizes.map((size) =>
      sharp(path.join(iconsDir, `icon-${size}.webp`))
        .png()
        .toFile(path.join(iconsDir, `icon-${size}.png`))
    )
  );

  const manifest = {
    id: '/',
    name: 'EuroDental',
    short_name: 'EuroDental',
    start_url: '/',
    display: 'standalone',
    background_color: '#0A1E3D',
    theme_color: '#0A1E3D',
    lang: 'fr',
    icons: sizes.map((size) => ({
      src: `icons/icon-${size}.png`,
      type: 'image/png',
      sizes: `${size}x${size}`,
      purpose: 'any maskable',
    })),
  };

  await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
