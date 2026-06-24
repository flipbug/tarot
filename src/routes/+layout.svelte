<script lang="ts">
	import '$lib/styles/tokens.css';
	import '$lib/styles/fonts.css';
	import '$lib/styles/global.css';
	import Backdrop from '$lib/components/Backdrop.svelte';
	let { children } = $props();
</script>

<Backdrop />
<a class="skip" href="#main">Skip to content</a>
<main id="main">
	{@render children()}
</main>

<style>
	.skip {
		position: absolute;
		left: -9999px;
	}
	.skip:focus {
		left: var(--space-4);
		top: var(--space-4);
		z-index: 10;
		background: var(--ink-700);
		padding: var(--space-2) var(--space-4);
		border-radius: 8px;
	}
</style>
