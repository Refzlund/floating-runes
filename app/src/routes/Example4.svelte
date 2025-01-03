<script lang='ts'>
	import floatingUI, { flip, shift, arrow, offset } from 'floating-runes'
	import { fly } from 'svelte/transition'

	const float = floatingUI({
		placement: 'top',
		middleware: [
			offset({ mainAxis: 8 }),
			flip(),
			shift(),
			arrow(),
        ]
	})
</script>

<div class='wrapper'>
	<div>
		{#if float.referenced}
			<tooltip use:float transition:fly={{ y: 5, duration: 250 }}>
				This is a tooltip🦒
				<arrow use:float.arrow></arrow>
			</tooltip>
		{/if}
		<button use:float.ref={'pointerenter'} use:float.unref={'pointerleave'}> Hover me </button>
	</div>
</div>


<style>

	arrow {
		display: block;
		width: 12px;
		height: 12px;
		background-color: hsl(0, 0%, 30%);
		transform: rotate(45deg);
		border-radius: 2px;
	}

	tooltip {
		background-color: hsl(0, 0%, 30%);
		color: white;
		border-radius: .25rem;
		padding: .5rem 1rem;
		width: max-content;
		pointer-events: none;
	}




	/** Container styling - ignore */
	.wrapper {
		position: relative;
		
		width: 300px;
		height: 200px;
		margin: 2rem;
		border: 1px solid hsla(0, 0%, 50%, .2);
		overflow: auto;
		scrollbar-width: thin;

		> div {
			width: 500px;
			height: 330px;
			display: flex;
			align-items: center;
			justify-content: center;
		}
	}

</style>