<script lang='ts'>
	import floatingUI, { flip, shift, arrow, offset } from 'floating-runes'

	const float = floatingUI({
		placement: 'top',
		middleware: [
			offset({ mainAxis: 12 }),
			flip(),
			shift(),
			arrow(),
		]
	})
</script>

<!--
	This example demonstrates:
	1. Arrow CSS custom properties (--float-side, --float-rotation, --float-placement)
	2. Reactive float.placement getter
-->

<div class='wrapper'>
	<div>
		<tooltip use:float>
			Placement: <code>{float.placement ?? 'none'}</code>
			<arrow-element use:float.arrow>
				<svg viewBox="0 0 12 6" width="12" height="6">
					<path d="M0 6L6 0L12 6Z" fill="currentColor"/>
				</svg>
			</arrow-element>
		</tooltip>
		<button use:float.ref>Scroll to flip me</button>
	</div>
</div>

<div class='info'>
	<h3>Arrow CSS Custom Properties</h3>
	<p>The arrow element receives these CSS vars:</p>
	<ul>
		<li><code>--float-side</code>: The side the arrow is on (top, right, bottom, left)</li>
		<li><code>--float-rotation</code>: Rotation for the arrow (0deg, 90deg, 180deg, 270deg)</li>
		<li><code>--float-placement</code>: Full placement string (e.g., "top", "bottom-start")</li>
	</ul>
	<h3>Reactive Placement</h3>
	<p>Use <code>float.placement</code> directly in templates - no .then() callback needed!</p>
</div>


<style>
	tooltip {
		display: block;
		position: relative;
		background-color: hsl(0, 0%, 30%);
		color: white;
		border-radius: .25rem;
		padding: .5rem 1rem;
		width: max-content;
	}

	arrow-element {
		/* Arrow is position: absolute from floatingUI, 
		   but parent tooltip needs position: relative */
		color: hsl(0, 0%, 30%);
	}

	/* Arrow auto-rotation using CSS var */
	arrow-element svg {
		display: block;
		transform: rotate(var(--float-rotation, 0deg));
		transition: transform 0.15s ease;
	}

	tooltip code {
		background: hsl(0, 0%, 20%);
		padding: 0.1rem 0.3rem;
		border-radius: 0.2rem;
		font-family: monospace;
	}

	button {
		padding: 0.5rem 1rem;
		background: hsl(210, 80%, 50%);
		color: white;
		border: none;
		border-radius: 0.25rem;
		cursor: pointer;
	}

	.info {
		margin: 2rem;
		padding: 1rem;
		background: hsl(0, 0%, 95%);
		border-radius: 0.5rem;
	}

	.info h3 {
		margin-top: 1rem;
		margin-bottom: 0.5rem;
	}

	.info h3:first-child {
		margin-top: 0;
	}

	.info code {
		background: hsl(0, 0%, 85%);
		padding: 0.1rem 0.3rem;
		border-radius: 0.2rem;
		font-family: monospace;
	}

	.info ul {
		margin: 0.5rem 0;
		padding-left: 1.5rem;
	}

	.info li {
		margin: 0.25rem 0;
	}

	/** Container styling */
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
