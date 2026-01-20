# Examples

## Basic Tooltip

```svelte
<script lang='ts'>
	import floatingUI, { offset, flip, shift } from 'floating-runes'
	
	const float = floatingUI({ 
		placement: 'top',
		middleware: [offset(6), flip(), shift()] 
	})
	let show = $state(false)
</script>

<button 
	use:float.ref 
	onmouseenter={() => show = true} 
	onmouseleave={() => show = false}
>
	Hover me
</button>

{#if show}
	<div use:float role="tooltip">I'm a tooltip!</div>
{/if}
```

## Tooltip with Arrow

```svelte
<script lang='ts'>
	import floatingUI, { offset, flip, shift, arrow } from 'floating-runes'
	
	const float = floatingUI({ 
		placement: 'top',
		middleware: [offset(8), flip(), shift(), arrow()] 
	})
	let show = $state(false)
</script>

<button 
	use:float.ref 
	onmouseenter={() => show = true} 
	onmouseleave={() => show = false}
>
	Hover me
</button>

{#if show}
	<div use:float role="tooltip" class="tooltip">
		Tooltip with arrow
		<div use:float.arrow class="arrow"></div>
	</div>
{/if}

<style>
	.tooltip {
		background: #333;
		color: white;
		padding: 0.5rem 1rem;
		border-radius: 4px;
	}
	.arrow {
		width: 8px;
		height: 8px;
		background: #333;
		transform: rotate(var(--float-rotation, 45deg));
	}
</style>
```

## Cursor-Following Tooltip

```svelte
<script lang='ts'>
	import floatingUI, { offset } from 'floating-runes'
	
	const float = floatingUI({ 
		strategy: 'fixed',
		placement: 'right-start',
		middleware: [offset({ mainAxis: 10, crossAxis: 10 })] 
	})
	let show = $state(false)
</script>

<div 
	class="hover-area"
	use:float.virtual={'pointermove'} 
	use:float.unvirtual={'pointerleave'}
	onpointerenter={() => show = true} 
	onpointerleave={() => show = false}
>
	Move your cursor here
</div>

{#if show}
	<div use:float class="cursor-tooltip">Following cursor!</div>
{/if}
```

## Navigation Bar with Tethered Highlights

This pattern uses **both** `ref` and `tether` to show:
- A persistent "active" indicator on the current page
- A temporary "hover" indicator that follows the mouse

```svelte
<script lang='ts'>
	import floatingUI from 'floating-runes'
	import { fade } from 'svelte/transition'

	const float = floatingUI()
	let currentUrl = $state('/')
</script>

{#snippet navLink(href: string, label: string)}
	<a
		class:active={currentUrl === href}
		use:float.tether={'mouseenter'}
		use:float.ref={() => currentUrl === href}
		{href}
		onclick|preventDefault={() => currentUrl = href}
	>
		{label}
	</a>
{/snippet}

<nav use:float.untether={'pointerleave'}>
	<!-- Hover highlight: follows tethered element -->
	{#if float.tethered}
		<div
			class="highlight hover"
			style:width="{float.attached?.offsetWidth}px"
			style:height="{float.attached?.offsetHeight}px"
			use:float={{ untether: false }}
			in:fade={{ duration: 100 }}
			out:fade={{ duration: 100 }}
		></div>
	{/if}
	
	<!-- Active indicator: follows referenced element -->
	{#if float.referenced}
		<div
			class="highlight active"
			style:width="{float.referenced.offsetWidth}px"
			use:float={{ tether: false }}
		></div>
	{/if}

	{@render navLink('/', 'Home')}
	{@render navLink('/about', 'About')}
	{@render navLink('/contact', 'Contact')}
</nav>

<style>
	nav {
		position: relative;
		display: inline-flex;
		gap: 0.5rem;
	}
	
	.highlight {
		position: absolute;
		pointer-events: none;
		border-radius: 4px;
		transition: left 0.1s ease, width 0.2s ease;
	}
	
	.highlight.hover {
		background: rgba(255, 255, 255, 0.1);
	}
	
	.highlight.active {
		background: white;
		height: 2px;
		transform: translateY(100%);
	}
</style>
```

**Key concepts:**
- `use:float.tether={'mouseenter'}` — temporarily attach on hover
- `use:float.ref={() => condition}` — persistently attach when condition is true
- `use:float.untether={'pointerleave'}` — on container, clears tether when pointer leaves
- `use:float={{ untether: false }}` — this float ignores untether, sticks to last hovered
- `use:float={{ tether: false }}` — this float ignores tether, only follows ref

## Dropdown Menu

```svelte
<script lang='ts'>
	import floatingUI, { offset, flip, shift } from 'floating-runes'
	import { portal } from 'floating-runes'
	
	const float = floatingUI({ 
		placement: 'bottom-start',
		middleware: [offset(4), flip(), shift({ padding: 8 })] 
	})
	let open = $state(false)
	
	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') open = false
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<button 
	use:float.ref 
	onclick={() => open = !open}
	aria-haspopup="menu"
	aria-expanded={open}
>
	Open Menu
</button>

{#if open}
	<div use:float use:portal role="menu" class="dropdown">
		<button role="menuitem" onclick={() => open = false}>Option 1</button>
		<button role="menuitem" onclick={() => open = false}>Option 2</button>
		<button role="menuitem" onclick={() => open = false}>Option 3</button>
	</div>
{/if}
```

