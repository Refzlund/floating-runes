---
name: floating-runes
description: Guidance for using the floating-runes Svelte 5 wrapper around @floating-ui. Use when building tooltips, popovers, context menus, overlays, portals, or singleton floating UI in Svelte apps.
---

# Floating Runes Agent Skill

## When to use
Use this skill when working with floating UI patterns in Svelte 5: tooltips, dropdowns, context menus, toasts, overlays, portals, singleton patterns, or virtual positioning.

## Core rules (always follow)
- Import **everything** from `floating-runes` (types and runtime). Avoid `@floating-ui/*` imports.
- Prefer Svelte 5 runes and actions (`use:float`, `use:float.ref`, `use:float.virtual`, `use:float.arrow`).
- Keep floating elements in the DOM only when needed (conditional rendering).
- Preserve accessibility: proper roles, keyboard escape handling, and focus behavior.

## Quick navigation
- DOs: [references/DO.md](references/DO.md)
- DONTs: [references/DONT.md](references/DONT.md)
- Examples: [references/EXAMPLES.md](references/EXAMPLES.md)
- Workflows: [references/WORKFLOWS.md](references/WORKFLOWS.md)

## Minimal usage example
```svelte
<script lang='ts'>
	import floatingUI, { flip, shift, offset, type Placement } from 'floating-runes'
	const float = floatingUI({ placement: 'top', middleware: [offset(6), flip(), shift()] })
</script>

<button use:float.ref>Hover me</button>
{#if float.referenced}
	<div use:float role='tooltip'>Tooltip</div>
{/if}
```

## Singleton quickstart
```svelte
<script module lang='ts'>
	import { createSingleton, offset, flip, shift, arrow } from 'floating-runes'
	export const tooltip = createSingleton({
		placement: 'top',
		middleware: [offset(8), flip(), shift(), arrow()],
		showDelay: 200
	})
</script>

<script lang='ts'>
	import { portal } from 'floating-runes'
</script>

{#if tooltip.visible && tooltip.content}
	<div use:tooltip.float use:portal>
		{tooltip.content}
		<div use:tooltip.arrow></div>
	</div>
{/if}
```

Use elsewhere:
```svelte
<script>
	import { tooltip } from './TooltipRoot.svelte'
</script>

<button use:tooltip={'Save'}>Save</button>
```
