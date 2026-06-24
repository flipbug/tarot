// Apply the de-slopped prose from the cleanup workflow back into cards.json.
// Only the editable prose fields are replaced; identity, correspondences,
// sources, keywords, and nature lists are preserved untouched.
// Usage: node scripts/apply-prose-cleanup.mjs <cleaned-results.json>
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const CARDS = path.join(ROOT, 'src/lib/data/cards.json');

const cleaned = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const byId = new Map(cleaned.map((c) => [c.id, c]));
const cards = JSON.parse(fs.readFileSync(CARDS, 'utf8'));

let applied = 0;
const missing = [];
for (const card of cards) {
	const c = byId.get(card.id);
	if (!c) {
		missing.push(card.id);
		continue;
	}
	if (c.essence) card.essence = c.essence;
	if (Array.isArray(c.symbolism) && c.symbolism.length) card.symbolism = c.symbolism;
	if (c.symbolismProse) card.symbolismProse = c.symbolismProse;
	if (c.upright) card.upright = c.upright;
	if (c.reversed) card.reversed = c.reversed;
	if (c.mythology) card.mythology = c.mythology;
	if (c.archetypeDescription) card.archetype.description = c.archetypeDescription;
	if (c.lightShadow) card.lightShadow = c.lightShadow;
	if (c.natureNote != null && card.nature.note != null) card.nature.note = c.natureNote;
	if (c.journey != null && card.journey != null) card.journey = c.journey;
	applied++;
}

fs.writeFileSync(CARDS, JSON.stringify(cards, null, 2) + '\n');
console.log(`Applied cleaned prose to ${applied}/${cards.length} cards.`);
if (missing.length) console.log(`No cleaned result for: ${missing.join(', ')}`);
