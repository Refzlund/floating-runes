<script lang='ts'>
	import { overlay } from 'floating-runes'
	import { fly, fade } from 'svelte/transition'

	let showModal = $state(false)
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && (showModal = false)} />

<div class='wrapper'>
	<button onclick={() => showModal = true}>
		Open Modal
	</button>

	{#if showModal}
		<div 
			class='overlay' 
			use:overlay
			onclick={() => showModal = false}
			aria-hidden="true"
			transition:fade={{ duration: 150 }}
		></div>
		<dialog 
			open
			aria-modal='true'
			aria-labelledby='modal-title'
			transition:fly={{ y: 20, duration: 200 }}
		>
			<h2 id='modal-title'>Modal with Overlay</h2>
			<p>The body scroll is locked while this modal is open.</p>
			<p>Click the overlay or the button below to close.</p>
			<button onclick={() => showModal = false}>Close</button>
		</dialog>
	{/if}
</div>

<div class='scroll-content'>
	<p>Scroll content below to test scroll locking:</p>
	{#each Array(20) as _, i}
		<p>Line {i + 1} - Try scrolling when the modal is open</p>
	{/each}
</div>


<style>
	.wrapper {
		position: relative;
		padding: 2rem;
	}

	button {
		padding: 0.75rem 1.5rem;
		background: hsl(220, 60%, 50%);
		color: white;
		border: none;
		border-radius: 0.25rem;
		cursor: pointer;
		font-size: 1rem;
		
		&:hover {
			background: hsl(220, 60%, 45%);
		}
	}

	.overlay {
		position: fixed;
		inset: 0;
		background: hsla(0, 0%, 0%, 0.5);
		z-index: 100;
	}

	dialog {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background: white;
		border: none;
		border-radius: 0.5rem;
		padding: 2rem;
		box-shadow: 0 10px 40px hsla(0, 0%, 0%, 0.2);
		z-index: 101;
		max-width: 400px;
		
		h2 {
			margin: 0 0 1rem;
			color: hsl(0, 0%, 20%);
		}
		
		p {
			margin: 0 0 1rem;
			color: hsl(0, 0%, 40%);
		}
		
		button {
			margin-top: 0.5rem;
		}
	}

	.scroll-content {
		padding: 1rem 2rem;
		
		p {
			margin: 0.5rem 0;
			color: hsl(0, 0%, 50%);
		}
	}
</style>
