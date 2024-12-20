<script lang='ts'>
	import floatingUI from 'floating-runes'
	import { fade } from 'svelte/transition'

	const float = floatingUI()
	let url = $state('/')

</script>

{#snippet href(ref: string, text: string)}
	<a
		class:active={url === ref}
		use:float.tether={'mouseenter'}
		use:float.ref={() => url === ref}
		href={ref} 
		onclickcapture={e => { e.preventDefault(); url = ref; }}
	>
		{text}
	</a>
{/snippet}


<div class='wrapper'>
	
	<div class="nav">
		<div role='list' use:float.untether={'pointerleave'}>
			{#if float.tethered}
				<div
					class='float hovered'
					style='width: {float.attached?.clientWidth}px; height: {float.attached?.offsetHeight}px'
					use:float={{ untether: false }}
					in:fade={{ duration: 100, delay: 1 }}
					out:fade={{ duration: 100 }}
				></div>
			{/if}
			<div class='float active' use:float={{ tether: false }} style='width: {float.referenced?.clientWidth}px;'></div>
			
			{@render href('/', 'Overview')}
			{@render href('/b', 'Integrations')}
			{@render href('/c', 'Activity')}
			{@render href('/d', 'Domains')}
			{@render href('/e', 'Usage')}
		</div>
	</div>

</div>


<style>

	.wrapper {
		position: relative;
		background-color: black;
		padding: 5rem 0rem;

		.nav {
			border-bottom: 1px solid hsl(0, 0%, 30%);
			padding: 0rem 6rem;
			padding-bottom: .5rem;
		}

		.nav > div {
			position: relative;
			display: inline-flex;

			> a {
				padding: .4rem .8rem;
			}
			
			> .float.hovered, > .float.active {
				transform: translateY(-100%);
				pointer-events: none;
				user-select: none;

				transition: left .06s ease, width .2s ease, opacity .3s ease;
				
				background-color: white;
				opacity: .15;
				left: 0px;
				width: 0px;
				border-radius: .25rem;
			}
			> .float.active {
				transform: translateY(6px);
				opacity: 0;
				height: 0px;
				/* we wait so user doesn't seem initial transition */
				animation: wait .5s forwards;
				animation-delay: 1s;
			}
		}
	}

	@keyframes wait {
		0% {}
		50% { opacity: 0; height: 0px; transform: translateY(8px); }
		100% { opacity: 1; height: 2px; transform: translateY(6px); }
	}

	a {
		color: hsl(0, 0%, 55%);
		text-decoration: none;
		transition: .15s ease;

		&.active, &:hover {
			color: hsl(0, 0%, 100%);
			@starting-style {
				color: hsl(0, 0%, 55%);
			}
		}
	}

</style>