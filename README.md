# Floating Runes

Svelte 5 Runes powered wrapper for [@floating-ui](https://floating-ui.com). An alternative approach to [svelte-floating-ui](https://github.com/fedorovvvv/svelte-floating-ui) which approx. does the same thing.

floating-runes will also:

- Position arrow/floater automatically (unless `autoPosition` is set to `false`)
- Provide access to elements with `$state` for `.attached`, `.tethered`, `.referenced`
- Tethering (temporary element reference)

Other than that, just use it as you would use `@floating-ui`🎉

Happy coding!🦒

<br>

**Usage**

1. [Simple example](#usage)
1. [Tethering](#tethering)
1. [Advanced use](#advanced)
1. [Portal action](#bonus)

<br>

**Options and properties**
1. [floatingUI](#floatingui)
1. [use:float](#floatingui)
1. [float.ref and float.tether](#floatref-and-floattether)
1. [float.untether](#floatuntether)

<br>

### Usage

`bun add floating-runes`

- `use:float` - Designating the floating elements
- `use:float.arrow` - Designated arrow element; must be a direct child element of `use:float`
- `use:float.ref` - The thing the floated element(s) is referencing

[Svelte Playground - Usage example](https://svelte.dev/playground/98b0d71e31a0432fa853e8edefb555bf?version=5.14.0)

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

[Svelte Playground - Tethering example](https://svelte.dev/playground/7fd33cfe7a084f289253c30eb9eb79c2?version=5.14.0)

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

> [!IMPORTANT]  
> As their documentation, remember to place `arrow()`
> after other middlewares.

<br>

#### Bonus

As a bonus, you can use `portal` to move an element to another (such as the body).

When the component is destroyed, the element that was portalled, will naturally, also get destroyed.

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

**FloatingRuneOptions** extends [ComputePositionConfig](https://floating-ui.com/docs/computeposition#options)

| Property | Type | Description |
| --- | --- | --- |
| middleware? | [Middleware](https://floating-ui.com/docs/middleware)[] | Array of middleware objects to modify the positioning or provide data for rendering |
| platform? | [Platform](https://floating-ui.com/docs/platform) | Custom or extended platform object |
| placement? | `\| 'top' `<br>`\| 'top-start' `<br>`\| 'top-end' `<br>`\| 'right' `<br>`\| 'right-start' `<br>`\| 'right-end' `<br>`\| 'bottom' `<br>`\| 'bottom-start' `<br>`\| 'bottom-end' `<br>`\| 'left' `<br>`\| 'left-start' `<br>`\| 'left-end'` | Where to place the floating element relative to its reference element <br>**Default**: `'bottom'` |
| strategy? | `'absolute' \| 'fixed'` | The type of CSS position property to use <br>**Default**: `absolute` |
| autoUpdate? | [AutoUpdateOptions](https://floating-ui.com/docs/autoUpdate#options) | Whether or not to auto-update the floating element's position |
| autoPosition? | `boolean` | Whether or not to auto-position the floating element and the arrow, and auto-assign the `position:` to the strategy (absolute/fixed)<br>**Default**: `true` |

> [!NOTE]  
> The `arrow` middleware does not take an `element` property. Instead apply the Svelte action `use:float.arrow`

Read more about<br><code>const float = floatingUI(...).then((data: <a href='https://floating-ui.com/docs/computeposition#return-value'>ComputePositionReturn</a>) => void)</code>

<br>

#### float

`use:float`

This Svelte action creates a floater, that floats relative to the reference- and tethered element.

`use:float={FloatOptions}`

| Property | Type | Description |
| --- | --- | --- |
| `tether` | `boolean` | Whether-to-tether. <br>**Default**: `true` |
| `untether` | `boolean` | If `false` it will stick to the last tethered target, <br>instead of going back to the reference. <br>**Default**: `true` |

<br>

#### `float.arrow`

`use:float.arrow`

This Svelte action creates reference to the element that serves as the arrow to a `use:float` element. Must be a direct child.

```html
<div use:float>
	...
	<arrow use:float.arrow>...</arrow>
</div>
```

> [!TIP]  
> Remember to include the `arrow` middleware,
> and **put it after other middlewares if needed**.


<br>

#### `float.ref` and `float.tether`

`use:float.ref` and `use:float.tether`

These Svelte actions sets the reference point for the `use:float` element.

Additionally, they accept a trigger parameter: A conditional callback (`() => boolean`) or an event (<code>keyof <a href='https://github.com/Refzlund/floating-runes/blob/main/WindowEventMap.md'>WindowEventMap</a></code>).

Ex.

`use:float.ref={() => url === href}`
<br>or<br>
`use:float.tether={'pointerenter'}`

<br>

#### `float.untether`

`float.untether` removes the tethering, so that the floating element will return to the reference (unless `untether: false` is provided).

It can be used directly: `float.untether()`

Or like `float.ref` and `float.tether` have a condition to trigger;

Ex.

`use:float.untether={() => condition}`
<br>or<br>
`use:float.untether={'pointerleave'}`

<br>
<br>