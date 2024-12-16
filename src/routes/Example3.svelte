<script lang='ts'>
	import floatingUI from 'floating-runes'
	import { fade } from 'svelte/transition'

	const float = floatingUI({
		placement: 'left'
	})

	let url = $state('/')

</script>

{#snippet href(ref: string, text: string)}
	{#if url === ref}
		<a
			class='active'
			onmouseenter={e => float.tether(e.target as HTMLElement)}
			use:float.ref
			href={ref} 
			onclick={e => e.preventDefault()}
		>
			{text}
		</a>
	{:else}
		<a
			onmouseenter={e => float.tether(e.target as HTMLElement)}
			href={ref}
			onclick={e => { e.preventDefault(); url = ref; }}
		>
			{text}
		</a>
	{/if}
{/snippet}


<div class='wrapper'>
	
	<div class="nav">
		<div role='list' onmouseleave={() => float.untether()}>
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
				transform: translateX(100%);
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
				height: 2px;
				top: 37px !important;
				opacity: 1;
			}
		}
	}

	a {
		color: hsl(0, 0%, 55%);
		text-decoration: none;
		transition: .15s ease;

		&.active, &:hover {
			color: white;
		}
	}

</style>