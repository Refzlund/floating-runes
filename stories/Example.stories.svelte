<script lang='ts' module>

	import { defineMeta } from '@storybook/addon-svelte-csf'

	const { Story } = defineMeta({
		title: 'Examples'
	})

	import Example1 from './Example1.svelte'
	import Example2 from './Example2.svelte'
	import Example3 from './Example3.svelte'
	import Example4 from './Example4.svelte'
	
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

<!---------------------------------------------------->