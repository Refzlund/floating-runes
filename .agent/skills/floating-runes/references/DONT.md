# DONTs

## Import Mistakes

- **Never import from `@floating-ui/dom` directly** — all types and utilities are re-exported:
  ```ts
  // WRONG
  import { computePosition } from '@floating-ui/dom'
  import type { Placement } from '@floating-ui/dom'
  
  // CORRECT
  import floatingUI, { type Placement } from 'floating-runes'
  ```

## Mounting & Lifecycle

- **Don't keep floating elements always mounted** — render conditionally:
  ```svelte
  // WRONG: Always in DOM
  <div use:float class:hidden={!show}>...</div>
  
  // CORRECT: Conditional rendering
  {#if show}
    <div use:float>...</div>
  {/if}
  ```

- **Don't forget cleanup** — actions handle cleanup automatically, but ensure you don't orphan floating elements by removing the reference before the float.

## Middleware Mistakes

- **Don't use `use:float.arrow` without `arrow()` middleware**:
  ```ts
  // WRONG: Missing arrow middleware
  const float = floatingUI({ middleware: [offset(8), flip()] })
  
  // CORRECT
  const float = floatingUI({ middleware: [offset(8), flip(), shift(), arrow()] })
  ```

- **Don't put `arrow()` before other middleware** — it should be last:
  ```ts
  // WRONG: Arrow first
  middleware: [arrow(), offset(8), flip()]
  
  // CORRECT: Arrow last
  middleware: [offset(8), flip(), shift(), arrow()]
  ```

## Virtual Element Mistakes

- **Don't use `use:float.virtual` without an event trigger**:
  ```svelte
  // WRONG: No event, no coordinates
  <div use:float.virtual>...</div>
  
  // CORRECT: Event-driven
  <div use:float.virtual={'pointermove'}>...</div>
  
  // CORRECT: Reactive getter
  float.virtual(() => ({ x: mouseX, y: mouseY }))
  ```

- **Don't forget `use:float.unvirtual`** when the virtual reference should clear:
  ```svelte
  <div 
    use:float.virtual={'pointermove'} 
    use:float.unvirtual={'pointerleave'}
  >...</div>
  ```

## Tethering Mistakes

- **Don't confuse `ref` and `tether`**:
  - `ref` = persistent anchor (e.g., the currently active nav item)
  - `tether` = temporary hover target (e.g., the item being hovered)

- **Don't put `use:float.untether` on each item** — put it on the container:
  ```svelte
  // WRONG: Untether on each link causes flicker
  {#each links as link}
    <a use:float.tether={'mouseenter'} use:float.untether={'pointerleave'}>...</a>
  {/each}
  
  // CORRECT: Untether on container
  <nav use:float.untether={'pointerleave'}>
    {#each links as link}
      <a use:float.tether={'mouseenter'}>...</a>
    {/each}
  </nav>
  ```

## Stacking Context Mistakes

- **Don't omit `portal`** when floating elements must overlay all content:
  ```svelte
  // May be clipped by parent overflow or z-index
  <div use:float>Menu</div>
  
  // CORRECT: Portaled to body
  <div use:float use:portal>Menu</div>
  ```

## Singleton Mistakes

- **Don't create singletons inside components** — define in `<script module>`:
  ```svelte
  // WRONG: New singleton per component instance
  <script lang='ts'>
    const tooltip = createSingleton()
  </script>
  
  // CORRECT: Module-level, shared singleton
  <script module lang='ts'>
    export const tooltip = createSingleton()
  </script>
  ```

- **Don't forget to render the singleton's floating element** somewhere in your app:
  ```svelte
  {#if tooltip.visible}
    <div use:tooltip.float use:portal>...</div>
  {/if}
  ```

## Styling Mistakes

- **Don't rely on CSS for show/hide logic** — use Svelte's `{#if}` for proper lifecycle.
- **Don't forget `position: absolute` or `position: fixed`** — `autoPosition: true` (default) handles this, but if disabled, you must set it manually.
- **Don't animate `left`/`top` for smooth transitions** — these are set per-frame. Animate width/opacity/transform instead.
