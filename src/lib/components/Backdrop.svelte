<!-- Minimal "dithered universe" backdrop: near-black + a sparse starfield + a fine
     dither grain + a barely-there central glow. Fixed, decorative, behind all content.
     Essentially static so it never competes with the reading. -->
<div class="backdrop" aria-hidden="true">
	<div class="glow"></div>
	<div class="stars"></div>
	<div class="dither"></div>
</div>

<style>
	.backdrop {
		position: fixed;
		inset: 0;
		z-index: -1;
		pointer-events: none;
		background: var(--ink-900);
		overflow: hidden;
	}
	.backdrop > * {
		position: absolute;
		inset: 0;
	}
	/* faint luminous center, like the heart of an orrery */
	.glow {
		background: radial-gradient(
			900px 700px at 50% 38%,
			rgba(201, 212, 232, 0.05),
			rgba(240, 194, 123, 0.02) 45%,
			transparent 72%
		);
	}
	/* sparse, organic starfield (tiled SVG of faint dots) */
	.stars {
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='460' height='460'%3E%3Cg fill='%23ffffff'%3E%3Ccircle cx='38' cy='62' r='0.9' opacity='0.55'/%3E%3Ccircle cx='150' cy='30' r='0.6' opacity='0.35'/%3E%3Ccircle cx='250' cy='120' r='1' opacity='0.6'/%3E%3Ccircle cx='400' cy='70' r='0.6' opacity='0.4'/%3E%3Ccircle cx='90' cy='180' r='0.7' opacity='0.45'/%3E%3Ccircle cx='320' cy='210' r='0.6' opacity='0.3'/%3E%3Ccircle cx='200' cy='260' r='0.9' opacity='0.5'/%3E%3Ccircle cx='430' cy='300' r='0.7' opacity='0.4'/%3E%3Ccircle cx='60' cy='330' r='0.6' opacity='0.35'/%3E%3Ccircle cx='280' cy='370' r='1' opacity='0.55'/%3E%3Ccircle cx='130' cy='410' r='0.7' opacity='0.45'/%3E%3Ccircle cx='370' cy='430' r='0.6' opacity='0.3'/%3E%3Ccircle cx='175' cy='150' r='0.5' opacity='0.28'/%3E%3Ccircle cx='340' cy='40' r='0.5' opacity='0.3'/%3E%3C/g%3E%3C/svg%3E");
		background-repeat: repeat;
	}
	/* fine dither/grain, the halftone-ish texture from the references */
	.dither {
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
		background-repeat: repeat;
		opacity: 0.04;
		mix-blend-mode: overlay;
	}
</style>
