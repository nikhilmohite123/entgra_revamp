import fs from 'fs';
import path from 'path';

const srcDir = 'C:\\Users\\USER\\.gemini\\antigravity-ide\\brain\\15fa264e-4ef7-4558-91fe-edfa77f03176';
const destDir = './public/img';

// Ensure destination exists
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
  console.log('Created directory:', destDir);
}

const assets = [
  {
    src: 'world_map_clocks_1788152210184.jpg',
    dest: 'EPL-MAP1-new.jpg'
  },
  {
    src: 'md_anand_kripalu_1788152330349.jpg',
    dest: 'MD_AK.jpg'
  },
  {
    src: 'ep_connect_logo_1788152344123.jpg',
    dest: 'Logo1-EpConnect.jpg'
  }
];

assets.forEach((asset) => {
  const srcPath = path.join(srcDir, asset.src);
  const destPath = path.join(destDir, asset.dest);

  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${asset.src} to ${destPath}`);
  } else {
    console.warn(`Source asset not found: ${srcPath}`);
  }
});

// Create fallbacks for other logos/images to avoid 404
const logoPath = path.join(destDir, 'Logo1-EpConnect.jpg');
const fallbacks = [
  'event_logo3.jpg',
  'ep_logo.jpg',
  'no_image.PNG'
];

if (fs.existsSync(logoPath)) {
  fallbacks.forEach((fallback) => {
    const destPath = path.join(destDir, fallback);
    if (!fs.existsSync(destPath)) {
      fs.copyFileSync(logoPath, destPath);
      console.log(`Created fallback for ${fallback} using Logo1-EpConnect.jpg`);
    }
  });
}
