# Workflows

## Implement a Basic Tooltip

1. **Create the floatingUI instance** with appropriate middleware:
   ```ts
   const float = floatingUI({ 
     placement: 'top',
     middleware: [offset(8), flip(), shift()] 
   })
   ```

2. **Mark the reference element** with `use:float.ref`:
   ```svelte
   <button use:float.ref onmouseenter={() => show = true} onmouseleave={() => show = false}>
   ```

3. **Conditionally render the floating element**:
   ```svelte
   {#if show}
     <div use:float role="tooltip">Content</div>
   {/if}
   ```

4. **Add portal if needed** to escape stacking contexts:
   ```svelte
   <div use:float use:portal>Content</div>
   ```

---

## Implement a Navigation Highlight (Tethering)

1. **Create a floatingUI instance** (no middleware needed for same-container positioning):
   ```ts
   const float = floatingUI()
   ```

2. **On each nav item**, set up both tether and ref:
   ```svelte
   <a 
     use:float.tether={'mouseenter'}
     use:float.ref={() => isActive}
   >Link</a>
   ```

3. **On the container**, set up untether:
   ```svelte
   <nav use:float.untether={'pointerleave'}>
   ```

4. **Render two floating elements** — one for hover, one for active:
   ```svelte
   {#if float.tethered}
     <div class="hover-highlight" use:float={{ untether: false }}></div>
   {/if}
   {#if float.referenced}
     <div class="active-highlight" use:float={{ tether: false }}></div>
   {/if}
   ```

5. **Style with transitions** on `left` and `width` for smooth movement.

---

## Implement a Dropdown Menu

1. **Create instance** with `placement: 'bottom-start'`:
   ```ts
   const float = floatingUI({ 
     placement: 'bottom-start',
     middleware: [offset(4), flip(), shift()] 
   })
   ```

2. **Toggle on click**:
   ```svelte
   <button use:float.ref onclick={() => open = !open} aria-haspopup="menu" aria-expanded={open}>
   ```

3. **Render menu with portal**:
   ```svelte
   {#if open}
     <div use:float use:portal role="menu">...</div>
   {/if}
   ```

4. **Close on Escape and click outside**:
   ```svelte
   <svelte:window onkeydown={e => e.key === 'Escape' && (open = false)} onclick={() => open = false} />
   ```

---

## Implement a Context Menu

1. **Create instance** with `strategy: 'fixed'`:
   ```ts
   const float = floatingUI({ 
     strategy: 'fixed',
     placement: 'right-start',
     middleware: [offset(2), flip(), shift()] 
   })
   ```

2. **Handle right-click** to set virtual position:
   ```ts
   function handleContextMenu(e: MouseEvent) {
     e.preventDefault()
     float.virtual({ getBoundingClientRect: () => ({
       width: 0, height: 0,
       x: e.clientX, y: e.clientY,
       top: e.clientY, left: e.clientX,
       right: e.clientX, bottom: e.clientY
     })})
     open = true
   }
   ```

3. **Close and clear virtual** on dismiss:
   ```ts
   function close() {
     open = false
     float.unvirtual()
   }
   ```

---

## Implement a Global Singleton Tooltip

1. **Create singleton in `<script module>`**:
   ```svelte
   <script module lang='ts'>
     export const tooltip = createSingleton({
       placement: 'top',
       middleware: [offset(8), flip(), shift(), arrow()],
       showDelay: 200
     })
   </script>
   ```

2. **Render the floating element once** (e.g., in layout or root):
   ```svelte
   {#if tooltip.visible}
     <div use:tooltip.float use:portal>...</div>
   {/if}
   ```

3. **Use anywhere** with simple action:
   ```svelte
   <button use:tooltip={'Tooltip text'}>Hover</button>
   ```

---

## Implement a Modal with Backdrop

1. **Use the overlay action** for the backdrop:
   ```svelte
   <div use:overlay class="backdrop" onclick={close}></div>
   ```

2. **Portal the modal** to escape stacking:
   ```svelte
   <div use:portal class="modal" role="dialog" aria-modal="true">...</div>
   ```

3. **Handle Escape** to close:
   ```svelte
   <svelte:window onkeydown={e => e.key === 'Escape' && close()} />
   ```

---

## Debug Positioning Issues

| Symptom | Likely Cause | Solution |
|---------|--------------|----------|
| Floating element doesn't appear | Missing `use:float` or conditional not true | Check `{#if}` condition and action binding |
| Position is wrong | Missing or incorrect `use:float.ref` | Ensure ref is on the anchor element |
| Clipped by container | Stacking context issue | Add `use:portal` to float |
| Arrow points wrong direction | Missing `arrow()` middleware | Add `arrow()` as last middleware |
| Jumps on scroll/resize | Missing autoUpdate | Enabled by default; check if disabled |
| Flickers on hover | Untether on each element | Move `use:float.untether` to container |

---

## API Quick Reference

### floatingUI Options
```ts
{
  placement?: Placement        // 'top' | 'bottom' | 'left' | 'right' | ...
  strategy?: 'absolute' | 'fixed'
  middleware?: Middleware[]    // [offset(), flip(), shift(), arrow()]
  autoUpdate?: AutoUpdateOptions
  autoPosition?: boolean       // default: true
}
```

### Float Actions
```
use:float               — The floating element
use:float.ref           — The reference/anchor element
use:float.arrow         — The arrow element
use:float.tether        — Temporary attachment (hover)
use:float.untether      — Clear temporary attachment
use:float.virtual       — Virtual element positioning
use:float.unvirtual     — Clear virtual element
```

### Float Options (on `use:float={options}`)
```ts
{
  tether?: boolean    // Whether to follow tethered element (default: true)
  untether?: boolean  // Whether to respect untether (default: true)
}
```

### Reactive Getters
```
float.attached    — Current target (tether ?? ref)
float.tethered    — Tethered element or undefined
float.referenced  — Referenced element or undefined
float.placement   — Computed placement after flip/shift
```

### Singleton API
```
singleton(node, content)  — Action to attach trigger
singleton.float           — Action for floating element
singleton.arrow           — Action for arrow element
singleton.visible         — Whether currently visible
singleton.content         — Current content
singleton.anchor          — Current anchor element
singleton.show(content, anchor)  — Programmatic show
singleton.hide()          — Programmatic hide
```

### Utility Actions
```
use:overlay        — Backdrop with scroll lock
use:portal         — Move element to document.body
```
