<script lang="ts">
	import PageNav from '$lib/components/PageNav.svelte';
</script>

<svelte:head><title>About · The Tarot</title></svelte:head>

<section class="container about">
	<PageNav />
	<h1>Sources &amp; traditions</h1>
	<p>
		This is a study of the Rider–Waite–Smith tarot, illustrated by Pamela Colman Smith (1909, public
		domain). Card meanings follow the Rider–Waite–Smith and Hermetic Order of the Golden Dawn
		tradition, enriched with numerology, astrology, qabalah, mythology, and herbal and Wiccan
		correspondences.
	</p>
	<h2>Canonical references</h2>
	<ul>
		<li>
			<a
				href="https://en.wikisource.org/wiki/The_Pictorial_Key_to_the_Tarot"
				target="_blank"
				rel="noopener noreferrer">A.E. Waite, The Pictorial Key to the Tarot (1911)</a
			>
		</li>
		<li>
			<a href="https://www.learntarot.com/" target="_blank" rel="noopener noreferrer"
				>Joan Bunning, Learning the Tarot</a
			>
		</li>
		<li>
			<a
				href="https://en.wikipedia.org/wiki/Hermetic_Qabalah"
				target="_blank"
				rel="noopener noreferrer">Golden Dawn / Hermetic Qabalah correspondences</a
			>
		</li>
	</ul>
	<p class="note">
		These are <em>traditional attributions across many schools</em>, offered for study, not a single
		dogma. Every card links to its own sources for deeper reading.
	</p>
	<h2>Art</h2>
	<p>
		Card images: Rider–Waite–Smith deck, public domain, via <a
			href="https://commons.wikimedia.org/wiki/Category:Rider-Waite_tarot_deck"
			target="_blank"
			rel="noopener noreferrer">Wikimedia Commons</a
		>.
	</p>
</section>

<style>
	.about {
		max-width: 56rem;
	}
	.about p,
	.about li {
		max-width: 65ch;
	}
	.note {
		color: var(--moon-300);
		font-style: italic;
	}
	a {
		color: var(--candle);
	}
</style>
