# DOs

## Imports

- **Import from `floating-runes` only** — both runtime and types are re-exported:
  ```ts
  import floatingUI, { offset, flip, shift, arrow, type Placement, type Middleware } from 'floating-runes'
  ```

## Instance Management

- Create one `floatingUI()` instance per floating context (tooltip, dropdown, nav highlight, etc.).
- Use `createSingleton()` when only one floating element should exist at a time (global tooltips, context menus).
- Place singleton definitions in `<script module>` for module-level sharing.

## Actions & Triggers

- Use Svelte 5 actions for all bindings:
  - `use:float` — marks the floating element
  - `use:float.ref` — marks the reference/anchor element
  - `use:float.arrow` — marks the arrow element
  - `use:float.tether` / `use:float.untether` — for temporary attachments
  - `use:float.virtual` / `use:float.unvirtual` — for cursor/coordinate-based positioning

- Pass event strings to trigger on DOM events:
  ```svelte
  <a use:float.tether={'mouseenter'}>Hover me</a>
  <div use:float.untether={'pointerleave'}>Container</div>
  ```

- Pass reactive functions for conditional triggers:
  ```svelte
  <a use:float.ref={() => isActive}>Active link</a>
  ```

## Conditional Rendering

- Conditionally render floating elements using `{#if}` blocks:
  ```svelte
  {#if float.referenced}
    <div use:float>Floating content</div>
  {/if}
  ```

- Use `float.tethered` to check if temporarily attached:
  ```svelte
  {#if float.tethered}
    <div use:float>Hover indicator</div>
  {/if}
  ```

- Use `float.attached` to get whichever element is currently the target (tether ?? ref).

## Tethering Patterns

- Use tethering for temporary hover states while keeping a persistent reference:
  ```svelte
  <a 
    use:float.tether={'mouseenter'}
    use:float.ref={() => isCurrentPage}
  >Link</a>
  ```

- Place `use:float.untether` on a parent container for pointer-leave:
  ```svelte
  <nav use:float.untether={'pointerleave'}>
    {#each links as link}
      <a use:float.tether={'mouseenter'}>...</a>
    {/each}
  </nav>
  ```

- Control tether/untether behavior on the float itself:
  ```svelte
  <!-- Hover indicator: follows tether, ignores ref -->
  <div use:float={{ untether: false }}>Hover highlight</div>
  
  <!-- Active indicator: follows ref, ignores tether -->
  <div use:float={{ tether: false }}>Active highlight</div>
  ```

## Positioning & Middleware

- Always include `offset()` for visual spacing from the reference.
- Include `flip()` and `shift()` for viewport-aware repositioning.
- Place `arrow()` last in the middleware array.
- Use `float.placement` to reactively read the computed placement (after flip/shift).

## Overlays & Portals

- Use `portal` action to escape stacking contexts:
  ```svelte
  <div use:float use:portal>Modal content</div>
  ```

- Use `overlay` action for backdrops with scroll locking:
  ```svelte
  <div use:overlay class="backdrop" onclick={close}></div>
  ```

## Accessibility

- Add keyboard escape handling for dismissible UI.
- Include appropriate ARIA roles (`role="tooltip"`, `role="menu"`, `role="dialog"`).
- Manage focus for modals and menus.
- Use `aria-haspopup` and `aria-expanded` on trigger elements.
