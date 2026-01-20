<!--
	Example10.svelte - Context menu demo
	
	Demonstrates right-click context menus using singleton pattern.
-->
<script lang='ts'>
	import ContextMenuRoot, { contextMenu, type MenuItem } from './ContextMenuRoot.svelte'

	const fileItems: MenuItem[] = [
		{ label: 'Open', icon: '📂', action: () => { /* Handle open */ } },
		{ label: 'Rename', icon: '✏️', action: () => { /* Handle rename */ } },
		{ label: 'Download', icon: '⬇️', action: () => { /* Handle download */ } },
		{ label: 'Delete', icon: '🗑️', action: () => { /* Handle delete */ }, danger: true }
	]

	const imageItems: MenuItem[] = [
		{ label: 'View Full Size', icon: '🔍', action: () => { /* Handle view */ } },
		{ label: 'Copy', icon: '📋', action: () => { /* Handle copy */ } },
		{ label: 'Save As...', icon: '💾', action: () => { /* Handle save */ } },
		{ label: 'Share', icon: '🔗', action: () => { /* Handle share */ }, disabled: true }
	]

	const textItems: MenuItem[] = [
		{ label: 'Cut', icon: '✂️', action: () => { /* Handle cut */ } },
		{ label: 'Copy', icon: '📋', action: () => { /* Handle copy */ } },
		{ label: 'Paste', icon: '📄', action: () => { /* Handle paste */ } }
	]
</script>

<!-- Include singleton root once -->
<ContextMenuRoot />

<div class='demo'>
	<h2>Context Menu Examples</h2>
	<p class='subtitle'>Right-click on different elements to see contextual menus</p>

	<div class='grid'>
		<div
			class='item file'
			role='button'
			tabindex='0'
			oncontextmenu={(e) => contextMenu.open(e, fileItems)}
		>
			<span class='icon'>📄</span>
			<span>document.pdf</span>
		</div>

		<div
			class='item image'
			role='button'
			tabindex='0'
			oncontextmenu={(e) => contextMenu.open(e, imageItems)}
		>
			<span class='icon'>🖼️</span>
			<span>photo.jpg</span>
		</div>

		<div
			class='item text'
			role='button'
			tabindex='0'
			oncontextmenu={(e) => contextMenu.open(e, textItems)}
		>
			<span class='icon'>📝</span>
			<span>Selected text area</span>
		</div>
	</div>

	<div class='note'>
		<strong>Key Points:</strong>
		<ul>
			<li>Singleton pattern — only one menu at a time</li>
			<li>Menu appears at cursor position using virtual element</li>
			<li>Closes on click outside or Escape key</li>
			<li>Different menu items per element type</li>
		</ul>
	</div>
</div>

<style>
	.demo {
		font-family: system-ui, sans-serif;
		padding: 2rem;
	}

	h2 {
		margin: 0;
		color: hsl(0, 0%, 20%);
	}

	.subtitle {
		color: hsl(0, 0%, 50%);
		margin-top: 0.5rem;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
		margin-top: 1.5rem;
	}

	.item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1rem;
		border: 1px solid hsl(0, 0%, 85%);
		border-radius: 0.5rem;
		cursor: context-menu;
		transition: all 0.15s ease;
	}

	.item:hover {
		border-color: hsl(220, 80%, 60%);
		background: hsl(220, 80%, 98%);
	}

	.item .icon {
		font-size: 1.5rem;
	}

	.note {
		margin-top: 2rem;
		padding: 1rem;
		background: hsl(220, 30%, 96%);
		border-radius: 0.5rem;
		font-size: 0.875rem;
	}

	.note ul {
		margin: 0.5rem 0 0 0;
		padding-left: 1.25rem;
	}

	.note li {
		margin-top: 0.25rem;
	}
</style>
