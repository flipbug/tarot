<!-- Standalone, decorative face-down card with the same cursor-tilt + holographic
     foil + glow as TarotCard, showing the deck's card back. Used as the landing motif. -->
<script lang="ts">
	import CardBackArt from './CardBackArt.svelte';

	let rx = $state(0);
	let ry = $state(0);
	let gx = $state(50);
	let gy = $state(50);
	let active = $state(false);

	function onmove(e: PointerEvent) {
		const el = e.currentTarget as HTMLElement;
		const r = el.getBoundingClientRect();
		const px = (e.clientX - r.left) / r.width;
		const py = (e.clientY - r.top) / r.height;
		ry = (px - 0.5) * 18;
		rx = (0.5 - py) * 18;
		gx = px * 100;
		gy = py * 100;
		active = true;
	}
	function reset() {
		rx = 0;
		ry = 0;
		gx = 50;
		gy = 50;
		active = false;
	}
</script>

<div
	class="cardback"
	class:active
	aria-hidden="true"
	onpointermove={onmove}
	onpointerleave={reset}
	style="--rx:{rx}deg; --ry:{ry}deg; --gx:{gx}%; --gy:{gy}%;"
>
	<div class="inner">
		<CardBackArt />
		<div class="foil"></div>
		<div class="edge"></div>
	</div>
</div>

<style>
	.cardback {
		perspective: 1000px;
		width: 100%;
		max-width: 240px;
		aspect-ratio: 0.585;
	}
	.inner {
		position: relative;
		width: 100%;
		height: 100%;
		transform: rotateX(var(--rx)) rotateY(var(--ry));
		transition: transform 0.25s ease;
		border-radius: var(--radius);
		box-shadow: var(--glow-moon);
	}
	.active .inner {
		transition: transform 0.05s linear;
	}
	.foil {
		position: absolute;
		inset: 0;
		border-radius: var(--radius);
		mix-blend-mode: color-dodge;
		opacity: 0;
		transition: opacity 0.2s;
		background: radial-gradient(
			circle at var(--gx) var(--gy),
			var(--foil-warm),
			var(--foil-cool) 40%,
			transparent 70%
		);
	}
	.active .foil {
		opacity: 0.9;
	}
	.edge {
		position: absolute;
		inset: 0;
		border-radius: var(--radius);
		box-shadow: inset 0 0 0 1px var(--edge-line);
	}
	@media (prefers-reduced-motion: reduce) {
		.inner,
		.active .inner {
			transition: none;
			transform: none;
		}
		.foil {
			display: none;
		}
	}
</style>
