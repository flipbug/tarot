<script lang="ts">
	import { reading } from '$lib/stores/reading.svelte';
	import { getCard, type CardContent } from '$lib/data';

	let open = $state(false);
	let panelEl: HTMLElement | undefined = $state();

	const entries = $derived(
		reading.entries
			.map((e) => ({ ...e, card: getCard(e.id) }))
			.filter((e): e is typeof e & { card: CardContent } => e.card !== undefined)
	);

	function onWindowKey(e: KeyboardEvent) {
		if (e.key === 'Escape') open = false;
	}
	$effect(() => {
		if (open) panelEl?.focus();
	});
</script>

<svelte:window onkeydown={onWindowKey} />

<button
	class="trigger"
	aria-expanded={open}
	aria-controls="reading-dock"
	onclick={() => (open = !open)}
>
	Reading
	{#if reading.count > 0}<span class="badge">{reading.count}</span>{/if}
</button>

{#if open}
	<aside
		id="reading-dock"
		class="panel"
		tabindex="-1"
		bind:this={panelEl}
		aria-label="Reading tray"
	>
		<header>
			<h2>Reading</h2>
			<button class="close" onclick={() => (open = false)} aria-label="Close">×</button>
		</header>

		{#if entries.length === 0}
			<p class="empty">Add cards from the deck or any card's page to build your reading.</p>
		{:else}
			<ul>
				{#each entries as e (e.id)}
					<li>
						<a class="go" href="/card/{e.id}" onclick={() => (open = false)}>
							<img src={e.card.image} alt={e.card.name} class:reversed={e.reversed} />
							<span class="nm"
								>{e.card.name}{#if e.reversed}<em> reversed</em>{/if}</span
							>
						</a>
						<div class="ops">
							<button onclick={() => reading.move(e.id, -1)} aria-label="Move up">↑</button>
							<button onclick={() => reading.move(e.id, 1)} aria-label="Move down">↓</button>
							<button onclick={() => reading.toggleReversed(e.id)} aria-label="Toggle reversed"
								>⤢</button
							>
							<button onclick={() => reading.remove(e.id)} aria-label="Remove">×</button>
						</div>
					</li>
				{/each}
			</ul>
			<footer>
				<a href="/reading" onclick={() => (open = false)}>Open full spread →</a>
				<button class="clear" onclick={() => reading.clear()}>Clear</button>
			</footer>
		{/if}
	</aside>
{/if}

<style>
	.trigger {
		position: fixed;
		right: var(--space-6);
		bottom: var(--space-6);
		z-index: 60;
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-family: var(--font-ui);
		font-size: 0.78rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		padding: var(--space-3) var(--space-4);
		border: 1px solid var(--ink-600);
		border-radius: 999px;
		background: var(--ink-800);
		color: var(--moon-100);
		cursor: pointer;
		box-shadow: var(--glow-moon);
	}
	.badge {
		min-width: 1.3em;
		padding: 0 0.35em;
		border-radius: 999px;
		background: var(--candle);
		color: var(--ink-900);
		font-size: 0.7rem;
		text-align: center;
	}
	.panel {
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		width: min(360px, 90vw);
		z-index: 61;
		background: var(--ink-800);
		border-left: 1px solid var(--ink-600);
		padding: var(--space-6);
		overflow-y: auto;
		display: grid;
		grid-template-rows: auto 1fr auto;
		gap: var(--space-4);
		animation: slide-in 0.25s ease;
	}
	header {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
	}
	header h2 {
		margin: 0;
		font-size: 1.4rem;
	}
	.close {
		background: none;
		border: 0;
		color: var(--moon-300);
		font-size: 1.5rem;
		cursor: pointer;
	}
	.empty {
		color: var(--moon-300);
		font-size: 0.9rem;
	}
	ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: var(--space-3);
		align-content: start;
	}
	li {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;
		gap: var(--space-2);
	}
	.go {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		min-width: 0;
	}
	.go img {
		width: 34px;
		border-radius: 3px;
		box-shadow: 0 0 0 1px var(--edge-line);
	}
	.go img.reversed {
		transform: rotate(180deg);
	}
	.nm {
		font-family: var(--font-ui);
		font-size: 0.82rem;
		color: var(--moon-100);
	}
	.nm em {
		color: var(--candle);
		font-style: normal;
		font-size: 0.7rem;
	}
	.ops {
		display: flex;
		gap: 2px;
	}
	.ops button {
		background: none;
		border: 0;
		color: var(--moon-300);
		cursor: pointer;
		padding: 2px 4px;
		font-size: 0.9rem;
	}
	.ops button:hover {
		color: var(--moon-100);
	}
	footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-family: var(--font-ui);
		font-size: 0.8rem;
		border-top: 1px solid var(--ink-700);
		padding-top: var(--space-4);
	}
	footer a {
		color: var(--candle);
	}
	.clear {
		background: none;
		border: 0;
		color: var(--moon-300);
		cursor: pointer;
	}
	@keyframes slide-in {
		from {
			transform: translateX(100%);
		}
		to {
			transform: translateX(0);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.panel {
			animation: none;
		}
	}
</style>
