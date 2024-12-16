# Floating Runes

Svelte 5 Runes powered wrapper for [@floating-ui](https://floating-ui.com). An alternative approach to [svelte-floating-ui](https://github.com/fedorovvvv/svelte-floating-ui) which achieves the same thing.

<br>

**Usage**

1. [Simple example](#usage)
1. [Tethering](#tethering)
1. [Advanced use](#advanced)
1. [Portal action](#bonus)

<br>

**Options and properties**
1. [floatingUI](#floatingui)
1. [use:float](#usefloat)
1. [use:float...](#the-rest)

<br>

### Usage

`bun add floating-runes`

- `use:float` - Designating the floating elements
- `use:float.arrow` - Designated arrow element; must be a direct child element of `use:float`
- `use:float.ref` - The thing the floated element(s) is referencing

[Svelte Playground - Usage example](https://svelte.dev/playground/)

```html
<script>
	import floatingUI, { flip, shift, arrow } from 'floating-runes'

	const float = floatingUI({
		placement: 'top',
		middleware: [
			flip(),
			shift(),
			arrow()
        ]
	})
</script>

<div>
	<tooltip use:float>
		<arrow use:float.arrow></arrow>
	</tooltip>
	<button use:float.ref> Hover me </button>
</div>
```

> [!TIP]  
> P.S. you can use multiple `use:float` from the same declaration.

<br>

#### Tethering

You can use `float.tether(element)` to float to another element than the `float.ref`. Then use `float.untether()` and it returns to `float.ref`.

[Svelte Playground - Tethering example](https://svelte.dev/playground/)

```html
<script>
	import floatingUI, { flip, shift, arrow } from 'floating-runes'

	let url = '/a' // demo example

	const float = floatingUI({
		placement: 'bottom'
	})
</script>

{#snippet href(ref, text)}
	{#if url === ref}
		<a
			class='active' 
			use:float.ref 
			href={ref} 
			onclick={e => e.preventDefault()}
		> 
			{text}
		</a>
	{:else}
		<a
			onmouseenter={e => float.tether(e.target)}
			href={ref}
			onclick={e => { e.preventDefault(); url = ref; }}
		>
			{text}
		</a>
	{/if}
{/snippet}

<div class='hovered' use:float></div>
<div class='active' use:float={{ tether: false }}></div>

<div onmouseleave={() => float.untether()}>
	{@render href('/a', 'Hover me')}
	{@render href('/b', 'I want attention')}
	{@render href('/c', 'Guys... what about meeEeEe')}
	{@render href('/d', 'Ignore my brother')}
</div>
```

<br>

#### Advanced

As per the documentation of [@floating-ui](https://floating-ui.com/docs/middleware#data),
you can access the `.then(...)` which works in the same way as their documentation.

So you can go wild🦒

```html
<script>
	import floatingUI, { ... } from 'floating-runes'

	const float = floatingUI({
		placement: 'top',
		middleware: [
			...
        ]
	}).then(computedData => {
		const { middlewareData } = computedData
		...
	})
</script>
```

<br>

#### Bonus

As a bonus, you can use `portal` to move an element to another (such as the body).

When the component is destroyed, the element that been moved, will naturally, also get destroyed.

```html
<script>
	import { portal } from 'floating-runes'
</script>

<div use:portal> I'm in the body😏 </div>
<div use:portal={element}> I'm in another element </div>
```

<br>
<br>

### Options

#### floatingUI

#### use:float

#### The rest
