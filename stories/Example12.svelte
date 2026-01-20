<!--
	Example12.svelte - Dropdown demo (singleton vs. multi-instance)
	
	Demonstrates both patterns:
	1. Singleton dropdown - only one visible at a time
	2. Instance dropdown - multiple can be visible simultaneously
-->
<script lang='ts'>
	import DropdownRoot, { dropdown, type DropdownItem } from './DropdownRoot.svelte'
	import DropdownInstance from './DropdownInstance.svelte'

	const userMenuItems: DropdownItem[] = [
		{ label: 'Profile', icon: '👤', action: () => { /* Handle profile */ } },
		{ label: 'Settings', icon: '⚙️', action: () => { /* Handle settings */ } },
		{ label: 'Sign Out', icon: '🚪', action: () => { /* Handle sign out */ } }
	]

	const notificationsItems: DropdownItem[] = [
		{ label: 'All', action: () => { /* Handle all */ } },
		{ label: 'Mentions', action: () => { /* Handle mentions */ } },
		{ label: 'Muted', action: () => { /* Handle muted */ }, disabled: true }
	]

	// For multi-instance demo
	const fileMenuItems: DropdownItem[] = [
		{ label: 'New', icon: '📄', action: () => { /* Handle new */ } },
		{ label: 'Open...', icon: '📂', action: () => { /* Handle open */ } },
		{ label: 'Save', icon: '💾', action: () => { /* Handle save */ } }
	]

	const editMenuItems: DropdownItem[] = [
		{ label: 'Undo', icon: '↩️', action: () => { /* Handle undo */ } },
		{ label: 'Redo', icon: '↪️', action: () => { /* Handle redo */ } },
		{ label: 'Cut', icon: '✂️', action: () => { /* Handle cut */ } }
	]

	const viewMenuItems: DropdownItem[] = [
		{ label: 'Zoom In', icon: '🔍', action: () => { /* Handle zoom in */ } },
		{ label: 'Zoom Out', icon: '🔍', action: () => { /* Handle zoom out */ } },
		{ label: 'Fullscreen', icon: '⛶', action: () => { /* Handle fullscreen */ } }
	]
</script>

<!-- Singleton root (only one needed) -->
<DropdownRoot />

<div class='demo'>
	<h2>Dropdown Examples</h2>

	<!-- Singleton Pattern -->
	<section>
		<h3>Singleton Pattern</h3>
		<p class='subtitle'>Only one dropdown visible at a time — opening one closes the other</p>

		<div class='button-row'>
			<button class='btn' use:dropdown={userMenuItems}>
				👤 Account
			</button>

			<button class='btn' use:dropdown={notificationsItems}>
				🔔 Notifications
			</button>
		</div>

		<div class='note info'>
			<strong>Use singleton when:</strong> You want mutual exclusivity.
			Common in navigation, user menus, settings panels.
		</div>
	</section>

	<!-- Multi-Instance Pattern -->
	<section>
		<h3>Multi-Instance Pattern</h3>
		<p class='subtitle'>Multiple dropdowns can be open simultaneously — like a menu bar</p>

		<div class='menu-bar'>
			<DropdownInstance items={fileMenuItems}>
				<button class='menu-btn'>File</button>
			</DropdownInstance>

			<DropdownInstance items={editMenuItems}>
				<button class='menu-btn'>Edit</button>
			</DropdownInstance>

			<DropdownInstance items={viewMenuItems}>
				<button class='menu-btn'>View</button>
			</DropdownInstance>
		</div>

		<div class='note warning'>
			<strong>Use multi-instance when:</strong> Each dropdown is independent.
			Common in complex forms, dashboard panels, or when comparing options.
		</div>
	</section>

	<!-- Decision Guide -->
	<section>
		<h3>Pattern Decision Guide</h3>
		<table>
			<thead>
				<tr>
					<th>Scenario</th>
					<th>Pattern</th>
					<th>Rationale</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td>User account menu</td>
					<td><strong>Singleton</strong></td>
					<td>Only one user context at a time</td>
				</tr>
				<tr>
					<td>Tooltip</td>
					<td><strong>Singleton</strong></td>
					<td>Multiple tooltips are noisy</td>
				</tr>
				<tr>
					<td>Context menu</td>
					<td><strong>Singleton</strong></td>
					<td>One action context at a time</td>
				</tr>
				<tr>
					<td>Menu bar (File/Edit/View)</td>
					<td><strong>Multi-instance</strong></td>
					<td>User might keep one open for reference</td>
				</tr>
				<tr>
					<td>Multi-select filters</td>
					<td><strong>Multi-instance</strong></td>
					<td>Compare options across filters</td>
				</tr>
				<tr>
					<td>Toast notifications</td>
					<td><strong>Queue</strong></td>
					<td>Stack multiple messages</td>
				</tr>
			</tbody>
		</table>
	</section>
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

	h3 {
		margin: 1.5rem 0 0.5rem 0;
		font-size: 1.1rem;
		color: hsl(0, 0%, 25%);
	}

	.subtitle {
		color: hsl(0, 0%, 50%);
		margin: 0 0 1rem 0;
		font-size: 0.9rem;
	}

	section {
		margin-bottom: 2rem;
	}

	.button-row {
		display: flex;
		gap: 0.5rem;
	}

	.btn {
		padding: 0.5rem 1rem;
		border: 1px solid hsl(0, 0%, 80%);
		border-radius: 0.375rem;
		background: white;
		cursor: pointer;
		font-size: 0.875rem;
	}

	.btn:hover {
		background: hsl(0, 0%, 95%);
	}

	.menu-bar {
		display: flex;
		gap: 0;
		background: hsl(0, 0%, 95%);
		border-radius: 0.375rem;
		padding: 0.25rem;
		width: fit-content;
	}

	.menu-btn {
		padding: 0.375rem 0.75rem;
		border: none;
		background: transparent;
		cursor: pointer;
		font-size: 0.875rem;
		border-radius: 0.25rem;
	}

	.menu-btn:hover {
		background: white;
	}

	.note {
		margin-top: 1rem;
		padding: 0.75rem 1rem;
		border-radius: 0.5rem;
		font-size: 0.875rem;
	}

	.note.info {
		background: hsl(220, 60%, 96%);
		border-left: 3px solid hsl(220, 60%, 50%);
	}

	.note.warning {
		background: hsl(40, 70%, 96%);
		border-left: 3px solid hsl(40, 70%, 50%);
	}

	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.875rem;
		margin-top: 1rem;
	}

	th, td {
		padding: 0.5rem 0.75rem;
		text-align: left;
		border-bottom: 1px solid hsl(0, 0%, 90%);
	}

	th {
		font-weight: 600;
		color: hsl(0, 0%, 40%);
		background: hsl(0, 0%, 97%);
	}
</style>
