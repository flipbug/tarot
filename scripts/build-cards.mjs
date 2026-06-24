// Build src/lib/data/cards.json from the research-workflow output.
// - merges identity + content, adds image path, drops verdict
// - applies 6 surgical fixes flagged by the adversarial verifier
// - strips empty optional correspondence fields
// - sorts into canonical deck order
// Run: node scripts/build-cards.mjs <raw-output.json>
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const SRC = process.argv[2] || path.join(ROOT, 'docs/card-content-source.json');

// Accept either the full workflow-output envelope or a bare result array.
const loaded = JSON.parse(fs.readFileSync(SRC, 'utf8'));
const result = Array.isArray(loaded) ? loaded : loaded.result;

// Archive provenance (the per-card content + QA verdicts) into the repo.
fs.writeFileSync(path.join(ROOT, 'docs/card-content-source.json'), JSON.stringify(result, null, 2));

const wc = s => (s || '').trim().split(/\s+/).filter(Boolean).length;

// ---- 6 verifier-flagged fixes ----
const FIXES = {
  'seven-of-wands'(c) {
    c.correspondences.decan = c.correspondences.decan.replace('first decan of Leo', 'third decan of Leo');
  },
  'page-of-wands'(c) {
    c.symbolismProse =
      "Waite gives the Page of Wands only a single luminous line: a young man stands in the act of proclamation, unknown but faithful, his tidings strange. He places the figure 'in a scene similar to the former' — the Knight's scene, where Waite tells us mounds or pyramids rise. Everything else flows from the suit itself. The Wands, Waite reminds us, are always in leaf — a suit of life and animation — so the Page's staff is no dead stick but a living, budding branch, fire made green and growing. He is the herald of the element, an envoy bringing word that something new is stirring.\n\nThe familiar Smith illustration adds details Waite never names: salamanders, the fire-spirits of medieval alchemy, embroidered on his tunic; a feathered cap above an open, curious face; an arid plain whose desert framing and count of three pyramids are the artist's flourish, not Waite's.\n\nHe is youth at the threshold of a great fire — eager, faithful, untested, holding a single living wand toward a horizon of ventures not yet begun.";
  },
  'three-of-cups'(c) {
    c.reversed =
      "Reversed, the toast turns sour or the cups run too freely. Waite's reversal speaks of \"expedition, dispatch, achievement, end,\" and warns of \"the side of excess in physical enjoyment, and the pleasures of the senses.\" The celebration may have tipped into overindulgence, or sweetness curdled into surfeit. In modern readings this card can signal gossip and the betrayals of a too-talkative circle, a third party intruding on a couple, or the loneliness of standing outside the group. It can also point to scattered social energy, draining commitments, or a friendship cooled by neglect. The remedy is to withdraw from the noise, restore balance between pleasure and purpose, and tend the few true bonds rather than the many shallow ones. Sometimes it simply marks the swift, business-like end of a matter.";
  },
  'king-of-cups'(c) {
    c.upright = c.upright.replace('Drawn upright, he counsels', 'Upright, he counsels');
    const s = c.sources.find(s => /Suit_of_cups/.test(s.url));
    if (s) s.note = s.note.replace(' and the Grail tradition.', '.').replace(', love, relationships.', ', love, and relationships.');
  },
  'seven-of-swords'(c) {
    const s = c.sources.find(s => /marykgreer/.test(s.url));
    if (s) {
      s.url = 'https://www.learntarot.com/s7.htm';
      s.title = 'Learn Tarot — Seven of Swords by Joan Bunning';
      s.note = "Joan Bunning's practical reading of the Seven of Swords — its themes of running away, hidden action, lone-wolf strategy and trying to get away with something — with upright and reversed guidance.";
    }
  },
  'eight-of-swords'(c) {
    c.upright = c.upright.replace(
      'alongside bad news, crisis and a chastening of the spirit.',
      'alongside bad news, crisis, and censure.'
    );
  },
};

// ---- canonical deck order ----
const MAJ = ['the-fool','the-magician','the-high-priestess','the-empress','the-emperor','the-hierophant','the-lovers','the-chariot','strength','the-hermit','wheel-of-fortune','justice','the-hanged-man','death','temperance','the-devil','the-tower','the-star','the-moon','the-sun','judgement','the-world'];
const SUIT_ORDER = ['wands','cups','swords','pentacles'];
const RANK_ORDER = ['ace','two','three','four','five','six','seven','eight','nine','ten','page','knight','queen','king'];
function order(card) {
  if (card.arcana === 'major') return MAJ.indexOf(card.id);
  return 100 + SUIT_ORDER.indexOf(card.suit) * 14 + RANK_ORDER.indexOf(card.rank);
}

function cleanCorr(corr) {
  for (const k of ['zodiac','planet','decan','treePath']) {
    if (corr[k] != null && String(corr[k]).trim() === '') delete corr[k];
  }
  const h = corr.hebrewLetter;
  if (h && !((h.letter||'').trim() || (h.name||'').trim() || (h.meaning||'').trim())) delete corr.hebrewLetter;
  return corr;
}

const cards = result.map(r => {
  const c = r.content;
  const card = {
    id: r.id,
    name: r.name,
    arcana: r.arcana,
    number: r.number,
    ...(r.suit ? { suit: r.suit } : {}),
    ...(r.rank ? { rank: r.rank } : {}),
    image: `/cards/${r.id}.jpg`,
    essence: c.essence,
    symbolism: c.symbolism,
    symbolismProse: c.symbolismProse,
    keywords: c.keywords,
    keywordsReversed: c.keywordsReversed,
    upright: c.upright,
    reversed: c.reversed,
    correspondences: cleanCorr({ ...c.correspondences }),
    mythology: c.mythology,
    archetype: c.archetype,
    nature: c.nature,
    lightShadow: c.lightShadow,
    ...(c.journey ? { journey: c.journey } : {}),
    sources: c.sources,
  };
  if (FIXES[card.id]) FIXES[card.id](card);
  return card;
});

cards.sort((a, b) => order(a) - order(b));

const outDir = path.join(ROOT, 'src/lib/data');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'cards.json'), JSON.stringify(cards, null, 2) + '\n');

// ---- audit ----
const over = cards.filter(c => wc(c.symbolismProse) > 180 || wc(c.upright) > 130 || wc(c.reversed) > 130);
console.log(`Wrote ${cards.length} cards -> src/lib/data/cards.json`);
console.log(`Over-cap after fixes: ${over.length}`);
over.forEach(c => console.log(`  ${c.id}: prose ${wc(c.symbolismProse)}, up ${wc(c.upright)}, rev ${wc(c.reversed)}`));
console.log('Fixed-card spot check:');
for (const id of Object.keys(FIXES)) {
  const c = cards.find(x => x.id === id);
  console.log(`  ${id}: prose ${wc(c.symbolismProse)}/180, up ${wc(c.upright)}/130, rev ${wc(c.reversed)}/130, decan="${c.correspondences.decan ?? ''}"`);
}
