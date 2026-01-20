<!--
	ContextMenuRoot.svelte - Example singleton context menu
	
	Place this once in your app layout. Right-click triggers use programmatic show().
	
	Usage:
	```svelte
	// +layout.svelte
	<ContextMenuRoot />
	<slot />
	```
	
	Then anywhere:
	```svelte
	import { contextMenu, type MenuItem } from './ContextMenuRoot.svelte'
	
	const items: MenuItem[] = [
		{ label: 'Edit', action: () => edit() },
		{ label: 'Delete', action: () => delete(), danger: true }
	]
	
	<div oncontextmenu={(e) => contextMenu.open(e, items)}>
		Right-click me
	</div>
	```
-->
<script module lang='ts'>
	import { createSingleton, offset, flip, shift } from 'floating-runes'
	import type { Snippet } from 'svelte'

	export interface MenuItem {
		label: string
		action: () => void
		icon?: string
		danger?: boolean
		disabled?: boolean
	}

	export type ContextMenuContent = MenuItem[] | Snippet

	/**
	 * Singleton context menu.
	 * 
	 * Use contextMenu.open(event, items) to show at mouse position.
	 */
	export const contextMenu = Object.assign(
		createSingleton<ContextMenuContent>({
			placement: 'bottom-start',
			strategy: 'fixed',  // Fixed positioning for portal to body
			middleware: [
				offset(4),
				flip({ padding: 8 }),
				shift({ padding: 8 })
			],
			showOn: [],  // Programmatic only - no auto-show events
			hideOn: []   // We handle hide manually
		}),
		{
			/**
			 * Open context menu at mouse position.
			 * @example oncontextmenu={(e) => contextMenu.open(e, items)}
			 */
			open(event: MouseEvent, content: ContextMenuContent) {
				event.preventDefault()
				contextMenu.show(content, { x: event.clientX, y: event.clientY })
			}
		}
	)
</script>

<script lang='ts'>
	import { portal } from 'floating-runes'

	function handleClickOutside(e: MouseEvent) {
		// Close if clicking outside the menu
		const target = e.target as HTMLElement
		if (!target.closest('.context-menu')) {
			contextMenu.hide()
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			contextMenu.hide()
		}
	}

	function handleItemClick(item: MenuItem) {
		if (item.disabled) return
		item.action()
		contextMenu.hide()
	}
</script>

<svelte:window onclick={handleClickOutside} onkeydown={handleKeydown} />

{#if contextMenu.visible && contextMenu.content !== undefined}
	<div class='context-menu' use:contextMenu.float use:portal role='menu'>
		{#if Array.isArray(contextMenu.content)}
			{#each contextMenu.content as item}
				<button
					type='button'
					class='menu-item'
					class:danger={item.danger}
					class:disabled={item.disabled}
					onclick={() => handleItemClick(item)}
					disabled={item.disabled}
					role='menuitem'
				>
					{#if item.icon}
						<span class='icon'>{item.icon}</span>
					{/if}
					{item.label}
				</button>
			{/each}
		{:else}
			{@render contextMenu.content()}
		{/if}
	</div>
{/if}

<style>
	.context-menu {
		background: white;
		border: 1px solid hsl(0, 0%, 85%);
		border-radius: 0.5rem;
		box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
		min-width: 160px;
		padding: 0.25rem;
		z-index: 9999;
	}

	.menu-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
		padding: 0.5rem 0.75rem;
		border: none;
		background: none;
		text-align: left;
		font-size: 0.875rem;
		border-radius: 0.375rem;
		cursor: pointer;
		color: hsl(0, 0%, 20%);
	}

	.menu-item:hover:not(.disabled) {
		background: hsl(0, 0%, 95%);
	}

	.menu-item.danger {
		color: hsl(0, 70%, 50%);
	}

	.menu-item.danger:hover:not(.disabled) {
		background: hsl(0, 70%, 95%);
	}

	.menu-item.disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.icon {
		font-size: 1rem;
	}
</style>
