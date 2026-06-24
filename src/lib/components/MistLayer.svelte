<div class="mist" aria-hidden="true">
	<span class="cloud a"></span>
	<span class="cloud b"></span>
	<span class="cloud c"></span>
</div>

<style>
	.mist { position: fixed; inset: 0; z-index: -1; overflow: hidden; pointer-events: none; }
	.cloud { position: absolute; width: 60vw; height: 60vw; border-radius: 50%; filter: blur(80px); opacity: 0.22; }
	.a { background: var(--amethyst); top: -10%; left: -10%; animation: drift 38s ease-in-out infinite alternate; }
	.b { background: var(--el-water); bottom: -15%; right: -10%; animation: drift 52s ease-in-out infinite alternate-reverse; }
	.c { background: var(--sage); top: 30%; left: 40%; opacity: 0.12; animation: drift 64s ease-in-out infinite alternate; }
	@keyframes drift { from { transform: translate3d(0,0,0) scale(1); } to { transform: translate3d(6%, -8%, 0) scale(1.15); } }
	@media (prefers-reduced-motion: reduce) { .cloud { animation: none; } }
</style>
