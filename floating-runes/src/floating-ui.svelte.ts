import {
	type ArrowOptions as TArrowOptions,
	type AutoUpdateOptions,
	type ComputePositionConfig,
	type ComputePositionReturn,
	type Derivable,
	type VirtualElement,
	autoUpdate,
	computePosition,
	arrow as _arrow,
	type Middleware,
	type Placement
} from '@floating-ui/dom'
import { on } from 'svelte/events'
import { SvelteMap, createSubscriber } from 'svelte/reactivity'

export type {
	AutoUpdateOptions,
	ComputePositionConfig,
	ComputePositionReturn,
	Derivable,
	Middleware,
	MiddlewareData,
	Placement,
	Platform,
	VirtualElement
} from '@floating-ui/dom'

export {
	offset,
	shift,
	flip,
	size,
	autoPlacement,
	hide,
	inline,
	platform
} from '@floating-ui/dom'


interface ArrowOptions extends Omit<TArrowOptions, 'element'> {}
const arrowSymbol = Symbol('floating-runes.arrow')
export function arrow(options: ArrowOptions | Derivable<ArrowOptions> = {}) {
	const empty = {} as Middleware
	Object.assign(empty, { [arrowSymbol]: options })
	return empty as Middleware
}


export interface FloatingRuneOptions extends Partial<Omit<ComputePositionConfig, 'autoUpdate' | 'placement' | 'strategy'>> {
	autoUpdate?: AutoUpdateOptions
	/**
	 * Whether or not to auto-position the floating element and the arrow, 
	 * and auto-assign the `position:` to the strategy (absolute/fixed).
	 * 
	 * @default true
	*/
	autoPosition?: boolean

	/**
	 * Where to place the floating element relative to its reference element
	 * @default 'bottom'
	*/
	placement?: Placement

	/**
	 * The type of CSS position property to use
	 * @default 'absolute'
	*/
	strategy?: 'absolute' | 'fixed'
}

interface FloatOptions {
	/**
	 * Whether-to-tether.
	 * @default true
	*/
	tether?: boolean

	/**
	 * If `false` it will stick to the last tethered target,
	 * instead of going back to the reference.
	 * @default true
	*/
	untether?: boolean
}

