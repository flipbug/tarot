<script lang="ts">
	let { size = 120 }: { size?: number } = $props();
</script>

<svg width={size} height={size} viewBox="0 0 100 100" class="moon" aria-hidden="true">
	<defs>
		<radialGradient id="mg" cx="40%" cy="35%">
			<stop offset="0%" stop-color="var(--moon-100)" />
			<stop offset="100%" stop-color="var(--moon-300)" />
		</radialGradient>
	</defs>
	<circle cx="50" cy="50" r="38" fill="url(#mg)" />
	<circle cx="62" cy="44" r="6" fill="rgba(20,18,43,0.12)" />
	<circle cx="44" cy="62" r="4" fill="rgba(20,18,43,0.1)" />
</svg>

<style>
	.moon { filter: drop-shadow(var(--glow-moon)); }
</style>
