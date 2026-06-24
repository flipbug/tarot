// Generate small WebP thumbnails of every card front for the deck overview
// (library) grid. The full-resolution JPGs (~900 KB each, 1111×1919) are far
// too heavy to load 78-at-once; these thumbnails are ~420px wide and a few
// dozen KB each. Output lands in static/cards/thumbs/<id>.webp and is committed
// as a static asset (like the source art), so the Docker build just copies it.
//
// Requires `cwebp` (brew install webp). Run after adding or replacing card art:
//   bun run scripts/build-thumbs.mjs
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const SRC_DIR = path.join(ROOT, 'static/cards');
const OUT_DIR = path.join(SRC_DIR, 'thumbs');

const WIDTH = 420; // ~2x the ~140–170px grid display; height kept proportional
const BACK_WIDTH = 560; // the deck back is the larger landing motif (~210px display)
const QUALITY = 80;

try {
	execFileSync('cwebp', ['-version'], { stdio: 'ignore' });
} catch {
	console.error('cwebp not found. Install it with `brew install webp`, then re-run.');
	process.exit(1);
}

fs.mkdirSync(OUT_DIR, { recursive: true });

const sources = fs
	.readdirSync(SRC_DIR)
	.filter((f) => f.endsWith('.jpg') && f !== 'back.jpg') // card fronts only
	.sort();

let bytesIn = 0;
let bytesOut = 0;
for (const file of sources) {
	const src = path.join(SRC_DIR, file);
	const out = path.join(OUT_DIR, file.replace(/\.jpg$/, '.webp'));
	execFileSync('cwebp', [
		'-quiet',
		'-q',
		String(QUALITY),
		'-resize',
		String(WIDTH),
		'0',
		src,
		'-o',
		out
	]);
	bytesIn += fs.statSync(src).size;
	bytesOut += fs.statSync(out).size;
}

// The deck back doubles as the landing motif, shown larger than a grid cell.
const backSrc = path.join(SRC_DIR, 'back.jpg');
if (fs.existsSync(backSrc)) {
	const backOut = path.join(OUT_DIR, 'back.webp');
	execFileSync('cwebp', [
		'-quiet',
		'-q',
		String(QUALITY),
		'-resize',
		String(BACK_WIDTH),
		'0',
		backSrc,
		'-o',
		backOut
	]);
	bytesIn += fs.statSync(backSrc).size;
	bytesOut += fs.statSync(backOut).size;
}

const mb = (n) => (n / 1024 / 1024).toFixed(1);
console.log(`Wrote ${sources.length} card thumbnails + 1 back to static/cards/thumbs/`);
console.log(
	`Source ${mb(bytesIn)} MB → thumbnails ${mb(bytesOut)} MB (${Math.round((bytesOut / bytesIn) * 100)}% of original).`
);
