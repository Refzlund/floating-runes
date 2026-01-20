<!--
	TooltipRoot.svelte - Example singleton tooltip component
	
	Place this once in your app layout, then import `tooltip` anywhere to trigger.
	
	Usage:
	```svelte
	// +layout.svelte
	<script>
		import TooltipRoot from '$lib/TooltipRoot.svelte'
	</script>
	
	<TooltipRoot />
	<slot />
	```
	
	Then anywhere:
	```svelte
	<script>
		import { tooltip } from '$lib/TooltipRoot.svelte'
	</script>
	
	<button use:tooltip={'Save changes'}>Save</button>
	```
-->
<script module lang='ts'>
	import { createSingleton, offset, flip, shift, arrow } from 'floating-runes'
	import type { Snippet } from 'svelte'

	/** 
	 * The singleton tooltip - import this anywhere to attach tooltips.
	 * 
	 * @example
	 * ```svelte
	 * import { tooltip } from './TooltipRoot.svelte'
	 * 
	 * <button use:tooltip={'Hello!'}>Hover me</button>
	 * <button use:tooltip={mySnippet}>With snippet</button>
	 * ```
	 */
	export const tooltip = createSingleton<string | Snippet>({
		placement: 'top',
		strategy: 'fixed',  // Fixed positioning for portal to body
		middleware: [
			offset(8),
			flip({ padding: 8 }),
			shift({ padding: 8 }),
			arrow()
		],
		showDelay: 200,
		hideDelay: 0
	})
</script>

<script lang='ts'>
	import { portal } from 'floating-runes'
</script>

{#if tooltip.visible && tooltip.content !== undefined}
	<div class='tooltip-container' use:tooltip.float use:portal>
		<div class='tooltip'>
			{#if typeof tooltip.content === 'string'}
				{tooltip.content}
			{:else}
				{@render tooltip.content()}
			{/if}
		</div>
		<div class='tooltip-arrow' use:tooltip.arrow></div>
	</div>
{/if}

<style>
	.tooltip-container {
		z-index: 9999;
		pointer-events: none;
	}

	.tooltip {
		background-color: hsl(0, 0%, 15%);
		color: white;
		padding: 0.5rem 0.75rem;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		line-height: 1.25rem;
		max-width: 20rem;
		box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
	}

	.tooltip-arrow {
		width: 8px;
		height: 8px;
		background-color: hsl(0, 0%, 15%);
		transform: rotate(var(--float-rotation, 45deg));
	}
</style>
