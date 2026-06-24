<script lang="ts">
	import MoonPhase from '$lib/components/MoonPhase.svelte';
	import { progress } from '$lib/stores/progress.svelte';
	import { getCard } from '$lib/data';
	const last = $derived(progress.lastCardId ? getCard(progress.lastCardId) : undefined);
</script>

<svelte:head><title>Moonlit Grimoire · Learn the Tarot</title></svelte:head>

<section class="altar container">
	<MoonPhase size={140} />
	<h1>The Moonlit Grimoire</h1>
	<p class="lede">
		A sacred study of the seventy-eight cards — their symbols, numbers, stars, and the many
		traditions that illuminate them. One card at a time.
	</p>
	<div class="doors">
		<a class="door" href="/library"
			><span>Enter the Deck</span><small>Browse &amp; filter all 78 cards</small></a
		>
		<a class="door" href="/journey"
			><span>Walk the Fool's Journey</span><small>The 22 Majors, in order</small></a
		>
		{#if last}<a class="door" href="/card/{last.id}"
				><span>Continue</span><small>{last.name}</small></a
			>{/if}
	</div>
	<a class="about-link" href="/about">About the sources &amp; traditions</a>
</section>

<style>
	.altar {
		min-height: 90vh;
		display: grid;
		place-content: center;
		justify-items: center;
		text-align: center;
		gap: var(--space-6);
	}
	.lede {
		max-width: 48ch;
		color: var(--moon-200);
		font-size: 1.15rem;
	}
	.doors {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-4);
		justify-content: center;
		margin-top: var(--space-4);
	}
	.door {
		display: grid;
		gap: var(--space-1);
		padding: var(--space-6) var(--space-8);
		background: var(--veil);
		border: 1px solid var(--ink-600);
		border-radius: var(--radius-lg);
		min-width: 220px;
		transition:
			box-shadow 0.3s,
			transform 0.3s;
	}
	.door:hover {
		box-shadow: var(--glow-moon);
		transform: translateY(-3px);
	}
	.door span {
		font-family: var(--font-display);
		font-size: 1.3rem;
		color: var(--moon-100);
	}
	.door small {
		font-family: var(--font-ui);
		color: var(--moon-300);
	}
	.about-link {
		font-family: var(--font-ui);
		font-size: 0.85rem;
		color: var(--moon-300);
	}
</style>
