<!--
	DropdownInstance.svelte - Multi-instance dropdown component
	
	Unlike DropdownRoot (singleton), this is an INSTANCE component.
	Each usage creates an independent dropdown with its own state.
	Multiple can be open simultaneously.
	
	Usage:
	```svelte
	<DropdownInstance items={fileMenuItems}>
		<button>File</button>
	</DropdownInstance>
	
	<DropdownInstance items={editMenuItems}>
		<button>Edit</button>
	</DropdownInstance>
	```
-->
<script lang='ts'>
	import floatingUI, { offset, flip, shift, portal } from 'floating-runes'
	import type { Snippet } from 'svelte'

	export interface DropdownItem {
		label: string
		action: () => void
		icon?: string
		disabled?: boolean
	}

	interface Props {
		items: DropdownItem[]
		placement?: 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end'
		children: Snippet
	}

	let { items, placement = 'bottom-start', children }: Props = $props()

	// Each instance has its own floating state
	const floating = floatingUI({
		placement,
		strategy: 'fixed',  // Fixed positioning for portal to body
		middleware: [
			offset(4),
			flip({ padding: 8 }),
			shift({ padding: 8 })
		]
	})

	let visible = $state(false)

	function toggle() {
		visible = !visible
	}

	function handleClickOutside(e: MouseEvent) {
		if (!visible) return
		const target = e.target as HTMLElement
		if (!target.closest('.dropdown-instance')) {
			visible = false
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			visible = false
		}
	}

	function handleItemClick(item: DropdownItem) {
		if (item.disabled) return
		item.action()
		visible = false
	}
</script>

<svelte:window onclick={handleClickOutside} onkeydown={handleKeydown} />

<span class='dropdown-instance'>
	<span use:floating.ref onclick={toggle}>
		{@render children()}
	</span>

	{#if visible}
		<div class='dropdown' use:floating use:portal>
			{#each items as item}
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
		</div>
	{/if}
</span>

<style>
	.dropdown-instance {
		display: inline-block;
	}

	.dropdown {
		background: white;
		border: 1px solid hsl(0, 0%, 85%);
		border-radius: 0.5rem;
		box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
		min-width: 140px;
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
