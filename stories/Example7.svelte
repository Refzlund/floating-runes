<script lang='ts'>
	import floatingUI, { offset, flip, shift } from 'floating-runes'

	const float = floatingUI({
		placement: 'bottom',
		middleware: [
			offset({ mainAxis: 8 }),
			flip(),
			shift({ padding: 8 })
		]
	})

	// Reactive state for mouse position
	let mouseX = $state(0)
	let mouseY = $state(0)
	let showTooltip = $state(false)

	// Reactive getter pattern - automatically updates when mouseX/mouseY change
	float.virtual(() => showTooltip ? { x: mouseX, y: mouseY } : undefined)
</script>

<!-- 
	DX Improvement: Reactive getter pattern
	- float.virtual(() => ({ x, y })) - reactively updates from $state
	- No need for event handlers on the element itself
-->
<div 
	class='wrapper'
	onpointerenter={() => showTooltip = true}
	onpointerleave={() => showTooltip = false}
	onpointermove={(e) => { mouseX = e.clientX; mouseY = e.clientY }}
>
	<div class='area'>
		<p>Reactive Getter Pattern</p>
		<p class='hint'>Mouse: ({mouseX}, {mouseY})</p>
	</div>

	{#if showTooltip}
		<tooltip use:float>
			Reactive virtual tooltip ✨
		</tooltip>
	{/if}
</div>


<style>
	tooltip {
		position: fixed;
		background-color: hsl(280, 60%, 50%);
		color: white;
		border-radius: .25rem;
		padding: .5rem 1rem;
		width: max-content;
		pointer-events: none;
		font-size: 0.875rem;
		box-shadow: 0 4px 12px hsla(0, 0%, 0%, 0.15);
	}

	.area {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		gap: 0.5rem;
		
		p {
			margin: 0;
			color: hsl(0, 0%, 70%);
		}
		
		.hint {
			font-size: 0.875rem;
			color: hsl(0, 0%, 50%);
			font-family: monospace;
		}
	}

	.wrapper {
		position: relative;
		width: 400px;
		height: 250px;
		margin: 2rem;
		border: 2px dashed hsla(280, 60%, 50%, 0.4);
		border-radius: 0.5rem;
		background: hsla(280, 60%, 50%, 0.05);
		cursor: crosshair;
	}
</style>
