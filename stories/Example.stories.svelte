<script lang='ts' module>

	import { defineMeta } from '@storybook/addon-svelte-csf'

	const { Story } = defineMeta({
		title: 'Examples'
	})

	import Example1 from './Example1.svelte'
	import Example2 from './Example2.svelte'
	import Example3 from './Example3.svelte'
	import Example4 from './Example4.svelte'
	import Example5 from './Example5.svelte'
	import Example6 from './Example6.svelte'
	import Example7 from './Example7.svelte'
	import Example8 from './Example8.svelte'
	import Example9 from './Example9.svelte'
	import Example10 from './Example10.svelte'
	import Example11 from './Example11.svelte'
	import Example12 from './Example12.svelte'
	
</script>

<Story name='Example'>
	{#snippet template(args)}
		<Example1 {...args} />
	{/snippet}
</Story>

<Story name='Example2'>
	{#snippet template()}
		<Example2/>
	{/snippet}
</Story>

<Story name='Example3'>
	{#snippet template()}
		<Example3/>
	{/snippet}
</Story>

<Story name='Example4'>
	{#snippet template()}
		<Example4/>
	{/snippet}
</Story>

<Story name='Virtual Elements'>
	{#snippet template()}
		<Example5/>
	{/snippet}
</Story>

<Story name='Overlay with Scroll Lock'>
	{#snippet template()}
		<Example6/>
	{/snippet}
</Story>

<Story name='Reactive Virtual Getter'>
	{#snippet template()}
		<Example7/>
	{/snippet}
</Story>

<Story name='Arrow CSS Vars & Reactive Placement'>
	{#snippet template()}
		<Example8/>
	{/snippet}
</Story>

<Story name='Singleton Tooltip'>
	{#snippet template()}
		<Example9/>
	{/snippet}
</Story>

<Story name='Context Menu'>
	{#snippet template()}
		<Example10/>
	{/snippet}
</Story>

<Story name='Toast Notifications'>
	{#snippet template()}
		<Example11/>
	{/snippet}
</Story>

<Story name='Dropdown (Singleton vs Multi)'>
	{#snippet template()}
		<Example12/>
	{/snippet}
</Story>

<!---------------------------------------------------->