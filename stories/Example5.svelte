<script lang='ts'>
	import floatingUI, { offset, flip, shift } from 'floating-runes'

	const float = floatingUI({
		placement: 'right-start',
		middleware: [
			offset({ mainAxis: 12, crossAxis: 12 }),
			flip(),
			shift({ padding: 8 })
		]
	})

	let showTooltip = $state(false)
</script>

<!-- 
	DX Improvement: Using actions instead of manual event handlers
	- use:float.virtual={'pointermove'} - follows pointer on pointermove
	- use:float.unvirtual={'pointerleave'} - clears virtual ref on pointerleave
-->
<div 
	class='wrapper'
	onpointerenter={() => showTooltip = true}
	onpointerleave={() => showTooltip = false}
	use:float.virtual={'pointermove'}
	use:float.unvirtual={'pointerleave'}
>
	<div class='area'>
		<p>Move your cursor around this area</p>
		<p class='hint'>The tooltip follows your cursor</p>
	</div>

	{#if showTooltip}
		<tooltip use:float>
			Mouse position tooltip 🖱️
		</tooltip>
	{/if}
</div>


<style>
	tooltip {
		position: fixed;
		background-color: hsl(220, 60%, 50%);
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
		}
	}

	.wrapper {
		position: relative;
		width: 400px;
		height: 250px;
		margin: 2rem;
		border: 2px dashed hsla(220, 60%, 50%, 0.4);
		border-radius: 0.5rem;
		background: hsla(220, 60%, 50%, 0.05);
		cursor: crosshair;
	}
</style>
