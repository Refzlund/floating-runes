<!--
	Example11.svelte - Toast notification demo
	
	Demonstrates multi-instance toasts (NOT a singleton pattern).
-->
<script lang='ts'>
	import ToastRoot from './ToastRoot.svelte'
	import { toast } from './toastState.svelte.js'
</script>

<!-- Include toast root once -->
<ToastRoot />

<div class='demo'>
	<h2>Toast Notifications</h2>
	<p class='subtitle'>Click buttons to trigger different toast types</p>

	<div class='grid'>
		<button class='btn info' onclick={() => toast.info('This is an informational message')}>
			Info Toast
		</button>

		<button class='btn success' onclick={() => toast.success('Operation completed successfully!')}>
			Success Toast
		</button>

		<button class='btn warning' onclick={() => toast.warning('Please save your changes')}>
			Warning Toast
		</button>

		<button class='btn error' onclick={() => toast.error('Something went wrong')}>
			Error Toast
		</button>

		<button class='btn custom' onclick={() => toast('Custom duration (10s)', { duration: 10000 })}>
			Long Duration
		</button>

		<button class='btn custom' onclick={() => toast('Persistent toast', { duration: 0 })}>
			Persistent (no auto-dismiss)
		</button>

		<button class='btn dismiss' onclick={() => toast.dismissAll()}>
			Dismiss All
		</button>
	</div>

	<div class='note'>
		<strong>Key Points:</strong>
		<ul>
			<li><strong>NOT a singleton</strong> — toasts STACK, multiple visible</li>
			<li>Queue-based pattern with auto-dismiss</li>
			<li>Each toast has its own timer</li>
			<li>Programmatic API: toast.success(), toast.error(), etc.</li>
			<li>Duration = 0 for persistent toasts</li>
		</ul>
	</div>

	<div class='comparison'>
		<h3>Pattern Comparison</h3>
		<table>
			<thead>
				<tr>
					<th>Pattern</th>
					<th>Use Case</th>
					<th>Behavior</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td><strong>Singleton</strong></td>
					<td>Tooltips, Context Menus</td>
					<td>One at a time, new replaces old</td>
				</tr>
				<tr>
					<td><strong>Queue/Stack</strong></td>
					<td>Toasts, Notifications</td>
					<td>Multiple concurrent, stacked</td>
				</tr>
			</tbody>
		</table>
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

	h3 {
		margin: 0 0 0.75rem 0;
		font-size: 1rem;
		color: hsl(0, 0%, 30%);
	}

	.subtitle {
		color: hsl(0, 0%, 50%);
		margin-top: 0.5rem;
	}

	.grid {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-top: 1.5rem;
	}

	.btn {
		padding: 0.5rem 1rem;
		border: none;
		border-radius: 0.375rem;
		font-weight: 500;
		cursor: pointer;
		transition: opacity 0.15s ease;
	}

	.btn:hover {
		opacity: 0.9;
	}

	.btn.info {
		background: hsl(220, 80%, 50%);
		color: white;
	}

	.btn.success {
		background: hsl(140, 70%, 40%);
		color: white;
	}

	.btn.warning {
		background: hsl(40, 90%, 50%);
		color: hsl(40, 90%, 15%);
	}

	.btn.error {
		background: hsl(0, 80%, 50%);
		color: white;
	}

	.btn.custom {
		background: hsl(270, 60%, 50%);
		color: white;
	}

	.btn.dismiss {
		background: hsl(0, 0%, 90%);
		color: hsl(0, 0%, 30%);
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

	.comparison {
		margin-top: 1.5rem;
		padding: 1rem;
		background: hsl(40, 50%, 96%);
		border-radius: 0.5rem;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.875rem;
	}

	th, td {
		padding: 0.5rem;
		text-align: left;
		border-bottom: 1px solid hsl(0, 0%, 85%);
	}

	th {
		font-weight: 600;
		color: hsl(0, 0%, 40%);
	}
</style>
