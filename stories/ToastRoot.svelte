<!--
	ToastRoot.svelte - Multi-instance toast notifications
	
	NOT a singleton — toasts stack! Uses createSingleton's pattern but extends it.
	
	Usage:
	```svelte
	// +layout.svelte
	<ToastRoot />
	<slot />
	```
	
	Then anywhere:
	```svelte
	import { toast } from './toastState.svelte'
	
	toast.success('Saved successfully!')
	toast.error('Something went wrong')
	toast.info('Tip: Press Ctrl+S to save')
	toast('Custom message', { duration: 5000 })
	```
-->
<script module lang='ts'>
	// Re-export for convenience
	export { toast, type Toast, type ToastType, type ToastOptions } from './toastState.svelte.js'
</script>

<script lang='ts'>
	import { portal } from 'floating-runes'
	import { toast } from './toastState.svelte.js'
</script>

{#if toast.items.length > 0}
	<div class='toast-container' use:portal>
		{#each toast.items as t (t.id)}
			<div class='toast {t.type}' role={t.type === 'error' || t.type === 'warning' ? 'alert' : 'status'} aria-live={t.type === 'error' || t.type === 'warning' ? 'assertive' : 'polite'}>
				<span class='icon'>
					{#if t.type === 'success'}✓
					{:else if t.type === 'error'}✕
					{:else if t.type === 'warning'}⚠
					{:else}ℹ
					{/if}
				</span>
				<span class='message'>{t.message}</span>
				<button class='dismiss' onclick={() => toast.dismiss(t.id)} aria-label='Dismiss'>
					✕
				</button>
			</div>
		{/each}
	</div>
{/if}

<style>
	.toast-container {
		position: fixed;
		bottom: 1rem;
		right: 1rem;
		display: flex;
		flex-direction: column-reverse;
		gap: 0.5rem;
		z-index: 9999;
		max-width: 360px;
	}

	.toast {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		border-radius: 0.5rem;
		background: white;
		box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
		animation: slide-in 0.2s ease-out;
	}

	@keyframes slide-in {
		from {
			transform: translateX(100%);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}

	.icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.5rem;
		height: 1.5rem;
		border-radius: 50%;
		font-size: 0.75rem;
		font-weight: bold;
	}

	.toast.info .icon {
		background: hsl(220, 80%, 90%);
		color: hsl(220, 80%, 40%);
	}

	.toast.success .icon {
		background: hsl(140, 70%, 90%);
		color: hsl(140, 70%, 30%);
	}

	.toast.error .icon {
		background: hsl(0, 80%, 90%);
		color: hsl(0, 80%, 40%);
	}

	.toast.warning .icon {
		background: hsl(40, 90%, 90%);
		color: hsl(40, 90%, 30%);
	}

	.message {
		flex: 1;
		font-size: 0.875rem;
		color: hsl(0, 0%, 20%);
	}

	.dismiss {
		padding: 0.25rem;
		border: none;
		background: none;
		color: hsl(0, 0%, 60%);
		cursor: pointer;
		font-size: 0.75rem;
		line-height: 1;
	}

	.dismiss:hover {
		color: hsl(0, 0%, 30%);
	}
</style>
