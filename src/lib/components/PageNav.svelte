<!-- Small primary nav shown in the header of the secondary views. -->
<script lang="ts">
	let { current }: { current?: 'home' | 'library' | 'journey' | 'tree' } = $props();
	const links = [
		{ href: '/', key: 'home', label: 'Home' },
		{ href: '/library', key: 'library', label: 'Deck' },
		{ href: '/journey', key: 'journey', label: 'Journey' },
		{ href: '/tree', key: 'tree', label: 'Tree of Life' }
	] as const;
</script>

<nav class="pagenav" aria-label="Primary">
	{#each links as l (l.key)}
		<a
			href={l.href}
			class:active={current === l.key}
			aria-current={current === l.key ? 'page' : undefined}>{l.label}</a
		>
	{/each}
</nav>

<style>
	.pagenav {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-8);
		font-family: var(--font-ui);
		font-size: 0.72rem;
		letter-spacing: 0.18em;
		text-transform: uppercase;
	}
	a {
		color: var(--moon-300);
		transition: color 0.18s ease;
	}
	a:hover {
		color: var(--moon-100);
	}
	a.active {
		color: var(--candle);
	}
</style>
