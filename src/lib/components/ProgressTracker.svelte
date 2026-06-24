<script lang="ts">
	let { total, studied }: { total: number; studied: number } = $props();
	const pct = $derived(Math.round((studied / total) * 100));
</script>

<div
	class="track"
	role="progressbar"
	aria-valuenow={studied}
	aria-valuemin={0}
	aria-valuemax={total}
	aria-label="Cards studied"
>
	<div class="fill" style="width:{pct}%"></div>
	<span class="label">{studied} / {total} studied</span>
</div>

<style>
	.track {
		position: relative;
		height: 10px;
		background: var(--ink-600);
		border-radius: 999px;
		overflow: hidden;
	}
	.fill {
		height: 100%;
		background: linear-gradient(90deg, var(--amethyst), var(--candle));
		box-shadow: var(--glow-candle);
		transition: width 0.4s ease;
	}
	.label {
		position: absolute;
		right: 0;
		top: 14px;
		font-family: var(--font-ui);
		font-size: 0.72rem;
		color: var(--moon-300);
	}
</style>
