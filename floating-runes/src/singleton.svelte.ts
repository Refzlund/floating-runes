/**
 * Singleton floating element factory for floating-runes.
 * 
 * Creates a callable action that manages a single floating element instance
 * shared across multiple trigger elements. The singleton itself IS the action,
 * enabling minimal syntax: `use:tooltip={content}`.
 * 
 * @example
 * ```svelte
 * // TooltipRoot.svelte
 * <script module lang='ts'>
 *     import { createSingleton, offset, flip, shift, arrow } from 'floating-runes'
 *     
 *     export const tooltip = createSingleton({
 *         placement: 'top',
 *         middleware: [offset(8), flip(), shift(), arrow()],
 *         showDelay: 200
 *     })
 * </script>
 * 
 * <script lang='ts'>
 *     import { portal } from 'floating-runes'
 * </script>
 * 
 * {#if tooltip.visible}
 *     <div use:tooltip.float use:portal class='tooltip'>
 *         {#if typeof tooltip.content === 'string'}
 *             {tooltip.content}
 *         {:else if tooltip.content}
 *             {@render tooltip.content()}
 *         {/if}
 *         <div use:tooltip.arrow class='arrow'></div>
 *     </div>
 * {/if}
 * ```
 * 
 * Then use anywhere:
 * ```svelte
 * import { tooltip } from './TooltipRoot.svelte'
 * 
 * <button use:tooltip={'Save changes'}>Save</button>
 * <button use:tooltip={mySnippet}>Advanced</button>
 * ```
 */

import type {
	Middleware,
	Placement,
	MiddlewareData,
	VirtualElement
} from '@floating-ui/dom'
import type { Snippet } from 'svelte'
import type { Action, ActionReturn } from 'svelte/action'
import { on } from 'svelte/events'
import { createSubscriber } from 'svelte/reactivity'
import floatingUI, { offset, flip, shift, arrow as arrowMiddleware, type FloatingRuneOptions } from './floating-ui.svelte.js'


// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/** Standard DOM events that can trigger show/hide */
export type StandardTriggerEvent = 'pointerenter' | 'pointerleave' | 'focus' | 'blur' | 'click' | 'contextmenu'

/** Custom events handled specially */
export type CustomTriggerEvent = 'clickOutside' | 'escape'

/** All trigger events */
export type TriggerEvent = StandardTriggerEvent | CustomTriggerEvent

export interface SingletonOptions extends Omit<FloatingRuneOptions, 'middleware'> {
	/** Floating UI middleware @default [offset(8), flip(), shift(), arrow()] */
	middleware?: Middleware[]
	/** Delay before showing (ms) @default 0 */
	showDelay?: number
	/** Delay before hiding (ms) @default 0 */
	hideDelay?: number
	/** Events that trigger show @default ['pointerenter', 'focus'] */
	showOn?: TriggerEvent | TriggerEvent[]
	/** Events that trigger hide @default ['pointerleave', 'blur'] */
	hideOn?: TriggerEvent | TriggerEvent[]
}

export interface TriggerOptions<T> {
	/** The content to display */
	content: T
	/** Override default showDelay for this trigger */
	showDelay?: number
	/** Override default hideDelay for this trigger */
	hideDelay?: number
	/** Disable this trigger */
	disabled?: boolean
}

/**
 * A singleton floating element that is callable as an action.
 * 
 * Use directly: `use:tooltip={content}`
 * Or with sub-actions: `use:tooltip.float`, `use:tooltip.arrow`
 */
export interface Singleton<T = string | Snippet> {
	/** 
	 * Call directly as an action to attach trigger behavior.
	 * @example <button use:tooltip={'Hello'}>Hover me</button>
	 */
	(node: HTMLElement, content: T | TriggerOptions<T>): ActionReturn<T | TriggerOptions<T>>

	/** Whether the singleton is currently visible */
	readonly visible: boolean
	/** Current content being displayed */
	readonly content: T | undefined
	/** Computed placement after flip/shift */
	readonly placement: Placement | undefined
	/** Full middleware data */
	readonly middlewareData: MiddlewareData | undefined
	/** Current anchor/trigger element (if DOM-based) */
	readonly anchor: HTMLElement | undefined

	/**
	 * Action for the floating element.
	 * @example <div use:tooltip.float>...</div>
	 */
	float: Action<HTMLElement>

	/**
	 * Action for the arrow element.
	 * @example <div use:tooltip.arrow></div>
	 */
	arrow: Action<HTMLElement>

	/** Programmatically show with content and anchor */
	show(content: T, anchor?: HTMLElement | VirtualElement | { x: number; y: number }): void
	/** Programmatically hide */
	hide(): void
}


// ─────────────────────────────────────────────────────────────────────────────
// Implementation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a singleton floating element (tooltip, popover, menu, etc.)
 * 
 * The returned singleton is callable as an action: `use:tooltip={content}`
 * 
 * NOTE: This function can be called at module level (in `<script module>`).
 * The floatingUI instance is created lazily on first use within a component context.
 * 
 * @example
 * ```ts
 * const tooltip = createSingleton({ placement: 'top', showDelay: 200 })
 * ```
 */
