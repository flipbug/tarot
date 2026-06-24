// Integrity check for src/lib/data/cards.json (run standalone; mirrored by Vitest later).
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/lib/data/cards.json'), 'utf8'));

const MAJ = [
	'the-fool',
	'the-magician',
	'the-high-priestess',
	'the-empress',
	'the-emperor',
	'the-hierophant',
	'the-lovers',
	'the-chariot',
	'strength',
	'the-hermit',
	'wheel-of-fortune',
	'justice',
	'the-hanged-man',
	'death',
	'temperance',
	'the-devil',
	'the-tower',
	'the-star',
	'the-moon',
	'the-sun',
	'judgement',
	'the-world'
];
const SUITS = ['wands', 'cups', 'swords', 'pentacles'];
const RANKS = [
	'ace',
	'two',
	'three',
	'four',
	'five',
	'six',
	'seven',
	'eight',
	'nine',
	'ten',
	'page',
	'knight',
	'queen',
	'king'
];
const EXPECTED = [...MAJ, ...SUITS.flatMap((s) => RANKS.map((r) => `${r}-of-${s}`))];
const ELEMENTS = ['fire', 'water', 'air', 'earth', 'spirit'];
const wc = (s) => (s || '').trim().split(/\s+/).filter(Boolean).length;

let errors = 0;
const err = (id, m) => {
	errors++;
	console.log(`  ✗ ${id}: ${m}`);
};

if (cards.length !== 78) err('SET', `expected 78, got ${cards.length}`);
const ids = cards.map((c) => c.id);
EXPECTED.forEach((id) => {
	if (!ids.includes(id)) err('SET', `missing ${id}`);
});
ids.forEach((id, i) => {
	if (ids.indexOf(id) !== i) err('SET', `duplicate ${id}`);
});

for (const c of cards) {
	for (const f of [
		'id',
		'name',
		'arcana',
		'number',
		'image',
		'essence',
		'symbolism',
		'symbolismProse',
		'keywords',
		'keywordsReversed',
		'upright',
		'reversed',
		'correspondences',
		'mythology',
		'archetype',
		'nature',
		'lightShadow',
		'sources'
	]) {
		const v = c[f];
		if (v == null || (typeof v === 'string' && !v.trim()) || (Array.isArray(v) && !v.length))
			err(c.id, `missing/empty ${f}`);
	}
	if (!c.image.endsWith(`${c.id}.jpg`)) err(c.id, `image path mismatch: ${c.image}`);
	if (!fs.existsSync(path.join(ROOT, 'static', c.image)))
		err(c.id, `image file missing: static${c.image}`);
	if (c.symbolism && (c.symbolism.length < 5 || c.symbolism.length > 9))
		err(c.id, `symbolism count ${c.symbolism.length} (want 5-9)`);
	c.symbolism?.forEach((s, i) => {
		if (!s.symbol?.trim() || !s.meaning?.trim()) err(c.id, `symbolism[${i}] empty`);
	});
	if (c.sources.length < 2) err(c.id, `sources ${c.sources.length} (want >=2)`);
	c.sources.forEach((s, i) => {
		if (!s.title?.trim() || !s.note?.trim()) err(c.id, `source[${i}] missing title/note`);
		try {
			const u = new URL(s.url);
			if (u.protocol !== 'https:') err(c.id, `source[${i}] not https`);
		} catch {
			err(c.id, `source[${i}] bad url ${s.url}`);
		}
	});
	if (!ELEMENTS.includes(c.correspondences?.element))
		err(c.id, `bad element ${c.correspondences?.element}`);
	if (typeof c.correspondences?.numerology?.number !== 'number')
		err(c.id, `numerology.number not a number`);
	if (!c.archetype?.name?.trim() || !c.archetype?.description?.trim())
		err(c.id, `archetype incomplete`);
	if (!c.lightShadow?.light || !c.lightShadow?.shadow || !c.lightShadow?.affirmation)
		err(c.id, `lightShadow incomplete`);
	if (!Array.isArray(c.nature?.herbs) || !Array.isArray(c.nature?.crystals))
		err(c.id, `nature herbs/crystals missing`);
	if (wc(c.symbolismProse) > 180) err(c.id, `symbolismProse ${wc(c.symbolismProse)}>180`);
	if (wc(c.upright) > 130) err(c.id, `upright ${wc(c.upright)}>130`);
	if (wc(c.reversed) > 130) err(c.id, `reversed ${wc(c.reversed)}>130`);
	if (c.arcana === 'major' && !c.journey?.trim()) err(c.id, `major missing journey`);
}
console.log(
	errors === 0
		? `\n✓ All 78 cards valid — every field present, sources well-formed, images on disk, caps respected.`
		: `\n${errors} problem(s) found.`
);
process.exit(errors === 0 ? 0 : 1);
