<!--
	DropdownRoot.svelte - Singleton dropdown menu
	
	This is a SINGLETON - only one dropdown at a time.
	For multiple simultaneous dropdowns, see DropdownInstance.svelte.
	
	Usage:
	```svelte
	// +layout.svelte
	<DropdownRoot />
	<slot />
	```
	
	Then anywhere:
	```svelte
	import { dropdown, type DropdownItem } from './DropdownRoot.svelte'
	
	const items: DropdownItem[] = [
		{ label: 'Profile', action: () => goto('/profile') },
		{ label: 'Settings', action: () => goto('/settings') }
	]
	
	<button use:dropdown={items}>Account</button>
	```
-->
<script module lang='ts'>
	import { createSingleton, offset, flip, shift } from 'floating-runes'
	import type { Snippet } from 'svelte'

	export interface DropdownItem {
		label: string
		action: () => void
		icon?: string
		disabled?: boolean
	}

	export type DropdownContent = DropdownItem[] | Snippet

	/**
	 * Singleton dropdown - only one visible at a time.
	 * 
	 * Good for: user menus, settings, navigation dropdowns.
	 * The singleton ensures opening one dropdown closes any other.
	 */
	export const dropdown = createSingleton<DropdownContent>({
		placement: 'bottom-start',
		strategy: 'fixed',  // Fixed positioning for portal to body
		middleware: [
			offset(4),
			flip({ padding: 8 }),
			shift({ padding: 8 })
		],
		showOn: ['click'],
		hideOn: ['clickOutside', 'escape']
	})
</script>

<script lang='ts'>
	import { portal } from 'floating-runes'

	function handleItemClick(item: DropdownItem) {
		if (item.disabled) return
		item.action()
		dropdown.hide()
	}
</script>

{#if dropdown.visible && dropdown.content !== undefined}
	<div class='dropdown' use:dropdown.float use:portal role='menu'>
		{#if Array.isArray(dropdown.content)}
			{#each dropdown.content as item}
				<button
					class='dropdown-item'
					class:disabled={item.disabled}
					onclick={() => handleItemClick(item)}
					disabled={item.disabled}
				>
					{#if item.icon}
						<span class='icon'>{item.icon}</span>
					{/if}
					{item.label}
				</button>
			{/each}
		{:else}
			{@render dropdown.content()}
		{/if}
	</div>
{/if}

<style>
	.dropdown {
		background: white;
		border: 1px solid hsl(0, 0%, 85%);
		border-radius: 0.5rem;
		box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
		min-width: 180px;
		padding: 0.25rem;
		z-index: 1000;
	}

	.dropdown-item {
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

	.dropdown-item:hover:not(.disabled) {
		background: hsl(0, 0%, 95%);
	}

	.dropdown-item.disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.icon {
		font-size: 1rem;
	}
</style>