/** Svelte 5, $effect-driven `@floating-ui/dom`
 * 
 * @example
 * ```html
 * <script lang='ts'>
 *     ...
 * 
 *     let float = floatingUI({
 *         placement: 'top',
 *         middleware: [
 *             flip(),
 *             shift()
 *         ]
 *     }).then(...) // optional
 * </script>
 *
 * <span use:float.ref onmouseenter={...}>
 *     This is some text
 * </span>
 * {#if showTooltip}
 *     <span use:float> My tooltip </span>
 * {/if}
 * ```
*/
function floatingUI(options: FloatingRuneOptions = {}) {
	/** <float, arrow> */
	const arrowMap = new WeakMap<HTMLElement, HTMLElement>()
	const floatMap = new SvelteMap<HTMLElement, FloatOptions>()
	
	const arrowIndex = options.middleware?.findIndex(m => m && typeof m === 'object' && arrowSymbol in m)
	const middlewareMap = new WeakMap<HTMLElement, Middleware[]>

	let trigger: undefined | (() => void)
	const subscribe = createSubscriber(_trigger => trigger = _trigger)

	let ref = $state(undefined as HTMLElement | VirtualElement | undefined)
	let then = $state(undefined as ((computed: ComputePositionReturn) => void) | undefined)
	let tether = $state(undefined as HTMLElement | undefined)
	let currentPlacement = $state(undefined as Placement | undefined)

	function createVirtualElement(x: number, y: number): VirtualElement {
		return {
			getBoundingClientRect: () => ({
				width: 0,
				height: 0,
				x,
				y,
				top: y,
				left: x,
				right: x,
				bottom: y
			})
		}
	}

	function setFloat(node: HTMLElement, options: FloatOptions = {}) {
		// Register effect on first float attachment (ensures component context)
		registerEffect()
		
		floatMap.set(node, options)
		return {
			destroy: () => {
				if (floatMap.has(node)) floatMap.delete(node)
			}
		}
	}

	const value = {
		/** Returns tethered element if any, otherwise referenced element if any. */
		get attached() {
			subscribe()
			return tether ?? ref
		},
		/** If tethered, returns the tethered element */
		get tethered() {
			subscribe()
			return tether
		},
		/** If it has a reference, returns the referenced element */
		get referenced() {
			subscribe()
			return ref
		},
		/** The current placement (reactive, updates when floatingUI flips/shifts) */
		get placement() {
			subscribe()
			return currentPlacement
		},
		/**
		 * `use:float.ref` on what you want the reference element
		 * that the floating element positions relative to
		 */
		ref(node: HTMLElement, trigger?: (() => boolean) | keyof WindowEventMap) {
			if (typeof trigger === 'function') {
				$effect(() => {
					if (trigger()) {
						ref = node
					}
				})
				if (trigger()) {
					ref = node
				}
			}
			else if (typeof trigger === 'string') {
				$effect(() => on(node, trigger, () => ref = node))
			}
			else {
				ref = node
			}

			return {
				destroy: () => {
					if (ref === node) ref = undefined
				}
			}
		},
		/**
		 * Remove reference.
		 * @param node - Node event is attached to
		 * @param trigger - A callback function with a returning boolean value, or an event-string
		*/
		unref(node?: HTMLElement, trigger?: (() => boolean) | keyof WindowEventMap) {
			if (typeof trigger === 'function') {
				$effect(() => {
					if (trigger()) {
						ref = undefined
					}
				})
				if (trigger()) {
					ref = undefined
				}
			}
			else if (typeof trigger === 'string') {
				$effect(() => on(node!, trigger, () => ref = undefined))
			}
			else {
				ref = undefined
			}
		},
		/**
		 * Set a virtual element as the reference.
		 * Useful for context menus, mouse-following tooltips, etc.
		 * 
		 * Can be used as:
		 * - Method: float.virtual({ getBoundingClientRect: () => ... })
		 * - Reactive getter: float.virtual(() => ({ x, y })) - reactively updates from $state
		 * - Action: use:float.virtual={'pointermove'} - follows pointer on that event
		 */
		virtual(node: HTMLElement | VirtualElement | (() => { x: number; y: number } | undefined), trigger?: keyof WindowEventMap) {
			// If it's a reactive getter function, set up an effect
			if (typeof node === 'function') {
				const getter = node
				$effect(() => {
					const coords = getter()
					if (coords) {
						ref = createVirtualElement(coords.x, coords.y)
					} else {
						ref = undefined
					}
				})
				return
			}
			
			if (node instanceof HTMLElement) {
				if (typeof trigger === 'string') {
					const cleanup = on(node, trigger, (e: Event) => {
						if (e instanceof MouseEvent || e instanceof PointerEvent) {
							ref = createVirtualElement(e.clientX, e.clientY)
						}
					})
					return {
						destroy: () => cleanup()
					}
				}

				ref = node
				return {
					destroy: () => {
						if (ref === node) ref = undefined
					}
				}
			}

			// Otherwise it's a VirtualElement (has getBoundingClientRect), use it directly
			if ('getBoundingClientRect' in node) {
				ref = node as VirtualElement
				return {
					destroy: () => {
						if (ref === node) ref = undefined
					}
				}
			}

			return {
				destroy: () => {}
			}
		},
		/**
		 * Clear the virtual reference.
		 * 
		 * Can be used as:
		 * - Method: float.unvirtual()
		 * - Action: use:float.unvirtual={'pointerleave'}
		 */
		unvirtual(node?: HTMLElement, trigger?: keyof WindowEventMap) {
			if (typeof trigger === 'string' && node) {
				const cleanup = on(node, trigger, () => {
					ref = undefined
				})
				return {
					destroy: () => cleanup()
				}
			}

			ref = undefined

			return {
				destroy: () => {}
			}
		},
		/**
		 * Any additional logic according to https://floating-ui.com/docs
		 */
		then(cb: (computed: ComputePositionReturn) => void) {
			then = cb
			return setFloat as SvelteFloatingUI
		},
		/**
		 * You can do use:float.tether and do float.untether()
		 * to attach the floating element to a temporary target.
		 */
		tether(node: HTMLElement, trigger?: (() => boolean) | keyof WindowEventMap) {
			if (typeof trigger === 'function') {
				$effect(() => {
					if (trigger()) {
						tether = node
					}
				})
				if(trigger()) {
					tether = node
				}
			}
			else if (typeof trigger === 'string') {
				$effect(() => on(node, trigger, () => tether = node))
			}
			else {
				tether = node
			}

			return {
				destroy: () => {
					if (tether === node) tether = undefined
				}
			}
		},
		/**
		 * You can do use:float.tether and do float.untether()
		 * to attach the floating element to a temporary target.
		 * 
		 * Or even `use:float.untether={() => condition}` or `{'pointerexit'}`
		*/
		untether(node?: HTMLElement, trigger?: (() => boolean) | keyof WindowEventMap) {
			if (typeof trigger === 'function') {
				$effect(() => {
					if (trigger()) {
						tether = undefined
					}
				})
			} else if(typeof trigger === 'string') {
				$effect(() => on(node!, trigger, () => tether = undefined))
			}

			tether = undefined
		},
		arrow(node: HTMLElement) {
			arrowMap.set(node.parentElement!, node)
			return {
				destroy: () => {
					if (arrowMap.has(node.parentElement!)) arrowMap.delete(node.parentElement!)
				}
			}
		},
		compute() {
			for (const [float, floatOptions] of floatMap) {
				compute(float, options, floatOptions)()
			}
		}
	}

	Object.assign(setFloat, value)
	// * When using Object.assign, getters doesn't seem to carry over.
	Object.defineProperties(setFloat, {
		attached: { get() { return value.attached } },
		tethered: { get() { return value.tethered } },
		referenced: { get() { return value.referenced } },
		placement: { get() { return value.placement } },
	})

	const compute = (float: HTMLElement, options: FloatingRuneOptions, floatOptions: FloatOptions) => {
		let middleware = middlewareMap.get(float)
		let arrow = arrowMap.get(float)

		if (!middleware) {
			middleware = [...(options.middleware || [])] as Middleware[]

			// * Modify the arrow middleware, to target the relevant arrow element
			if (arrowIndex !== undefined && arrowIndex !== -1) {
				const opts = options.middleware?.find(m => m && typeof m === 'object' && arrowSymbol in m) as
					| { [arrowSymbol]: ArrowOptions }
					| undefined
				middleware[arrowIndex] = _arrow({
					...opts?.[arrowSymbol],
					get element() {
						if (arrow) {
							return arrow
						}
						arrow = arrowMap.get(float)
						return arrow!
					}
				})
				
				middlewareMap.set(float, middleware)
			}
		}
		
		return () => {
			if (!ref || !float) return
			options.strategy ??= 'absolute'
			const target = (floatOptions.tether !== false && tether) || (floatOptions.untether !== false && ref)
			if(!target) return
			computePosition(target, float, {
				...options,
				middleware
			}).then((v) => {
				// Update reactive placement
				currentPlacement = v.placement

				if (options.autoPosition === false) {
					then?.(v)
					return
				}

				Object.assign(float!.style, {
					position: options.strategy!,
					left: `${v.x}px`,
					top: `${v.y}px`
				})

				if(arrow) {
					const { x, y } = v.middlewareData.arrow || {}
					const side = v.placement.split('-')[0] as 'top' | 'right' | 'bottom' | 'left'

					const staticSide = {
						top: 'bottom',
						right: 'left',
						bottom: 'top',
						left: 'right',
					}[side]!

					// CSS rotation for arrow pointing toward reference
					const rotation = {
						top: '180deg',
						right: '270deg',
						bottom: '0deg',
						left: '90deg',
					}[side]!

					Object.assign(arrow.style, {
						position: options.strategy!,
						left: x != null ? `${x}px` : '',
						top: y != null ? `${y}px` : '',
						right: '',
						bottom: '',
						[staticSide]: '-4px'
					})

					// Set CSS custom properties for arrow styling
					arrow.style.setProperty('--float-side', side)
					arrow.style.setProperty('--float-rotation', rotation)
					arrow.style.setProperty('--float-placement', v.placement)
				}

				then?.(v)
				trigger?.()
			})
		}
	}
	

	let cleanup: (() => void)[] = []
	let effectRegistered = false

	/**
	 * Registers the $effect.pre for autoUpdate.
	 * This is deferred until setFloat is called, ensuring we're in a component context.
	 */
	function registerEffect() {
		if (effectRegistered) return
		effectRegistered = true

		$effect.pre(() => {
			// Clean up previous autoUpdate subscriptions
			cleanup.forEach(cb => cb())
			cleanup = []

			if (!ref || floatMap.size === 0) return
			
			for (const [float, floatOptions] of floatMap) {
				const computeFn = compute(float, options, floatOptions)
				// Run initial computation
				computeFn()
				// Set up autoUpdate
				cleanup.push(
					autoUpdate(tether || ref, float, computeFn, options.autoUpdate)
				)
			}

			// Cleanup when effect is destroyed (component unmounts)
			return () => {
				cleanup.forEach(cb => cb())
				cleanup = []
				// Reset flag so a new effect can be registered in a new component context
				effectRegistered = false
			}
		})
	}

	type SvelteFloatingUI = typeof setFloat & typeof value
	return setFloat as SvelteFloatingUI
}

export interface Float extends ReturnType<typeof floatingUI> {}
export interface FloatingUI {
	(options?: FloatingRuneOptions): Float
}

export default floatingUI as FloatingUI