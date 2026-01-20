<script lang='ts'>
	import TooltipRoot, { tooltip } from './TooltipRoot.svelte'
</script>

<!--
	This example demonstrates the Singleton pattern:
	1. TooltipRoot is placed once (renders the floating element)
	2. `tooltip` is imported and used as an action anywhere
	3. The singleton manages visibility, content, and positioning
-->

<!-- Place the root once -->
<TooltipRoot />

<div class='demo'>
	<h2>Singleton Tooltip Demo</h2>
	<p>Hover over the buttons to see the tooltip. Only ONE tooltip element exists in the DOM.</p>

	<div class='buttons'>
		<button use:tooltip={'Save your changes'}>
			💾 Save
		</button>

		<button use:tooltip={'Undo the last action'}>
			↩️ Undo
		</button>

		<button use:tooltip={'Redo the last undone action'}>
			↪️ Redo
		</button>

		<button use:tooltip={'Delete this item permanently'}>
			🗑️ Delete
		</button>
	</div>

	<h3>With Snippets</h3>
	<p>Content can also be a snippet for rich tooltips:</p>

	{#snippet richTooltip()}
		<div class='rich-tooltip'>
			<strong>Rich Content</strong>
			<p>Tooltips can contain any markup!</p>
		</div>
	{/snippet}

	<div class='buttons'>
		<button use:tooltip={richTooltip}>
			✨ Rich Tooltip
		</button>

		<button use:tooltip={{ content: 'Disabled for 0ms delay', showDelay: 0 }}>
			⚡ Instant (0ms delay)
		</button>
	</div>

	<h3>How It Works</h3>
	<pre>{`// TooltipRoot.svelte (place once in your app)
<script module lang='ts'>
  export const tooltip = createSingleton({
    placement: 'top',
    showDelay: 200
  })
</script>

{#if tooltip.visible}
  <div use:tooltip.float use:portal>
    {tooltip.content}
  </div>
{/if}

// Any component
import { tooltip } from './TooltipRoot.svelte'

<button use:tooltip={'Hello!'}>Hover me</button>`}</pre>
</div>

<style>
	.demo {
		padding: 2rem;
		max-width: 600px;
	}

	h2 {
		margin-top: 0;
	}

	h3 {
		margin-top: 2rem;
	}

	.buttons {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	button {
		padding: 0.5rem 1rem;
		background: hsl(210, 80%, 50%);
		color: white;
		border: none;
		border-radius: 0.375rem;
		cursor: pointer;
		font-size: 0.875rem;
	}

	button:hover {
		background: hsl(210, 80%, 45%);
	}

	.rich-tooltip {
		text-align: center;
	}

	.rich-tooltip strong {
		display: block;
		margin-bottom: 0.25rem;
	}

	.rich-tooltip p {
		margin: 0;
		font-size: 0.75rem;
		opacity: 0.8;
	}

	pre {
		background: hsl(0, 0%, 95%);
		padding: 1rem;
		border-radius: 0.5rem;
		overflow-x: auto;
		font-size: 0.75rem;
		line-height: 1.5;
	}
</style>
