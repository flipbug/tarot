<script lang="ts">
	import type { CardContent } from '$lib/data';

	let {
		card,
		size = 'thumb',
		flippable = false
	}: {
		card: CardContent;
		size?: 'thumb' | 'hero';
		flippable?: boolean;
	} = $props();

	let rx = $state(0); // rotateX
	let ry = $state(0); // rotateY
	let gx = $state(50); // glare x %
	let gy = $state(50);
	let flipped = $state(false);
	let active = $state(false);

	function onmove(e: PointerEvent) {
		if (size !== 'hero') return;
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
	function flip() {
		if (flippable) flipped = !flipped;
	}
	function onkey(e: KeyboardEvent) {
		if (flippable && (e.key === 'Enter' || e.key === ' ')) {
			e.preventDefault();
			flip();
		}
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
	class="card {size}"
	class:active
	class:flipped
	role={flippable ? 'button' : undefined}
	tabindex={flippable ? 0 : undefined}
	aria-label={flippable ? `${card.name} — activate to flip` : undefined}
	aria-pressed={flippable ? flipped : undefined}
	onpointermove={onmove}
	onpointerleave={reset}
	onclick={flip}
	onkeydown={onkey}
	style="--rx:{rx}deg; --ry:{ry}deg; --gx:{gx}%; --gy:{gy}%;"
>
	<div class="inner">
		<div class="face front">
			<img src={card.image} alt="{card.name} tarot card, Rider–Waite–Smith deck" loading="lazy" />
			<div class="foil" aria-hidden="true"></div>
			<div class="edge" aria-hidden="true"></div>
		</div>
		<div class="face back" aria-hidden="true">
			<div class="sigil">☽</div>
		</div>
	</div>
</div>

<style>
	.card {
		perspective: 1000px;
		width: 100%;
		aspect-ratio: 0.585;
	}
	.hero {
		max-width: 360px;
	}
	.inner {
		position: relative;
		width: 100%;
		height: 100%;
		transform-style: preserve-3d;
		transform: rotateX(var(--rx)) rotateY(var(--ry));
		transition: transform 0.25s ease;
		border-radius: var(--radius);
	}
	.active .inner {
		transition: transform 0.05s linear;
	}
	.flipped .inner {
		transform: rotateY(180deg);
	}
	.face {
		position: absolute;
		inset: 0;
		backface-visibility: hidden;
		border-radius: var(--radius);
		overflow: hidden;
		box-shadow: var(--glow-moon);
	}
	.front img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.foil {
		position: absolute;
		inset: 0;
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
	.back {
		transform: rotateY(180deg);
		display: grid;
		place-items: center;
		background: radial-gradient(circle, var(--ink-600), var(--ink-800));
	}
	.sigil {
		font-size: 3rem;
		color: var(--silver);
		text-shadow: var(--glow-moon);
	}
	@media (prefers-reduced-motion: reduce) {
		.inner,
		.active .inner {
			transition: none;
			transform: none;
		}
		.flipped .inner {
			transform: rotateY(180deg);
		}
		.foil {
			display: none;
		}
	}
</style>