## Context Menu

```svelte
<script lang='ts'>
	import floatingUI, { offset, flip, shift } from 'floating-runes'
	import { portal } from 'floating-runes'
	
	const float = floatingUI({ 
		strategy: 'fixed',
		placement: 'right-start',
		middleware: [offset(2), flip(), shift({ padding: 8 })] 
	})
	let open = $state(false)
	
	function handleContextMenu(e: MouseEvent) {
		e.preventDefault()
		float.virtual({ getBoundingClientRect: () => ({
			width: 0, height: 0,
			x: e.clientX, y: e.clientY,
			top: e.clientY, left: e.clientX,
			right: e.clientX, bottom: e.clientY
		})})
		open = true
	}
	
	function close() {
		open = false
		float.unvirtual()
	}
</script>

<svelte:window onclick={close} onkeydown={e => e.key === 'Escape' && close()} />

<div class="context-area" oncontextmenu={handleContextMenu}>
	Right-click anywhere
</div>

{#if open}
	<div use:float use:portal role="menu" class="context-menu">
		<button role="menuitem">Cut</button>
		<button role="menuitem">Copy</button>
		<button role="menuitem">Paste</button>
	</div>
{/if}
```

## Modal with Overlay

```svelte
<script lang='ts'>
	import { overlay, portal } from 'floating-runes'
	
	let open = $state(false)
	
	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') open = false
	}
</script>

<button onclick={() => open = true}>Open Modal</button>

{#if open}
	<div 
		class="backdrop" 
		use:overlay 
		onclick={() => open = false}
		onkeydown={handleKeydown}
	></div>
	
	<div use:portal class="modal" role="dialog" aria-modal="true">
		<h2>Modal Title</h2>
		<p>Modal content goes here.</p>
		<button onclick={() => open = false}>Close</button>
	</div>
{/if}

<style>
	.backdrop {
		background: rgba(0, 0, 0, 0.5);
	}
	
	.modal {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background: white;
		padding: 2rem;
		border-radius: 8px;
		z-index: 1000;
	}
</style>
```

## Singleton Tooltip (Global)

Define once, use everywhere:

```svelte
<!-- TooltipProvider.svelte -->
<script module lang='ts'>
	import { createSingleton, offset, flip, shift, arrow } from 'floating-runes'
	
	export const tooltip = createSingleton({
		placement: 'top',
		middleware: [offset(8), flip(), shift(), arrow()],
		showDelay: 200,
		hideDelay: 0
	})
</script>

<script lang='ts'>
	import { portal } from 'floating-runes'
</script>

{#if tooltip.visible && tooltip.content}
	<div use:tooltip.float use:portal class="tooltip" role="tooltip">
		{#if typeof tooltip.content === 'string'}
			{tooltip.content}
		{:else}
			{@render tooltip.content()}
		{/if}
		<div use:tooltip.arrow class="arrow"></div>
	</div>
{/if}
```

Use anywhere in your app:

```svelte
<script lang='ts'>
	import { tooltip } from './TooltipProvider.svelte'
</script>

<button use:tooltip={'Save your changes'}>Save</button>
<button use:tooltip={'Discard changes'}>Cancel</button>
```

## Reactive Placement Styling

Use `float.placement` to style based on computed position:

```svelte
<script lang='ts'>
	import floatingUI, { offset, flip, shift, arrow } from 'floating-runes'
	
	const float = floatingUI({ 
		placement: 'top',
		middleware: [offset(8), flip(), shift(), arrow()] 
	})
	let show = $state(false)
</script>

<button use:float.ref onmouseenter={() => show = true} onmouseleave={() => show = false}>
	Hover me
</button>

{#if show}
	<div 
		use:float 
		class="tooltip"
		data-placement={float.placement}
	>
		I flip and shift!
		<div use:float.arrow class="arrow"></div>
	</div>
{/if}

<style>
	.tooltip[data-placement^='top'] .arrow {
		bottom: -4px;
	}
	.tooltip[data-placement^='bottom'] .arrow {
		top: -4px;
	}
</style>
```

## Using `.then()` for Custom Logic

For advanced positioning or side effects:

```svelte
<script lang='ts'>
	import floatingUI, { offset, flip, shift } from 'floating-runes'
	
	let arrowRotation = $state('0deg')
	
	const float = floatingUI({ 
		middleware: [offset(8), flip(), shift()] 
	}).then((computed) => {
		// Custom logic after each position update
		const side = computed.placement.split('-')[0]
		arrowRotation = { top: '180deg', bottom: '0deg', left: '90deg', right: '270deg' }[side] ?? '0deg'
	})
</script>
```

## Overlay with Custom Options

The overlay action supports options:

```svelte
<script lang='ts'>
	import { overlay } from 'floating-runes'
	let open = $state(false)
</script>

<!-- Default: locks scroll -->
<div use:overlay onclick={() => open = false}></div>

<!-- Disable scroll lock -->
<div use:overlay={{ lockScroll: false }} onclick={() => open = false}></div>
```

## Portal to Custom Target

By default, portal appends to `document.body`. You can specify a custom target:

```svelte
<script lang='ts'>
	import { portal } from 'floating-runes'
	let container: HTMLElement
</script>

<div bind:this={container} class="custom-portal-target"></div>

{#if open}
	<div use:portal={container}>Portaled to custom container</div>
{/if}
```