export function createSingleton<T = string | Snippet>(
	options: SingletonOptions = {}
): Singleton<T> {
	const {
		placement: initialPlacement = 'top',
		middleware = [offset(8), flip(), shift(), arrowMiddleware()],
		showDelay: defaultShowDelay = 0,
		hideDelay: defaultHideDelay = 0,
		showOn = ['pointerenter', 'focus'],
		hideOn = ['pointerleave', 'blur'],
		...floatOptions
	} = options

	// Normalize event arrays
	const showEvents = Array.isArray(showOn) ? showOn : [showOn]
	const hideEvents = Array.isArray(hideOn) ? hideOn : [hideOn]

	// ─────────────────────────────────────────────────────────
	// Lazy Floating UI instance (created on first use in component context)
	// ─────────────────────────────────────────────────────────

	let float: ReturnType<typeof floatingUI> | undefined

	function getFloat() {
		if (!float) {
			float = floatingUI({
				...floatOptions,
				placement: initialPlacement,
				middleware
			})
		}
		return float
	}

	// ─────────────────────────────────────────────────────────
	// Non-reactive state (module-safe - no $state runes)
	// Uses createSubscriber for manual reactivity notifications
	// ─────────────────────────────────────────────────────────

	let _visible = false
	let _content: T | undefined = undefined
	let _anchor: HTMLElement | undefined = undefined

	let showTimer: ReturnType<typeof setTimeout> | undefined
	let hideTimer: ReturnType<typeof setTimeout> | undefined

	// Subscriber for external reactivity
	let notifySubscribers: undefined | (() => void)
	const subscribe = createSubscriber(_notify => notifySubscribers = _notify)

	// ─────────────────────────────────────────────────────────
	// Show / Hide Logic
	// ─────────────────────────────────────────────────────────

	function clearTimers() {
		if (showTimer) clearTimeout(showTimer)
		if (hideTimer) clearTimeout(hideTimer)
		showTimer = undefined
		hideTimer = undefined
	}

	function doShow(newContent: T, newAnchor: HTMLElement | undefined) {
		clearTimers()
		_content = newContent
		_anchor = newAnchor
		_visible = true
		
		// Set the reference on the floatingUI instance BEFORE notifying subscribers
		// This ensures the floating element has a reference when it renders
		if (newAnchor) {
			getFloat().ref(newAnchor)
		}
		
		notifySubscribers?.()
	}

	function doHide() {
		clearTimers()
		_visible = false
		// Keep content/anchor briefly for exit animations
		notifySubscribers?.()
	}

	function scheduleShow(newContent: T, newAnchor: HTMLElement, delay: number) {
		clearTimers()
		if (delay <= 0) {
			doShow(newContent, newAnchor)
		} else {
			showTimer = setTimeout(() => doShow(newContent, newAnchor), delay)
		}
	}

	function scheduleHide(delay: number) {
		clearTimers()
		if (delay <= 0) {
			doHide()
		} else {
			hideTimer = setTimeout(doHide, delay)
		}
	}

	// ─────────────────────────────────────────────────────────
	// Content storage per trigger
	// ─────────────────────────────────────────────────────────

	const triggerData = new WeakMap<HTMLElement, { content: T; showDelay: number; hideDelay: number; disabled: boolean }>()

	function normalizeOptions(param: T | TriggerOptions<T>): TriggerOptions<T> {
		if (param && typeof param === 'object' && 'content' in param) {
			return param as TriggerOptions<T>
		}
		return { content: param as T }
	}

	// ─────────────────────────────────────────────────────────
	// The callable action (trigger behavior)
	// ─────────────────────────────────────────────────────────

	// ─────────────────────────────────────────────────────────
	// Document-level event handlers for clickOutside and escape
	// ─────────────────────────────────────────────────────────

	let floatingNode: HTMLElement | undefined
	let documentCleanups: (() => void)[] = []
	const activeTriggers = new Set<HTMLElement>()

	function setupDocumentListeners() {
		if (documentCleanups.length > 0) return // Already set up

		if (hideEvents.includes('clickOutside')) {
			const handleClickOutside = (e: Event) => {
				if (!_visible) return
				const target = e.target as Node
				// Check if click is outside both anchor and floating element
				const clickedAnchor = _anchor?.contains(target) ?? false
				const clickedFloating = floatingNode?.contains(target) ?? false
				if (!clickedAnchor && !clickedFloating) {
					doHide()
				}
			}
			// Use capture phase to catch clicks before they're stopped
			documentCleanups.push(on(document, 'pointerdown', handleClickOutside, { capture: true }))
		}

		if (hideEvents.includes('escape')) {
			const handleEscape = (e: KeyboardEvent) => {
				if (!_visible) return
				if (e.key === 'Escape') {
					doHide()
				}
			}
			documentCleanups.push(on(document, 'keydown', handleEscape))
		}
	}

	// Standard DOM events (filter out custom events)
	const standardShowEvents = showEvents.filter(e => !['clickOutside', 'escape'].includes(e as string))
	const standardHideEvents = hideEvents.filter(e => !['clickOutside', 'escape'].includes(e as string))

	function triggerAction(node: HTMLElement, param: T | TriggerOptions<T>): ActionReturn<T | TriggerOptions<T>> {
		// Initialize float lazily when action is first used (within component context)
		const floatInstance = getFloat()
		
		// Set up document listeners once
		setupDocumentListeners()
		activeTriggers.add(node)
		
		const opts = normalizeOptions(param)
		triggerData.set(node, {
			content: opts.content,
			showDelay: opts.showDelay ?? defaultShowDelay,
			hideDelay: opts.hideDelay ?? defaultHideDelay,
			disabled: opts.disabled ?? false
		})

		const cleanups: (() => void)[] = []

		function handleShow() {
			const data = triggerData.get(node)
			if (!data || data.disabled) return
			scheduleShow(data.content, node, data.showDelay)
		}

		function handleHide() {
			const data = triggerData.get(node)
			if (!data) return
			scheduleHide(data.hideDelay)
		}

		// Attach standard DOM event listeners
		for (const evt of standardShowEvents) {
			cleanups.push(on(node, evt, handleShow))
		}
		for (const evt of standardHideEvents) {
			cleanups.push(on(node, evt, handleHide))
		}

		return {
			update(newParam) {
				const newOpts = normalizeOptions(newParam)
				triggerData.set(node, {
					content: newOpts.content,
					showDelay: newOpts.showDelay ?? defaultShowDelay,
					hideDelay: newOpts.hideDelay ?? defaultHideDelay,
					disabled: newOpts.disabled ?? false
				})
				// Update content if this is the active trigger
				if (_anchor === node && _visible) {
					_content = newOpts.content
					notifySubscribers?.()
				}
			},
			destroy() {
				cleanups.forEach(cleanup => cleanup())
				triggerData.delete(node)
				activeTriggers.delete(node)
				if (_anchor === node) {
					doHide()
				}
				// Clean up document listeners if no more triggers are active
				if (activeTriggers.size === 0) {
					documentCleanups.forEach(cleanup => cleanup())
					documentCleanups = []
				}
			}
		}
	}

	// ─────────────────────────────────────────────────────────
	// Build the singleton object with callable + properties
	// ─────────────────────────────────────────────────────────

	const singleton = triggerAction as Singleton<T>

	// Define all properties and methods
	Object.defineProperties(singleton, {
		visible: {
			get() {
				subscribe()
				return _visible
			},
			enumerable: true
		},
		content: {
			get() {
				subscribe()
				return _content
			},
			enumerable: true
		},
		placement: {
			get() {
				return float?.placement
			},
			enumerable: true
		},
		middlewareData: {
			get() {
				// MiddlewareData is not directly exposed by floatingUI
				// Arrow data and placement are available via dedicated getters
				return undefined
			},
			enumerable: true
		},
		anchor: {
			get() {
				subscribe()
				return _anchor
			},
			enumerable: true
		},
		float: {
			value: (node: HTMLElement) => {
				floatingNode = node
				const result = getFloat()(node)
				// Track when floating element is destroyed
				const originalDestroy = result?.destroy
				return {
					...result,
					destroy() {
						floatingNode = undefined
						originalDestroy?.()
					}
				}
			},
			enumerable: true
		},
		arrow: {
			value: (node: HTMLElement) => getFloat().arrow(node),
			enumerable: true
		},
		show: {
			value: (newContent: T, newAnchor?: HTMLElement | VirtualElement | { x: number; y: number }) => {
				const floatInstance = getFloat()
				clearTimers()
				_content = newContent
				_visible = true

				if (!newAnchor) {
					// No anchor - pure programmatic show
					_anchor = undefined
				} else if ('tagName' in newAnchor) {
					// HTMLElement
					_anchor = newAnchor as HTMLElement
					floatInstance.ref(_anchor)
				} else if ('getBoundingClientRect' in newAnchor) {
					// VirtualElement
					_anchor = undefined
					floatInstance.virtual(newAnchor)
				} else {
					// { x, y } coordinates
					_anchor = undefined
					floatInstance.virtual({
						getBoundingClientRect: () => ({
							width: 0,
							height: 0,
							x: newAnchor.x,
							y: newAnchor.y,
							top: newAnchor.y,
							left: newAnchor.x,
							right: newAnchor.x,
							bottom: newAnchor.y
						})
					})
				}

				notifySubscribers?.()
			},
			enumerable: true
		},
		hide: {
			value: () => {
				clearTimers()
				doHide()
			},
			enumerable: true
		}
	})

	return singleton
}

export default createSingleton
